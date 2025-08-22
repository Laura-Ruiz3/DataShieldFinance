import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PortfolioTable from '../components/PortfolioTable';
import StocksSidebar from '../components/StocksSidebar';
import ModifyPortfolioButton from "../components/ModifyPortfolioButton";
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Container, Grid, Snackbar, Typography } from '@mui/material';
import Tooltip from "@mui/material/Tooltip";
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import PortfolioHoldings from '../components/PortfolioHoldings.jsx';
import CreateAssetButton from "../components/CreateAssetButton";
import DeleteAssetButton from "../components/DeleteAssetButton";
import CreatePortfolioButton from "../components/createPortfolioButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Charts
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

export default function Portfolios() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [holdingsKey, setHoldingsKey] = useState(0);
  const [transactionsKey, setTransactionsKey] = useState(0);

  const handleAssetCreated = (data) => {
    // Refresh both holdings and transactions tables
    setHoldingsKey(prev => prev + 1);
    setTransactionsKey(prev => prev + 1);
    setToast({ open: true, msg: "Asset purchased successfully", severity: "success" });
  };

  const handleAssetDeleted = (data) => {
    // Refresh both holdings and transactions tables
    setHoldingsKey(prev => prev + 1);
    setTransactionsKey(prev => prev + 1);
    setToast({ open: true, msg: "Asset sold successfully", severity: "success" });
  };

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const selectedPortfolio = portfolios.find(p => p.portfolio_id === selected);
  const portfolioDescription = selectedPortfolio?.description || "";

  // ===== PERFORMANCE (línea) =====
  const [performanceData, setPerformanceData] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  const handleUpdated = (err) => {
    if (err) {
      setToast({ open: true, msg: `Error updating portfolio: ${err.message}`, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portfolio updated successfully", severity: "success" });
      fetchPortfolios();
    }
  };

  // Paleta viva para líneas
  const lineColors = {
    pnl: {
      border: '#FF6B6B',            // rojo coral
      background: 'rgba(255,107,107,0.2)',
    },
    mv: {
      border: '#4ECDC4',            // turquesa
      background: 'rgba(78,205,196,0.2)',
    }
  };

  const performanceOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Portfolio Performance (P&L and Market Value)' },
      legend: { position: 'bottom' }
    },
    interaction: { intersect: false, mode: 'index' },
    maintainAspectRatio: false
  };

  const fetchPerformanceData = async (portfolioId) => {
    setLoadingGraph(true);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/performance`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const chartData = {
        labels: (data.history ?? []).map((e) => e.date),
        datasets: [
          {
            label: 'P&L',
            data: (data.history ?? []).map((e) => e.pnl),
            borderColor: lineColors.pnl.border,
            backgroundColor: lineColors.pnl.background,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Market Value',
            data: (data.history ?? []).map((e) => e.marketValue),
            borderColor: lineColors.mv.border,
            backgroundColor: lineColors.mv.background,
            fill: true,
            tension: 0.4,
          }
        ]
      };
      setPerformanceData(chartData);
    } catch (err) {
      console.error("Error fetching performance data:", err);
      setPerformanceData(null);
    } finally {
      setLoadingGraph(false);
    }
  };

  // ===== HOLDINGS (doughnut por valor) =====
  // Guardamos los objetos completos para reutilizar propiedades cuando quieras
  const [holdingsWB, setHoldingsWB] = useState([]); // [{ asset_id, symbol, name, quantity, price_usd, value_usd, weight, ... }]
  const [totalWB, setTotalWB] = useState(0);
  const [loadingHoldings, setLoadingHoldings] = useState(false);

  const fetchHoldingsValueBreakdown = async (portfolioId) => {
    setLoadingHoldings(true);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/holdings/value-breakdown`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setHoldingsWB(Array.isArray(data.holdings) ? data.holdings : []);
      setTotalWB(Number(data.total_value_usd || 0));
    } catch (err) {
      console.error("Error fetching value-breakdown:", err);
      setHoldingsWB([]);
      setTotalWB(0);
    } finally {
      setLoadingHoldings(false);
    }
  };

  // Serie para el chart (sin perder el objeto original)
  const doughnutSeries = useMemo(() => {
    return (holdingsWB ?? []).map(h => ({
      label: h.symbol ?? h.name,
      value: Number(h.value_usd || 0),
      _raw: h
    }));
  }, [holdingsWB]);

  // Paleta viva para la dona
  const vividColors = [
    '#FF6B6B', // rojo coral
    '#4ECDC4', // turquesa
    '#FFD93D', // amarillo brillante
    '#6A4C93', // púrpura
    '#1A936F', // verde esmeralda
    '#FF922B', // naranja fuerte
    '#1982C4', // azul vivo
    '#C1121F', // rojo intenso
    '#00B8D4', // cian
    '#C0CA33', // lima
  ];

  const doughnutData = useMemo(() => ({
    labels: doughnutSeries.map(s => s.label),
    datasets: [{
      label: 'Weight (%)',
      data: doughnutSeries.map(s => s.value),
      backgroundColor: doughnutSeries.map((_, i) => vividColors[i % vividColors.length]),
      borderWidth: 2,
      borderColor: "#ffffff", // borde blanco para contraste
    }]
  }), [doughnutSeries]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left',                 // ⬅️ leyenda a la izquierda
        labels: { usePointStyle: true, padding: 16 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed;
            const pct = totalWB ? ((val / totalWB) * 100).toFixed(2) : "0.00";
            return `${ctx.label}: $${Number(val).toLocaleString()} (${pct}%)`;
          }
        }
      }
    }
  }), [totalWB]);

  // ===== API: Portfolios & acciones =====
  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolios/user/2");
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setPortfolios(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (err) => {
    if (err) {
      setToast({ open: true, msg: `Error creating portfolio: ${err.message}`, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portfolio created successfully", severity: "success" });
      fetchPortfolios();
    }
  };

  const handleDelete = async (portfolioId) => {
    if (!portfolioId) return;
    try {
      const res = await fetch(`/api/portfolios/user/2/portfolio/${portfolioId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setToast({ open: true, msg: "Portfolio deleted successfully", severity: "success" });
      if (selected === portfolioId) setSelected(null);
      await fetchPortfolios();
    } catch (err) {
      setToast({ open: true, msg: `Error deleting portfolio: ${err.message}`, severity: "error" });
    }
  };

  // Initial load
  useEffect(() => { fetchPortfolios(); }, []);

  // On portfolio change, cargar performance + breakdown por valor
  useEffect(() => {
    if (selected) {
      fetchPerformanceData(selected);
      fetchHoldingsValueBreakdown(selected);
    } else {
      setPerformanceData(null);
      setHoldingsWB([]);
      setTotalWB(0);
    }
  }, [selected]);

  const portfolioTitle = (portfolios.find(p => p.portfolio_id === selected)?.name) || "My Portfolio";

  return (
    // Option 2: Percentage with max-width
    // Option 3: Responsive manual widths
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        backgroundColor: '#f5fff7',
        backgroundImage: 'linear-gradient(to bottom, #ffffff, #f0fff5, #e8f8f0)',
        pt: 2,
        pb: 4,
        px: { xs: 2, sm: 3, md: 4 }, // Increase horizontal padding for better visual spacing
        margin: '0 auto', // Center the container
        left: '50%',  // Center positioning
        transform: 'translateX(-50%)', // Ensure perfect centering
        position: 'relative', // Enable the transform
        borderRadius: 2,
        width: {
          xs: '100%', // Full width on mobile
          sm: '95%',  // 95% on small screens
          md: '90%',  // 90% on medium screens
          lg: '1500px' // Fixed width on large screens
        },
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      {/* ===== Portfolio selection tabs ===== */}
      {loading ? (
        <Grid container justifyContent="center" spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3].map((n) => (
            <Grid item key={n}>
              <Box className="px-3 py-1 rounded-full border bg-neutral-100 animate-pulse" sx={{ width: 100 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Typography color="error" sx={{ mb: 2 }}>Error: {error}</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {portfolios.map((p) => (
            <Grid item key={p.portfolio_id}>
              <button
                onClick={() => setSelected(p.portfolio_id)}
                className={`px-3 py-1 rounded-full border ${selected === p.portfolio_id ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
                data-portfolio-id={p.portfolio_id}
              >
                {p.name}
              </button>
            </Grid>
          ))}

          {/* Divider */}
          <Grid item>
            <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 1 }} />
          </Grid>

          {/* Create / Delete */}
          <Grid item>
            <CreatePortfolioButton userId={2} onCreated={handleCreated} />
          </Grid>
          <Grid item>
            <ModifyPortfolioButton
              portfolio={selectedPortfolio}
              onUpdated={handleUpdated}
            />
          </Grid>
          <Grid item>
            {/* Delete Portfolio Button */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#E74C3C", // Softer red that matches theme better
                color: "#FFFFFF",
                // ...rest of the styling
              }}
              startIcon={<FolderDeleteIcon />}
              disabled={!selected}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this portfolio?')) {
                  handleDelete(selected);
                }
              }}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
      )}

      {/* ===== MAIN LAYOUT ===== */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "4fr 8fr" }, // Adjust column ratio
          gridTemplateRows: { xs: "auto", md: "auto auto" },
          alignItems: "stretch",
          borderRadius: 2,
          padding: { xs: 1, sm: 2 }, // Reduce padding to maximize content space
          backgroundColor: '#ffffff',
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease",
          width: '100%',
          boxSizing: 'border-box',
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }
        }}
      >
        {/* LEFT-TOP: Portfolio card */}
        <Box sx={{ minWidth: 0, overflow: "hidden", gridColumn: "1", gridRow: { xs: "auto", md: "1" } }}>
          <Card
            sx={{
              p: 2,
              bgcolor: "#0B5D32",
              color: "#FFFFFF",
              minHeight: 280,
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
              borderRadius: 2,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column", // Changed to column to stack title and description
                gap: 0.5, // Small gap between title and description
                pb: 1.5,
                borderBottom: "1px dashed rgba(255,255,255,0.25)",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%"
              }}>
                <Tooltip title={portfolioTitle}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
                      color: "#FFFFFF",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                      lineHeight: 1.2,
                      flexGrow: 1,
                      minWidth: 0,
                      whiteSpace: { xs: "normal", md: "nowrap" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {portfolioTitle}
                  </Typography>
                </Tooltip>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                  <CreateAssetButton
                    portfolioId={selected}
                    onCreated={handleAssetCreated}
                    buttonProps={{
                      variant: "contained",
                      color: "success",
                      size: isMobile ? "small" : "medium",
                      disabled: selected === null,
                      sx: {
                        borderRadius: 28,
                        transition: "transform 120ms ease",
                        transform: "translateZ(0)",
                        "&:hover": { transform: selected === null ? "none" : "translateY(-1px)" },
                        "&:active": { transform: selected === null ? "none" : "translateY(0px) scale(0.98)" },
                      },
                    }}
                  />

                  <DeleteAssetButton
                    portfolioId={selected}
                    onDeleted={handleAssetDeleted}
                    buttonProps={{
                      variant: "contained",
                      size: isMobile ? "small" : "medium",
                      disabled: selected === null,
                      sx: {
                        backgroundColor: "#4C86E4",
                        color: "#ffffff",
                        borderRadius: 28,
                        transition: "transform 120ms ease, background-color 0.2s ease",
                        transform: "translateZ(0)",
                        "&:hover": {
                          backgroundColor: "#3A75D3",
                          transform: selected === null ? "none" : "translateY(-1px)"
                        },
                        "&:active": {
                          backgroundColor: "#2964C2",
                          transform: selected === null ? "none" : "translateY(0px) scale(0.98)"
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Portfolio Description */}
              {portfolioDescription && (
                <Typography
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    color: "rgba(255, 255, 255, 0.8)",
                    fontStyle: "italic",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {portfolioDescription}
                </Typography>
              )}
            </Box>

            {/* Holdings + Transactions */}
            <Grid container>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    {selected ? (
                      <>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Current Holdings</Typography>
                        <PortfolioHoldings portfolioId={selected} key={`holdings-${holdingsKey}`} />

                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Transaction History</Typography>
                          <PortfolioTable portfolioId={selected} key={`transactions-${transactionsKey}`} />
                        </Box>
                      </>
                    ) : (
                      <Typography sx={{ p: 2, textAlign: 'center' }}>
                        Select a portfolio to view the holdings and transactions
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {/* RIGHT: Charts and StocksSidebar in horizontal layout */}
        <Box
          sx={{
            gridColumn: { xs: "1", md: "2" },
            gridRow: { xs: "auto", md: "1 / span 2" },
            minWidth: 0,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
            gap: 2
          }}
        >
          {/* LEFT SIDE: Charts section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minHeight: 0,
            }}
          >
            {/* Chart 1: Portfolio Performance (línea) */}
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
              <Box sx={{ pb: 1, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontWeight: 600 }}>Portfolio Performance</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: "relative", minHeight: 260 }}>
                {selected ? (
                  loadingGraph ? (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography>Loading performance…</Typography>
                    </Box>
                  ) : performanceData ? (
                    <Box sx={{ position: "absolute", inset: 0, p: 1 }}>
                      <Line data={performanceData} options={performanceOptions} />
                    </Box>
                  ) : (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                      <Typography variant="body2">
                        No performance data from <code>/api/portfolios/{selected}/performance</code>.
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography>Select a portfolio to view performance</Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {/* Chart 2: Holdings Breakdown (Doughnut por valor) */}
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
              <Box sx={{ pb: 1, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontWeight: 600 }}>Holdings Breakdown</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: "relative", minHeight: 260 }}>
                {loadingHoldings ? (
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography>Loading holdings…</Typography>
                  </Box>
                ) : doughnutSeries.length ? (
                  <Box sx={{ position: "absolute", inset: 0, p: 1 }}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </Box>
                ) : (
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography>No holdings to display</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Box>

          {/* RIGHT SIDE: StocksSidebar */}
          <Box sx={{ minWidth: 0, overflow: "hidden" }}>
            <StocksSidebar />
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 24 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          '& .MuiPaper-root': {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }
        }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
