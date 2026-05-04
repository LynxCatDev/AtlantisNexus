import Link from "next/link";

import "./BrandLogo.scss";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  const classes = className ? `brand-logo ${className}` : "brand-logo";

  return (
    <Link className={classes} href="/" aria-label="Atlantis Nexus home">
      <span className="brand-logo__mark">A</span>
      <span>Atlantis Nexus</span>
    </Link>
  );
}
