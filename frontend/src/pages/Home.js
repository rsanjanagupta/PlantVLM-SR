import { Box, Button, Container, Typography, Grid } from "@mui/material";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Box sx={{ fontFamily: "Arial, sans-serif" }}>

      {/* HERO */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Detect Plant Diseases Instantly
              </Typography>
              <Typography sx={{ color: "#555", mb: 3 }}>
                Upload a photo of your plant and get instant diagnosis powered by AI
              </Typography>

              <Button
                component={Link}
                to="/upload"
                variant="contained"
                sx={{
                  backgroundColor: "#2e7d32",
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#256428" }
                }}
              >
                Get Started
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Healthy plants"
                sx={{ width: "100%", borderRadius: 3 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES */}
      <Box sx={{ py: 6, background: "#fafafa" }}>
        <Container>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
            How It Works
          </Typography>

          <Grid container spacing={3}>
            {[
              { icon: "📸", title: "Upload Photo", text: "Take or upload a clear photo" },
              { icon: "🔍", title: "AI Analysis", text: "AI analyzes the image" },
              { icon: "💡", title: "Get Solutions", text: "Receive treatment guidance" }
            ].map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{ p: 3, border: "1px solid #ddd", borderRadius: 2, textAlign: "center" }}>
                  <Typography fontSize={28}>{f.icon}</Typography>
                  <Typography fontWeight={600} mt={1}>{f.title}</Typography>
                  <Typography color="#555">{f.text}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    </Box>
  );
}
