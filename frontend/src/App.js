import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import Navbar from "./components/Navbar";

export default function App() {
  const [isAuth, setIsAuth] = useState(false);

  // ✅ Check token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuth(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
  };

  return (
    <BrowserRouter>
      <Navbar isAuth={isAuth} onLogout={logout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route
          path="/login"
          element={
            isAuth ? <Navigate to="/upload" /> : <Login onAuth={() => setIsAuth(true)} />
          }
        />

        <Route
          path="/signup"
          element={
            isAuth ? <Navigate to="/upload" /> : <Signup onAuth={() => setIsAuth(true)} />
          }
        />

        <Route
          path="/upload"
          element={isAuth ? <Upload /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
