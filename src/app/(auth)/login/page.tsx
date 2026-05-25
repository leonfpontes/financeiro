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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <Card sx={{ borderRadius: 4, overflow: "hidden", border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
      <Box sx={{ background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", px: { xs: 3, sm: 4 }, py: 3.5, textAlign: "center" }}>
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
          ₢ Financeiro
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
          Entre com sua conta para continuar
        </Typography>
      </Box>
      <CardContent sx={{ px: { xs: 3, sm: 4 }, py: 3.5 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required autoComplete="email" />
            <TextField label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ mt: 0.5, py: 1.3, fontSize: "0.95rem" }}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <Typography variant="body2" sx={{ textAlign: "center" }} color="text.secondary">
              Não tem conta?{" "}
              <Link href="/register" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Cadastre-se</Link>
            </Typography>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}

