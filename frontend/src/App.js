// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Upload from "./pages/Upload";
import Home from "./pages/Home";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <nav style={{ padding: 12, display: "flex", gap: 12, background:"#f5f5f5" }}>
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
