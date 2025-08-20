import { useContext, useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import api from "../../api";
import { ThemeContext } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

export default function RegisterPage() {
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
      const { data } = await api.post("/register", { username, password });
      setSuccess(`Registered as '${data?.user?.username}' (id=${data?.user?.id}).`);
      window.alert("Registered successfully!");
      // optional: localStorage.setItem("currentUser", JSON.stringify(data.user));
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed";
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
          <Card.Title className="mb-3">Create an account</Card.Title>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          {success && <Alert variant="success" className="mb-3">{success}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="regUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="3–32 chars (letters, digits, . _ -)"
                autoComplete="username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="regPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant={btnVariant} disabled={loading}>
                {loading ? "Registering…" : "Register"}
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
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
