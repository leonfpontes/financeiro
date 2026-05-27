"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Logo } from "@/components/layout/Logo";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    fontSize: "0.95rem",
    transition: "box-shadow 0.2s, background-color 0.2s",
    "& fieldset": { borderColor: "#e2e8f0", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "#a5b4fc" },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
    },
    "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontSize: "0.9rem", color: "#94a3b8" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "#94a3b8", fontSize: "1.1rem" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou senha incorretos.");
    } else {
      router.push("/");
    }
  }

  return (
    <Card sx={{ borderRadius: "20px", overflow: "hidden", border: "none", boxShadow: "0 32px 64px -12px rgba(0,0,0,0.55)" }}>
      {/* ── Header ── */}
      <Box sx={{
        background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
        px: { xs: 3, sm: 4 }, py: 4, textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <Box sx={{ position: "absolute", top: -32, right: -32, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <Box sx={{ position: "absolute", bottom: -20, left: -20, width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
            <Logo size={52} />
          </Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em", display: "block" }}>
            Financeiro
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)", mt: 0.4, fontSize: "0.82rem" }}>
            Entre com sua conta para continuar
          </Typography>
        </Box>
      </Box>

      {/* ── Form ── */}
      <CardContent sx={{ px: { xs: 3, sm: 4 }, pt: 3.5, pb: "32px !important", backgroundColor: "#fff" }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: "10px", fontSize: "0.83rem", py: 0.5 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon />
                    </InputAdornment>
                  ),
                },
                inputLabel: { shrink: true },
              }}
              sx={fieldSx}
            />

            <TextField
              label="Senha"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPwd((v) => !v)} tabIndex={-1} edge="end"
                        sx={{ color: "#94a3b8", "&:hover": { color: "#6366f1" } }}>
                        {showPwd ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
                inputLabel: { shrink: true },
              }}
              sx={fieldSx}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              endIcon={!loading && <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                mt: 0.5,
                py: 1.4,
                fontSize: "0.95rem",
                fontWeight: 700,
                borderRadius: "12px",
                textTransform: "none",
                letterSpacing: "0.01em",
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.55)",
                },
                "&:disabled": { opacity: 0.65, boxShadow: "none" },
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center", color: "#94a3b8", fontSize: "0.83rem" }}>
              Não tem conta?{" "}
              <Link href="/register" style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none" }}>
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}

