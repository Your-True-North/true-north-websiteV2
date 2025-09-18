export async function POST(req: Request) {
  const payload = await req.json();
  console.log("AskDi:", payload);
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
}
