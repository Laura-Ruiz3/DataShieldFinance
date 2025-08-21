// src/pages/Portfolios.jsx
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import PortfolioTable from "../components/PortfolioTable";
import { DUMMY } from "../services/dummy";
import StocksSidebar from "../components/StocksSidebar";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Snackbar,
  Typography,
  Alert,
} from "@mui/material";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

import CreateAssetButton from "../components/CreateAssetButton";
import DeleteAssetButton from "../components/DeleteAssetButton";
import CreatePortfolioButton from "../components/createPortfolioButton";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Portfolios() {
  // Responsive helpers
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Portfolios state
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // ✅ Dynamic title (must be AFTER state declarations)
  const selectedPortfolio = portfolios.find((p) => p.portfolio_id === selected);
  const portfolioTitle = selectedPortfolio?.name || "My Portfolio";

  // Dummy chart data for the middle card
  const rows = DUMMY.holdingsByPortfolio[selected] ?? [];
  const series = useMemo(() => {
    const byType = rows.reduce((m, r) => {
      m[r.type] = (m[r.type] || 0) + Number(r.quantity || 0);
      return m;
    }, {});
    return Object.entries(byType).map(([label, value]) => ({ label, value }));
  }, [rows]);

  // Toast
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const handleCreated = (err) => {
    if (err) {
      setToast({ open: true, msg: `Error creating portfolio: ${err.message}`, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portfolio created successfully", severity: "success" });
      fetchPortfolios();
    }
  };

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

  // Initial load
  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Flowbite Chart.js demo
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (window.Chart && chartRef.current) {
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }

      chartRef.current.chartInstance = new window.Chart(chartRef.current, {
        type: "doughnut",
        data: {
          labels: series.map((s) => s.label),
          datasets: [
            {
              label: "Holdings",
              data: series.map((s) => s.value),
              backgroundColor: [
                "rgba(59, 130, 246, 0.7)",
                "rgba(16, 185, 129, 0.7)",
                "rgba(251, 191, 36, 0.7)",
                "rgba(168, 85, 247, 0.7)",
                "rgba(239, 68, 68, 0.7)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        },
      });

      chartInstanceRef.current = chartRef.current.chartInstance;

      const interval = setInterval(() => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.data.datasets[0].data =
            chartInstanceRef.current.data.datasets[0].data.map(
              () => Math.floor(Math.random() * 100) + 1
            );
          chartInstanceRef.current.update();
        }
      }, 2000);

      return () => {
        clearInterval(interval);
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
      };
    }
  }, [series]);

  return (
    <Container disableGutters>
      {loading ? (
        <Grid container justifyContent="center" spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3].map((n) => (
            <Grid item key={n}>
              <Box className="px-3 py-1 rounded-full border bg-neutral-100 animate-pulse" sx={{ width: 100 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
          {portfolios.map((p) => (
            <Grid item key={p.portfolio_id}>
              <button
                onClick={() => setSelected(p.portfolio_id)}
                className={`px-3 py-1 rounded-full border ${
                  selected === p.portfolio_id ? "bg-black text-white" : "hover:bg-neutral-100"
                }`}
                data-portfolio-id={p.portfolio_id}
              >
                {p.name}
              </button>
            </Grid>
          ))}

          {/* divider */}
          <Grid item>
            <Box sx={{ borderLeft: "1px solid #e0e0e0", height: 24, mx: 1 }} />
          </Grid>

          {/* create / delete portfolio buttons */}
          <Grid item>
            <CreatePortfolioButton userId={2} onCreated={handleCreated} />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<FolderDeleteIcon />}
              sx={{
                bgcolor: "#FA2323",
                ":hover": { bgcolor: "#CD0404" },
                transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
                transform: "translateZ(0)",
                willChange: "transform",
                "&:hover": { transform: "translateY(-1px)" },
                "&:active": { transform: "translateY(0px) scale(0.98)" },
              }}
              disabled={!selected}
              onClick={() => {
                if (selected && window.confirm("Are you sure you want to delete this portfolio?")) {
                  alert(`Delete portfolio ${selected}`);
                }
              }}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
      )}

      {/* ===== MAIN 3-COLUMN LAYOUT (responsive) ===== */}
      <Grid container spacing={2}>
        {/* LEFT: green card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, bgcolor: "#00674F", color: "#FFFFFF" }}>
            {/* Header bar pinned to the top */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                pb: 1.5,
                borderBottom: "1px dashed rgba(255,255,255,0.25)",
              }}
            >
              {/* Dynamic title from selected portfolio */}
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.35rem", sm: "1.55rem", md: "1.85rem" },
                  color: "#BB77FF",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                  letterSpacing: "0.5px",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: { xs: "60%", md: "70%" }, // avoid overlapping the buttons
                }}
                title={portfolioTitle}
              >
                {portfolioTitle}
              </Typography>

              {/* Create / Delete asset buttons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CreateAssetButton
                  onCreated={() => setToast({ open: true, msg: "Asset created", severity: "success" })}
                  buttonProps={{
                    variant: "text",
                    size: isMobile ? "small" : "medium",
                    sx: {
                      color: "white",
                      ":hover": { bgcolor: "blue", color: "white" },
                      transition: "transform 120ms ease, background-color 120ms ease",
                      transform: "translateZ(0)",
                      willChange: "transform",
                      "&:hover": { transform: "translateY(-1px)" },
                      "&:active": { transform: "translateY(0px) scale(0.98)" },
                    },
                    children: <CreateNewFolderIcon fontSize={isMobile ? "small" : "medium"} />,
                  }}
                />
                <DeleteAssetButton
                  portfolioId={selected}
                  onDeleted={() => setToast({ open: true, msg: "Asset deleted", severity: "success" })}
                  buttonProps={{
                    variant: "text",
                    size: isMobile ? "small" : "medium",
                    sx: {
                      color: "red",
                      ":hover": { bgcolor: "red", color: "white" },
                      transition: "transform 120ms ease, background-color 120ms ease",
                      transform: "translateZ(0)",
                      willChange: "transform",
                      "&:hover": { transform: "translateY(-1px)" },
                      "&:active": { transform: "translateY(0px) scale(0.98)" },
                    },
                    children: <FolderDeleteIcon fontSize={isMobile ? "small" : "medium"} />,
                  }}
                />
              </Box>
            </Box>

            {/* Content area below the header (grows independently) */}
            <Box sx={{ mt: 2 }}>
              <Card>
                <CardContent>
                  {selected ? (
                    <PortfolioTable portfolioId={selected} />
                  ) : (
                    <Typography sx={{ p: 2, textAlign: "center" }}>
                      Select a portfolio to view holdings
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Card>
        </Grid>

        {/* MIDDLE: chart */}
        <Grid item xs={12} md={4}>
          <Card title="Graph (dummy)">
            <div className="mt-6 bg-white rounded-lg shadow p-4 flex flex-col items-center w-full">
              <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>
              <canvas ref={chartRef} className="w-full max-w-xs" />
            </div>
          </Card>
        </Grid>

        {/* RIGHT: stocks sidebar */}
        <Grid item xs={12} md={4}>
          <StocksSidebar />
        </Grid>
      </Grid>

      {/* global toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
