"use client";
import { useState } from "react";

export default function AskDi() {
  const [q, setQ] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/ask-di", { method: "POST", body: JSON.stringify({ q }) });
    setSent(true);
  }
  if (sent) return <p className="muted">Received. Trust the quiet.</p>;
  return (
    <form onSubmit={submit} className="form askdi">
      <label>Your Question<textarea rows={4} value={q} onChange={(e)=>setQ(e.target.value)} required /></label>
      <button className="btn-primary" type="submit">Send</button>
    </form>
  );
}
