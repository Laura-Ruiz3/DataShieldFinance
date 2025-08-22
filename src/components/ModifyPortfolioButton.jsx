import { useState, forwardRef, useEffect } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Stack, Snackbar, Alert, CircularProgress, Slide
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ModifyPortfolioButton({ portfolio, onUpdated }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });
    const [nameError, setNameError] = useState("");

    // Populate form when portfolio changes
    useEffect(() => {
        if (portfolio) {
            setName(portfolio.name || "");
            setDescription(portfolio.description || "");
        }
    }, [portfolio]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNameError("");

        const cleanName = name.trim();
        const cleanDesc = description.trim();
        if (!cleanName) {
            const msg = "Name is required";
            setNameError(msg);
            setToast({ open: true, msg, severity: "warning" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/portfolios/${portfolio.portfolio_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: cleanName,
                    description: cleanDesc,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (res.status === 409) {
                    const msg = data.message || "A portfolio with this name already exists for this user.";
                    setNameError(msg);
                    setToast({ open: true, msg, severity: "error" });
                    return;
                }
                const msg = data.error || `HTTP ${res.status}`;
                setNameError(msg);
                setToast({ open: true, msg, severity: "error" });
                return;
            }

            setToast({ open: true, msg: "Portfolio updated successfully", severity: "success" });
            setOpen(false);

            onUpdated?.();
        } catch (err) {
            const msg = err.message || "Unexpected error";
            setNameError(msg);
            setToast({ open: true, msg, severity: "error" });

            onUpdated?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                onClick={() => setOpen(true)}
                startIcon={<EditIcon />}
                disabled={!portfolio}
                sx={{
                    backgroundColor: "#4C86E4", // Blue color
                    color: "#FFFFFF",
                    borderRadius: 28,
                    transition: "transform 120ms ease, background-color 0.2s ease",
                    transform: "translateZ(0)",
                    "&:hover": {
                        backgroundColor: "#3A75D3", // Slightly darker on hover
                        transform: portfolio ? "translateY(-1px)" : "none"
                    },
                    "&:active": {
                        backgroundColor: "#2964C2", // Even darker when clicked
                        transform: portfolio ? "translateY(0px) scale(0.98)" : "none"
                    },
                    "&:disabled": {
                        opacity: 0.6,
                    }
                }}
            >
                Edit
            </Button>

            <Dialog
                open={open}
                onClose={() => !loading && setOpen(false)}
                fullWidth
                maxWidth="sm"
                TransitionComponent={Transition}
                keepMounted
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
                    Edit Portfolio
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                                error={Boolean(nameError)}
                                helperText={nameError || " "}
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
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f7f7f7", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                        <Button
                            onClick={() => setOpen(false)}
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
                            disabled={loading}
                            startIcon={!loading && <EditIcon />}
                            sx={{
                                backgroundColor: "#4C86E4",
                                color: "#FFFFFF",
                                borderRadius: 28,
                                px: 3,
                                '&:hover': {
                                    backgroundColor: "#3A75D3",
                                },
                                '&:active': {
                                    backgroundColor: "#2964C2",
                                    transform: "translateY(0px) scale(0.98)"
                                },
                                '&:disabled': {
                                    backgroundColor: "#4C86E4",
                                    opacity: 0.6,
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
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