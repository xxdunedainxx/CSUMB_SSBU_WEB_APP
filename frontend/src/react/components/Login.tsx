import { useState } from "react";
import { HttpRequestClient } from "../ts/client/HttpRequestClient";
import Setup from "../ts/util/Setup";

type LoginResponse = {
  message?: string;
  error?: string;
};

const setup = new Setup();

export const client = new HttpRequestClient(
  setup.config.remoteHost,
  setup.config.remoteHostPort
);


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await client.login(email, password);
      // Redirect after successful login
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}