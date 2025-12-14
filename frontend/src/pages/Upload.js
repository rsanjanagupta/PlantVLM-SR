import React, { useState, useEffect } from "react";
import {
  Box, Button, Container, TextField, Typography, Card, CardContent,
  Alert, CircularProgress, Paper
} from "@mui/material";
import { CloudUpload, Send } from "@mui/icons-material";
import axios from "axios";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) return setError("Please select an image first");
    if (!query.trim()) return setError("Please enter a query");

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("query", query);

      const res = await axios.post(
        "http://localhost:3000/upload-and-analyze",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`   // ✅ IMPORTANT
          },
          timeout: 2 * 60 * 1000
        }
      );

      setResponse(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setQuery("");
    setResponse(null);
    setError("");
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(to bottom, #f5f7fa, #c3cfe2)", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 700, textAlign: "center", mb: 4 }}>
          Analyze Your Crop Image
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="upload-image"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-image">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ py: 2, borderStyle: "dashed" }}
                  >
                    {selectedFile ? selectedFile.name : "Choose Image File"}
                  </Button>
                </label>
              </Box>

              {previewUrl && (
                <Box sx={{ mb: 3, textAlign: "center" }}>
                  <Paper sx={{ p: 1 }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 6 }}
                    />
                  </Paper>
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Enter your query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>

                <Button variant="outlined" onClick={handleReset}>
                  Reset
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        {response?.answer && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Result</Typography>
              <Typography>{response.answer}</Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
