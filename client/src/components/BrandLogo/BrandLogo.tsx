import Link from "next/link";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  const classes = className ? `brand ${className}` : "brand";

  return (
    <Link className={classes} href="/" aria-label="Atlantis Nexus home">
      <span className="brand-mark">A</span>
      <span>Atlantis Nexus</span>
    </Link>
  );
}
