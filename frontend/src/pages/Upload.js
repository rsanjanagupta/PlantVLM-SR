// src/pages/Upload.js
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
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
      setError("");
      setResponse(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { setError("Please select an image first"); return; }
    if (!query.trim()) { setError("Please enter a query"); return; }

    setLoading(true); setError(""); setResponse(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("query", query);

      // Send to Node proxy (recommended)
      const endpoint = "http://localhost:3000/upload-and-analyze";

      const res = await axios.post(endpoint, formData, {
        timeout: 2 * 60 * 1000
        // DO NOT set Content-Type manually
      });

      setResponse(res.data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError && axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message || "API error";
        setError(msg);
      } else {
        setError("An unexpected error occurred");
      }
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
        <Typography variant="h3" gutterBottom sx={{ fontWeight:700, textAlign:"center", color:"#2c3e50" }}>
          Analyze Your Crop Image
        </Typography>

        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 4 }}>
                <input accept="image/*" style={{ display: "none" }} id="raised-button-file" type="file" onChange={handleFileChange} />
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth sx={{ py:2, borderStyle:"dashed", borderWidth:2 }}>
                    {selectedFile ? selectedFile.name : "Choose Image File"}
                  </Button>
                </label>
              </Box>

              {previewUrl && (
                <Box sx={{ mb:4, display:"flex", justifyContent:"center" }}>
                  <Paper elevation={3} sx={{ p:1 }}>
                    <img src={previewUrl} alt="Preview" style={{ maxWidth:"100%", maxHeight:400, borderRadius:4 }} />
                  </Paper>
                </Box>
              )}

              <TextField fullWidth multiline rows={4} label="Enter your query" placeholder="E.g., What pest is affecting my crop? How do I treat it?" value={query} onChange={(e)=>setQuery(e.target.value)} sx={{ mb:3 }} variant="outlined" />

              <Box sx={{ display:"flex", gap:2 }}>
                <Button type="submit" variant="contained" fullWidth disabled={loading || !selectedFile || !query.trim()} startIcon={loading ? <CircularProgress size={20} /> : <Send />} sx={{ py:1.5, fontWeight:600 }}>
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>

                <Button variant="outlined" onClick={handleReset} sx={{ py:1.5, minWidth:120 }}>
                  Reset
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb:4 }}>{error}</Alert>}

        {response && (
          <Card sx={{ boxShadow:3, backgroundColor:"#f8f9fa" }}>
            <CardContent sx={{ p:4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight:600, color:"#2c3e50", mb:3 }}>Analysis Result</Typography>

              <Alert severity={response.status === "success" ? "success" : "info"} sx={{ mb:3 }}>
                Status: {response.status}
              </Alert>

              {response.answer && (
                <Paper elevation={1} sx={{ p:3, mb:3, backgroundColor:"white" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1, color:"#555" }}>Answer:</Typography>
                  <Typography variant="body1" sx={{ lineHeight:1.8 }}>{response.answer}</Typography>
                </Paper>
              )}

              {response.annotatedImageBase64 && (
                <Paper elevation={1} sx={{ p:3, mb:3, backgroundColor:"white" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1, color:"#555" }}>Annotated Image:</Typography>
                  <Box sx={{ display:"flex", justifyContent:"center" }}>
                    <img src={response.annotatedImageBase64} alt="Annotated" style={{ maxWidth:"100%", borderRadius:4 }} />
                  </Box>
                </Paper>
              )}

              {response.details && (
                <Paper elevation={1} sx={{ p:3, backgroundColor:"white" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight:600, mb:2, color:"#555" }}>Details:</Typography>
                  <Box sx={{ pl:2 }}>
                    <Typography variant="body2" sx={{ mb:1 }}><strong>Confidence:</strong> {response.details?.confidence ?? "N/A"}</Typography>
                    <Typography variant="body2"><strong>Info:</strong> {response.details?.info ?? "N/A"}</Typography>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
