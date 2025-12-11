// src/pages/About.js
import React from "react";
import { Container, Typography } from "@mui/material";

export default function About() {
  return (
    <Container sx={{ py:6 }}>
      <Typography variant="h4" gutterBottom>About Us</Typography>
      <Typography paragraph>
        Krishi Vignan: Lorem ipsum agro-pest narrative — nimble sprout rotation and
        pestilence management. In our imaginary field, crop-lore meets pest-control
        heuristics: beetles nibble, leaves curl, farmers whisper ancient compost
        remedies and integrated pest management practices. (Placeholder content.)
      </Typography>
      <Typography paragraph>
        This page contains placeholder text about agriculture, crops, pests and
        prevention practices. Replace with real content later.
      </Typography>
    </Container>
  );
}
