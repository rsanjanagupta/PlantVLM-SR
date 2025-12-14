import { Box, Button, Card, CardContent, TextField, Typography, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // ✅ SAVE TOKEN + UPDATE AUTH STATE
      localStorage.setItem("token", data.token);
      onAuth();

      navigate("/upload");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6f8" }}>
      <Card sx={{ width:360 }}>
        <CardContent sx={{ p:4 }}>
          <Typography variant="h5" mb={1}>Welcome Back</Typography>
          <Typography color="#666" mb={2}>Sign in to your account</Typography>

          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

          <form onSubmit={submit}>
            <TextField fullWidth label="Email" margin="normal" onChange={e=>setEmail(e.target.value)} />
            <TextField fullWidth label="Password" type="password" margin="normal" onChange={e=>setPassword(e.target.value)} />

            <Button fullWidth variant="contained" sx={{ mt:2, background:"#2e7d32" }} type="submit">
              Sign In
            </Button>
          </form>

          <Typography mt={2} textAlign="center">
            New user? <Link to="/signup">Sign up</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
