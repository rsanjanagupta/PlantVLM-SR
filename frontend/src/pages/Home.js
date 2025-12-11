// src/pages/Home.js
import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <Container sx={{ py:6 }}>
      <Typography variant="h3" gutterBottom>Dashboard Home</Typography>
      <Typography sx={{ mb: 3 }}>Welcome to your Dream VLM dashboard.</Typography>
      <Box sx={{ mt:4 }}>
        <Button variant="contained" onClick={() => navigate("/upload")}>
          Ask & Resolve Your Query Here
        </Button>
      </Box>
    </Container>
  );
}
