import { useContext, useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import api from "../../api";
import { ThemeContext } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const { theme } = useContext(ThemeContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    setLoading(true);
    try {
      const { data } = await api.post("/login", { username, password });
      setSuccess(`Welcome back, ${data?.user?.username}! (id=${data?.user?.id})`);
      window.alert("Logged in successfully!");
      // optional: localStorage.setItem("currentUser", JSON.stringify(data.user));
    } catch (err) {
      const msg = err?.response?.data?.error || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const btnVariant = theme === "light" ? "dark" : "light";

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: 32 }}>
      <Card>
        <Card.Body>
          <Card.Title className="mb-3">Log in</Card.Title>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          {success && <Alert variant="success" className="mb-3">{success}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant={btnVariant} disabled={loading}>
                {loading ? "Logging in…" : "Log in"}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                disabled={loading}
                onClick={() => { setUsername(""); setPassword(""); setError(null); setSuccess(null); }}
              >
                Reset
              </Button>
            </div>
          </Form>

          <div className="mt-3">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
