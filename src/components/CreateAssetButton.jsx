import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Snackbar, Alert, CircularProgress,
  Tooltip, Box, Typography, Divider, Chip, IconButton, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import Autocomplete from "@mui/material/Autocomplete";

const TYPE_OPTIONS = [
  { label: "Stock",  value: "stock"  },
  { label: "Bond",   value: "bond"   },
  { label: "Crypto", value: "crypto" },
  { label: "Fund",   value: "fund"   },
  { label: "Cash",   value: "cash"   },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function CreateAssetButton({ onCreated, buttonProps, portfolioId, children }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  // Catálogo
  const [assetType, setAssetType] = useState("stock");
  const [query, setQuery] = useState("");
  const [assetsList, setAssetsList] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [asset, setAsset] = useState(null); // {asset_id, symbol, ...}

  // Transacción
  const [date] = useState(todayISO()); // fijo hoy
  const [quantity, setQuantity] = useState("");
  const [price, setPrice]     = useState("");
  const [fees, setFees]       = useState("");
  const [notes, setNotes]     = useState("");

  const [fieldErr, setFieldErr] = useState({});

  // Debounce
  const debounceTimer = useRef(null);
  const fetchAssets = (type, q) => {
    setLoadingAssets(true);
    const url = new URL(`/api/assets`, window.location.origin);
    if (type) url.searchParams.set("type", String(type).toLowerCase());
    if (q)    url.searchParams.set("q", q.trim());
    fetch(url.toString().replace(window.location.origin, ""))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(rows => setAssetsList(Array.isArray(rows) ? rows : []))
      .catch(() => setAssetsList([]))
      .finally(() => setLoadingAssets(false));
  };

  useEffect(() => {
    if (!open) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchAssets(assetType, query), 250);
    return () => debounceTimer.current && clearTimeout(debounceTimer.current);
  }, [open, assetType, query]);

  const resetForm = () => {
    setAssetType("stock");
    setQuery("");
    setAssetsList([]);
    setAsset(null);
    setQuantity("");
    setPrice("");
    setFees("");
    setNotes("");
    setFieldErr({});
  };

  // —— Restricciones de inputs —— //
  const sanitizeNumber = (val) => {
    if (val === "" || val === null || val === undefined) return "";
    const cleaned = String(val).replace(/[^0-9.]/g, "");
    // Evitar múltiples puntos
    const parts = cleaned.split(".");
    if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
    return cleaned;
  };

  const preventWheel = (e) => {
    e.target.blur();
    e.stopPropagation();
    setTimeout(() => e.target.focus(), 0);
  };

  const allowKeys = (e) => {
    // Permitir: números, punto, navegación y edición
    const allowed = [
      "Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","Home","End"
    ];
    if (allowed.includes(e.key)) return;

    if (e.ctrlKey || e.metaKey) {
      // permitir copiar/pegar/seleccionar todo
      if (["a","c","v","x"].includes(e.key.toLowerCase())) return;
    }
    // Permitir punto
    if (e.key === ".") return;
    // Permitir dígitos
    if (/^[0-9]$/.test(e.key)) return;

    // Bloquear todo lo demás
    e.preventDefault();
  };

  const onPasteNumeric = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault();
  };

  const numericInputSx = {
    "& input": {
      caretColor: "transparent",      // ⬅️ sin punto de inserción
      MozAppearance: "textfield",
    },
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  };

  const validate = () => {
    const errs = {};
    if (!portfolioId) errs.portfolioId = "Selecciona un portafolio";
    if (!asset || !asset.asset_id) errs.asset_id = "Selecciona un asset";
    if (!quantity || Number(quantity) <= 0) errs.quantity = "Cantidad > 0";
    if (price === "" || Number(price) < 0) errs.price = "Precio ≥ 0";
    if (fees !== "" && Number(fees) < 0) errs.fees = "Fees ≥ 0";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const resT = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          asset_id: asset.asset_id,
          date, // hoy
          type: "buy",
          quantity: Number(quantity),
          price: Number(price),
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

      // 1) Notificar al padre para refrescar holdings/donut/tabla
      onCreated?.(dataT);

      // 2) Re‑fetch del catálogo para reflejar cambios recientes
      fetchAssets(assetType, ""); // refresco simple
      setQuery("");

      setToast({ open: true, msg: "Compra registrada", severity: "success" });
      setOpen(false);
      resetForm();
    } catch (err) {
      setToast({ open: true, msg: err.message || "Unexpected error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const costPreview = useMemo(() => {
    const q = Number(quantity), p = Number(price);
    return q > 0 && p >= 0 ? q * p : 0;
  }, [quantity, price]);

  return (
    <>
      <Tooltip title="Comprar asset existente">
        <span>
          <Button {...buttonProps} onClick={() => setOpen(true)}>
            {children ?? <CreateNewFolderIcon />}
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
          Buy Assets
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            {/* SELECTOR: tipo + Autocomplete en la misma zona */}
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
                <TextField
                  select
                  label="Type"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  sx={{ minWidth: 140 }}
                  size="small"
                >
                  {TYPE_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>

                <Autocomplete
                  fullWidth
                  loading={loadingAssets}
                  options={assetsList}
                  value={asset}
                  onChange={(_e, newVal) => setAsset(newVal)}
                  onInputChange={(_e, newInput) => setQuery(newInput)}
                  getOptionLabel={(opt) => opt ? `${opt.symbol} — ${opt.name} [${opt.currency}]` : ""}
                  filterOptions={(x) => x}
                  isOptionEqualToValue={(opt, val) => String(opt.asset_id) === String(val?.asset_id)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search & select"
                      placeholder="Type symbol or name"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ opacity: 0.6 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {query ? (
                              <IconButton
                                size="small"
                                onClick={() => setQuery("")}
                                aria-label="clear"
                                edge="end"
                                tabIndex={-1}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                      error={Boolean(fieldErr.asset_id)}
                      helperText={fieldErr.asset_id || " "}
                    />
                  )}
                />
              </Stack>

              {asset && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                  <Chip label={asset.symbol} color="primary" variant="outlined" />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {asset.name} • {asset.asset_type?.toUpperCase()} • {asset.currency}
                  </Typography>
                </Stack>
              )}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* DETALLES: fecha fija + numéricos con caret deshabilitado */}
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
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <TextField
                  label="Date"
                  value={date}
                  InputProps={{ readOnly: true }}
                  helperText="Today (auto)"
                  sx={{ minWidth: 200 }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                <TextField
                  type="text"
                  inputMode="decimal"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(sanitizeNumber(e.target.value))}
                  onKeyDown={allowKeys}
                  onPaste={onPasteNumeric}
                  onWheel={preventWheel}
                  error={Boolean(fieldErr.quantity)}
                  helperText={fieldErr.quantity || " "}
                  inputProps={{ step: "any", min: "0", inputMode: "decimal", pattern: "^[0-9]*\\.?[0-9]+$" }}
                  sx={numericInputSx}
                />
                <TextField
                  type="text"
                  inputMode="decimal"
                  label="Price"
                  value={price}
                  onChange={(e) => setPrice(sanitizeNumber(e.target.value))}
                  onKeyDown={allowKeys}
                  onPaste={onPasteNumeric}
                  onWheel={preventWheel}
                  error={Boolean(fieldErr.price)}
                  helperText={fieldErr.price || " "}
                  inputProps={{ step: "any", min: "0", inputMode: "decimal", pattern: "^[0-9]*\\.?[0-9]+$" }}
                  sx={numericInputSx}
                />
                <TextField
                  type="text"
                  inputMode="decimal"
                  label="Fees (optional)"
                  value={fees}
                  onChange={(e) => setFees(sanitizeNumber(e.target.value))}
                  onKeyDown={allowKeys}
                  onPaste={onPasteNumeric}
                  onWheel={preventWheel}
                  error={Boolean(fieldErr.fees)}
                  helperText={fieldErr.fees || " "}
                  inputProps={{ step: "any", min: "0", inputMode: "decimal", pattern: "^[0-9]*\\.?[0-9]+$" }}
                  sx={numericInputSx}
                />
              </Stack>

              <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                sx={{ mt: 2 }}
              />

              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                  Estimated cost (qty × price)
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  {costPreview
                    ? costPreview.toLocaleString(undefined, { style: "currency", currency: asset?.currency || "USD" })
                    : "—"}
                </Typography>
              </Box>

              {!!fieldErr.portfolioId && (
                <Alert sx={{ mt: 2 }} severity="error">{fieldErr.portfolioId}</Alert>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setOpen(false); resetForm(); }} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading || !portfolioId}>
              {loading ? <CircularProgress size={22} /> : "Buy"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </>
  );
}
