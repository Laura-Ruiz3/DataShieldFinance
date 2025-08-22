import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Snackbar, Alert, CircularProgress,
  Tooltip, Box, Typography, Divider, Chip, FormControl, InputLabel, Select
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const TYPES = ["stock", "bond", "crypto", "fund", "cash"]; 

export default function CreateAssetButton({ onCreated, buttonProps, portfolioId, children }) {
  const [open, setOpen] = useState(false);

  // filtro y catálogo
  const [assetType, setAssetType] = useState("stock");
  const [assetsList, setAssetsList] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // selección
  const [assetId, setAssetId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // transacción
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState("");
  const [fees, setFees] = useState("");
  const [notes, setNotes] = useState("");

  const [fieldErr, setFieldErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // Cargar catálogo al abrir y cuando cambia el tipo
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingAssets(true);
        const res = await fetch(`/api/assets?type=${encodeURIComponent(assetType)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Assets with prices:", data); // Debug log
        setAssetsList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setAssetsList([]);
      } finally {
        setLoadingAssets(false);
      }
    })();
  }, [open, assetType]);

  // Track the selected asset to get its price
  useEffect(() => {
    if (assetId) {
      const asset = assetsList.find(a => a.asset_id === assetId);
      setSelectedAsset(asset || null);
    } else {
      setSelectedAsset(null);
    }
  }, [assetId, assetsList]);

  const resetForm = () => {
    setAssetType("stock");
    setAssetsList([]);
    setAssetId("");
    setSelectedAsset(null);
    setDate(new Date().toISOString().slice(0, 10));
    setQuantity("");
    setFees("");
    setNotes("");
    setFieldErr({});
  };

  const validate = () => {
    const errs = {};
    if (!portfolioId) errs.portfolioId = "Select a portfolio";
    if (!assetId) errs.asset_id = "Select an asset";
    if (!date) errs.date = "Date required";
    if (!quantity || Number(quantity) <= 0) errs.quantity = "Quantity must be > 0";
    if (!selectedAsset || !selectedAsset.price) errs.asset_id = "The selected asset has no price  ";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Registrar compra (BUY) en /api/transactions
      const resT = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          asset_id: assetId,
          date,
          type: "buy",
          quantity: Number(quantity),
          price: selectedAsset.price, // Use price from database
          fees: fees ? Number(fees) : 0,
          notes: notes || undefined
        }),
      });
      const dataT = await resT.json().catch(() => ({}));
      if (!resT.ok) {
        const msg = dataT.message || dataT.error || `HTTP ${resT.status}`;
        setToast({ open: true, msg, severity: "error" });
        return;
      }

      setToast({ open: true, msg: "Asset purchased successfully", severity: "success" });
      onCreated?.(dataT);
      setOpen(false);
      resetForm();
    } catch (err) {
      setToast({ open: true, msg: err.message || "Unexpected error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Buy asset">
        <span>
          <Button {...buttonProps} onClick={() => setOpen(true)}>
            {children ?? <ShoppingCartIcon />}
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !loading && (setOpen(false), resetForm())}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { overflow: "hidden", borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "#00674F", color: "white", fontWeight: 800, py: 2 }}>
          Buy Asset
        </DialogTitle>

        <form onSubmit={submit}>
          <DialogContent sx={{ pt: 2 }}>
            {/* ASSET SELECTION SECTION */}
            <Typography sx={{ fontWeight: 700, mb: 1, color: "#6A4C93" }}>
              Select asset
            </Typography>
            <Box
              sx={{
                p: 2,
                border: "1px dashed rgba(0,0,0,0.1)",
                borderRadius: 2,
                mb: 2,
                bgcolor: "rgba(0,184,212,0.04)"
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="stretch">
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel id="asset-type-label">Asset Type</InputLabel>
                  <Select
                    labelId="asset-type-label"
                    label="Asset Type"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    size="small"
                  >
                    {TYPES.map(t => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth error={Boolean(fieldErr.asset_id)}>
                  <InputLabel id="asset-select-label">Asset</InputLabel>
                  <Select
                    labelId="asset-select-label"
                    label="Asset"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                  >
                    {loadingAssets && <MenuItem disabled>Loading...</MenuItem>}
                    {!loadingAssets && assetsList.length === 0 && <MenuItem disabled>No assets</MenuItem>}
                    {!loadingAssets && assetsList.map(a => (
                      <MenuItem key={a.asset_id} value={a.asset_id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>
                            <strong>{a.symbol}</strong> — {a.name}
                          </span>
                          <Box
                            component="span"
                            sx={{
                              ml: 1,
                              bgcolor: a.price ? '#f0f7f0' : '#fff0f0',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 'bold',
                              color: a.price ? 'success.dark' : 'error.main'
                            }}
                          >
                            {a.price ? `$${Number(a.price).toFixed(2)}` : 'No price'}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {!!fieldErr.asset_id && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{fieldErr.asset_id}</Typography>}
                </FormControl>
              </Stack>

              {selectedAsset && (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={selectedAsset.symbol} color="primary" variant="outlined" />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {selectedAsset.name} • {selectedAsset.asset_type?.toUpperCase()} • {selectedAsset.currency}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* TRANSACTION DETAILS SECTION */}
            <Typography sx={{ fontWeight: 700, mb: 1, color: "#FF6B6B" }}>
              Buy details
            </Typography>
            <Box
              sx={{
                p: 2,
                border: "1px dashed rgba(0,0,0,0.1)",
                borderRadius: 2,
                bgcolor: "rgba(255,107,107,0.04)"
              }}
            >
              {/* Display current price from database */}
              {selectedAsset && (
                <Box sx={{
                  p: 1.5,
                  mb: 2,
                  bgcolor: '#f5fff7',
                  borderRadius: 1.5,
                  border: '1px solid rgba(11, 93, 50, 0.2)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0B5D32' }}>
                    Selected Asset Price
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    ${selectedAsset.price || 'N/A'} {selectedAsset.currency}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(selectedAsset.last_updated || Date.now()).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  error={Boolean(fieldErr.date)}
                  helperText={fieldErr.date || " "}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
                <TextField
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  error={Boolean(fieldErr.quantity)}
                  helperText={fieldErr.quantity || " "}
                  inputProps={{ step: "any", min: "0" }}
                  fullWidth
                />
                <TextField
                  type="number"
                  label="Fees (optional)"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  inputProps={{ step: "any", min: "0" }}
                  fullWidth
                />
              </Stack>

              {/* Display cost estimate */}
              {selectedAsset && quantity && Number(quantity) > 0 && (
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                    Estimated cost (qty × price)
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    {(Number(quantity) * Number(selectedAsset.price)).toLocaleString(undefined, 
                      { style: "currency", currency: selectedAsset.currency || "USD" })}
                  </Typography>
                </Box>
              )}

              {!!fieldErr.portfolioId && (
                <Alert sx={{ mt: 2 }} severity="error">{fieldErr.portfolioId}</Alert>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => { setOpen(false); resetForm(); }}
              disabled={loading}
              sx={{ borderRadius: 28, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !portfolioId}
              startIcon={!loading && <ShoppingCartIcon />}
              sx={{
                backgroundColor: "#2ECC71",
                color: "#FFFFFF",
                borderRadius: 28,
                px: 3,
                '&:hover': {
                  backgroundColor: "#27AE60",
                },
                '&:active': {
                  backgroundColor: "#219653",
                  transform: "translateY(0px) scale(0.98)"
                },
                '&:disabled': {
                  backgroundColor: "#2ECC71",
                  opacity: 0.6,
                }
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Buy"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </>
  );
}