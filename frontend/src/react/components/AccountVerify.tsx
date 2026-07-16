import { useState, useEffect } from "react";
import { HttpRequestClient } from "../ts/client/HttpRequestClient";
import Setup from "../ts/util/Setup";

const setup = new Setup();

export const client = new HttpRequestClient(
  setup.config.remoteHost,
  setup.config.remoteHostPort,
  setup.config.remoteHostPath
);

export default function AccountVerify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("verificationToken");
        const res = await client.verifyAccount(token);
        alert("Account verified!")
        window.location.href = "/ui/login/";
      } catch (e) {
        setError("Failed to verify");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      {loading ? "Verifying..." : "Verified"}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}