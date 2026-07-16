import { useEffect, useMemo, useState } from 'react';
import { HttpRequestClient } from "../ts/client/HttpRequestClient";
import Setup from "../ts/util/Setup";

const setup = new Setup();

export const client = new HttpRequestClient(
  setup.config.remoteHost,
  setup.config.remoteHostPort,
  setup.config.remoteHostPath
);


export default function Feedback() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    setError(null);
    e.preventDefault(); // prevents page reload
    console.log("Submitted value:", value);
     try {
      const res = await client.feedback(value);
      alert("Thanks for the feedback!")
      window.location.href = "/ui/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
      />

      <button type="submit">Submit</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
