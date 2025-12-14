import { Box, Container, Typography, Grid } from "@mui/material";

export default function About() {
  return (
    <Box sx={{ fontFamily: "Arial, sans-serif" }}>

      <Box sx={{ py: 8, background: "#f0f7f2" }}>
        <Container>
          <Typography variant="h4" fontWeight={700}>
            About PlantCare AI
          </Typography>
          <Typography sx={{ mt: 2, color: "#555" }}>
            Empowering gardeners and farmers with AI-powered plant disease detection
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={600} mb={2}>Our Mission</Typography>
            <Typography color="#555">
              We make plant disease detection accessible using cutting-edge AI
              and agricultural expertise.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://images.pexels.com/photos/1084542/pexels-photo-1084542.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Plant care"
              sx={{ width: "100%", borderRadius: 3 }}
            />
          </Grid>
        </Grid>
      </Container>

    </Box>
  );
}
