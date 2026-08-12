import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/map", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ minHeight: "100dvh", background: "#ffffff", color: "#000000", padding: 24 }}>
      <h1>NEX2</h1>
      <p>Discover people nearby who share your interests.</p>
      <p>
        <Link to="/register">Get started</Link>
      </p>
      <p>
        <Link to="/login">I already have an account</Link>
      </p>
    </div>
  );
}
