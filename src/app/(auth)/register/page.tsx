"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error?.message ?? "Erro ao criar conta."); return; }
    router.push("/login?registered=1");
  }

  return (
    <Card sx={{ borderRadius: 4, overflow: "hidden", border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
      <Box sx={{ background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", px: 4, py: 3.5, textAlign: "center" }}>
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
          ₢ Financeiro
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
          Crie sua conta para começar
        </Typography>
      </Box>
      <CardContent sx={{ px: 4, py: 3.5 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required autoComplete="email" />
            <TextField label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número" required autoComplete="new-password" />
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ mt: 0.5, py: 1.3, fontSize: "0.95rem" }}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
            <Typography variant="body2" sx={{ textAlign: "center" }} color="text.secondary">
              Já tem conta?{" "}
              <Link href="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Entrar</Link>
            </Typography>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}

