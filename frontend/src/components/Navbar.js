import { Link } from "react-router-dom";

export default function Navbar({ isAuth, onLogout }) {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 28px",
      backgroundColor: "#2e7d32",
      color: "white"
    }}>
      {/* LEFT */}
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/about" style={linkStyle}>About</Link>
        {isAuth && <Link to="/upload" style={linkStyle}>Upload</Link>}
      </div>

      {/* RIGHT */}
      <div>
        {!isAuth ? (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/signup" style={{ ...linkStyle, marginLeft: 16 }}>Signup</Link>
          </>
        ) : (
          <button onClick={onLogout} style={logoutBtn}>Logout</button>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  marginRight: 16,
  fontWeight: 500
};

const logoutBtn = {
  background: "white",
  color: "#2e7d32",
  border: "none",
  padding: "6px 14px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600
};
