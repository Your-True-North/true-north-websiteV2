"use client";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

export default function VeilLink({ href, children, className = "", ...rest }: LinkProps & { children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`veil-link ${className}`} {...rest}>
      <span className="veil-sheen" aria-hidden></span>
      <span className="veil-label">{children}</span>
    </Link>
  );
}
