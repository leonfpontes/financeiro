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
import CircularProgress from "@mui/material/CircularProgress";
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
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou senha incorretos.");
    } else {
      router.push("/fotografia");
    }
  }

  function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/fotografia" });
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
            GranaMinha
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)", mt: 0.4, fontSize: "0.82rem" }}>
            Entre com sua conta para continuar
          </Typography>
        </Box>
      </Box>

      {/* ── Form ── */}
      <CardContent sx={{ px: { xs: 3, sm: 4 }, pt: 3.5, pb: "32px !important", backgroundColor: "#fff" }}>
        {/* ── Google ── */}
        <Button
          variant="outlined"
          fullWidth
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          startIcon={
            googleLoading
              ? <CircularProgress size={18} sx={{ color: "#5f6368" }} />
              : <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
          }
          sx={{
            mb: 2,
            py: 1.4,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "#3c4043",
            borderColor: "#dadce0",
            backgroundColor: "#fff",
            "&:hover": { borderColor: "#c6c6c6", backgroundColor: "#f8fafc", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" },
            "&:disabled": { opacity: 0.65 },
          }}
        >
          {googleLoading ? "Redirecionando..." : "Continuar com Google"}
        </Button>

        {/* ── Divider ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#e2e8f0" }} />
          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>ou entre com e-mail</Typography>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#e2e8f0" }} />
        </Box>

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

            <Typography variant="body2" sx={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
              Quer conhecer antes?{" "}
              <Link href="/" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                Voltar para o início
              </Link>
            </Typography>

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

