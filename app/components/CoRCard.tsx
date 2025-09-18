import Link from "next/link";
export default function CoRCard() {
  return (
    <div className="card card-hover">
      <h3 className="h3">Circle of Return — £50/mo</h3>
      <p>Membership with practices, coaching prompts, and live sessions.</p>
      <Link href="/circle" className="btn-secondary">Details</Link>
    </div>
  );
}
