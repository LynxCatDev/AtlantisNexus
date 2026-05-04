import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  HTMLAttributes,
  ReactNode,
} from "react";

import "./FilterRow.scss";

type RowProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function FilterRow({ className, children, ...rest }: RowProps) {
  const classes = className ? `filter-row ${className}` : "filter-row";
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

type PillCommon = {
  active?: boolean;
  className?: string;
  children: ReactNode;
};

type PillAsButton = PillCommon &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type PillAsLink = PillCommon &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

type PillProps = PillAsButton | PillAsLink;

function pillClasses(active: boolean | undefined, className: string | undefined) {
  return [
    "filter-pill",
    active ? "filter-pill--active" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function FilterPill(props: PillProps) {
  const classes = pillClasses(props.active, props.className);

  if ("href" in props && props.href !== undefined) {
    const { active: _a, className: _c, children, ...linkRest } = props;
    return (
      <Link className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const {
    active: _a,
    className: _c,
    children,
    type = "button",
    ...buttonRest
  } = props;
  return (
    <button className={classes} type={type} {...buttonRest}>
      {children}
    </button>
  );
}
