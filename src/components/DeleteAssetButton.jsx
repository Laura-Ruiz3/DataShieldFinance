import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Alert, CircularProgress,
  Tooltip, Box, Typography, Divider, Chip, IconButton, InputAdornment
} from "@mui/material";

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Autocomplete from "@mui/material/Autocomplete";

export default function DeleteAssetButton({ portfolioId, onDeleted, buttonProps, children }) {
  const [open, setOpen] = useState(false);

  const [holdings, setHoldings] = useState([]);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(null);

  const [maxQty, setMaxQty] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [fieldErr, setFieldErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const sanitizeNumber = (val) => {
    if (val === "" || val === null || val === undefined) return "";
    const cleaned = String(val).replace(/[^0-9.]/g, "");
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
    const allowed = [
      "Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","Home","End"
    ];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) {
      if (["a","c","v","x"].includes(e.key.toLowerCase())) return;
    }
    if (e.key === ".") return;
    if (/^[0-9]$/.test(e.key)) return;
    e.preventDefault();
  };
  const onPasteNumeric = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault();
  };
  const numericInputSx = {
    "& input": {
      caretColor: "transparent",
      MozAppearance: "textfield",
    },
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  };

  useEffect(() => {
    if (!open || !portfolioId) return;
    (async () => {
      try {
        setLoadingHoldings(true);
        const res = await fetch(`/api/portfolios/${portfolioId}/holdings`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-store" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setHoldings(Array.isArray(data) ? data : []);
      } catch {
        setHoldings([]);
      } finally {
        setLoadingHoldings(false);
      }
    })();
  }, [open, portfolioId]);

  useEffect(() => {
    if (!position) {
      setMaxQty(0);
      setQuantity("");
      setPrice("");
      return;
    }
    const q = Number(position.quantity || 0);
    setMaxQty(q);
    const suggested =
      position.price_usd ??
      position.avg_price ??
      position.last_price ??
      "";
    setPrice(suggested ? String(suggested) : "");
  }, [position]);

  const resetForm = () => {
    setQuery("");
    setPosition(null);
    setMaxQty(0);
    setQuantity("");
    setPrice("");
    setFieldErr({});
  };

  const validate = () => {
    const errs = {};
    if (!portfolioId) errs.portfolioId = "Selecciona un portafolio";
    if (!position || !position.asset_id) errs.asset = "Selecciona un asset a vender";
    const q = Number(quantity);
    if (!(q > 0)) errs.quantity = "Cantidad > 0";
    if (maxQty && q > maxQty) errs.quantity = `No puedes vender más de ${maxQty}`;
    const p = Number(price);
    if (!(p >= 0)) errs.price = "Precio ≥ 0";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/assets/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          asset_id: position.asset_id,
          quantity: Number(quantity),
          price: Number(price)
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || data.error || `HTTP ${res.status}`;
        setToast({ open: true, msg, severity: "error" });
        return;
      }
      setToast({ open: true, msg: "Asset sold successfully", severity: "success" }); 
      onDeleted?.(data);
      setOpen(false);
      resetForm();
    } catch (err) {
      setToast({ open: true, msg: err.message || "Unexpected error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const proceeds = useMemo(() => {
    const q = Number(quantity), p = Number(price);
    return q > 0 && p >= 0 ? q * p : 0;
  }, [quantity, price]);

  return (
    <>
      <Tooltip title="Sell asset">
        <span>
          <Button {...buttonProps} onClick={() => setOpen(true)}>
            {children ?? <MonetizationOnIcon />}
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
        <DialogTitle sx={{ bgcolor: "#8B1E3F", color: "white", fontWeight: 800, py: 2 }}>
          Sell assets
        </DialogTitle>

        <form onSubmit={submit}>
          <DialogContent sx={{ pt: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 1, color: "#6A4C93" }}>
              Select position
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
              <Autocomplete
                fullWidth
                loading={loadingHoldings}
                options={holdings}
                value={position}
                onChange={(_e, newVal) => setPosition(newVal)}
                onInputChange={(_e, newInput) => setQuery(newInput)}
                getOptionLabel={(opt) =>
                  opt ? `${opt.symbol} — ${opt.name} • Qty: ${Number(opt.quantity || 0).toLocaleString()}` : ""
                }
                filterOptions={(x) => x}
                isOptionEqualToValue={(opt, val) => String(opt.asset_id) === String(val?.asset_id)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search holdings"
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
                    error={Boolean(fieldErr.asset)}
                    helperText={fieldErr.asset || " "}
                  />
                )}
              />
              {position && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
                  <Chip label={position.symbol} color="primary" variant="outlined" />
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {position.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    • Qty: {Number(position.quantity || 0).toLocaleString()}
                  </Typography>
                  {"currency" in position && (
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      • {position.currency}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography sx={{ fontWeight: 700, mb: 1, color: "#FF6B6B" }}>
              Sell details
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
                  type="text"
                  inputMode="decimal"
                  label={`Quantity ${maxQty ? `(≤ ${maxQty})` : ""}`}
                  value={quantity}
                  onChange={(e) => setQuantity(sanitizeNumber(e.target.value))}
                  onKeyDown={allowKeys}
                  onPaste={onPasteNumeric}
                  onWheel={preventWheel}
                  error={Boolean(fieldErr.quantity)}
                  helperText={fieldErr.quantity || " "}
                  inputProps={{ step: "any", min: "0", pattern: "^[0-9]*\\.?[0-9]+$" }}
                  sx={numericInputSx}
                />
                <Button
                  variant="outlined"
                  disabled={!maxQty}
                  onClick={() => setQuantity(String(maxQty))}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Sell all
                </Button>
              </Stack>
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
              {loading ? <CircularProgress size={22} /> : "Sell"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
