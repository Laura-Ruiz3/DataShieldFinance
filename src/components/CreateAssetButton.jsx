import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Snackbar, Alert, CircularProgress,
  Tooltip, InputLabel, Select, FormControl, Box, Typography
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const TYPES = ["stock", "bond", "crypto", "fund", "cash"]; // coincide con tu ENUM

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
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            pb: 1,
            backgroundColor: "#f7f7f7",
            borderBottom: "1px solid rgba(0,0,0,0.08)"
          }}
        >
          Buy Asset
        </DialogTitle>
        <form onSubmit={submit}>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              {/* Tipo */}
              <FormControl fullWidth>
                <InputLabel id="asset-type-label">Asset Type</InputLabel>
                <Select
                  labelId="asset-type-label"
                  label="Asset Type"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0B5D32',
                    },
                  }}
                >
                  {TYPES.map(t => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
                </Select>
              </FormControl>

              {/* Asset existente */}
              <FormControl fullWidth error={Boolean(fieldErr.asset_id)}>
                <InputLabel id="asset-select-label">Asset</InputLabel>
                <Select
                  labelId="asset-select-label"
                  label="Asset"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0B5D32',
                    },
                  }}
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

              {/* Display current price from database */}
              {selectedAsset && (
                <Box sx={{
                  p: 1.5,
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

              {/* Transacción */}
              <TextField
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={Boolean(fieldErr.date)}
                helperText={fieldErr.date || " "}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: '#0B5D32',
                    },
                  },
                }}
              />
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={Boolean(fieldErr.quantity)}
                helperText={fieldErr.quantity || " "}
                inputProps={{ step: "any", min: "0" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: '#0B5D32',
                    },
                  },
                }}
              />
              <TextField
                type="number"
                label="Fees (optional)"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                inputProps={{ step: "any", min: "0" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: '#0B5D32',
                    },
                  },
                }}
              />
{/*               <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                minRows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: '#0B5D32',
                    },
                  },
                }}
              /> */}

              {!!fieldErr.portfolioId && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 1.5 }}
                >
                  {fieldErr.portfolioId}
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f7f7f7", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <Button
              onClick={() => { setOpen(false); resetForm(); }}
              disabled={loading}
              sx={{
                borderRadius: 28,
                px: 3
              }}
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}