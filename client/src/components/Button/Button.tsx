import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import "./Button.scss";

type ButtonSize = "default" | "small";

type CommonProps = {
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

type Props = ButtonAsButton | ButtonAsLink;

function buttonClasses(size: ButtonSize, className: string | undefined) {
  return [
    "button",
    size === "small" ? "button--small" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: Props) {
  const size = props.size ?? "default";
  const classes = buttonClasses(size, props.className);

  if ("href" in props && props.href !== undefined) {
    const { size: _s, className: _c, children, ...linkRest } = props;
    return (
      <Link className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { size: _s, className: _c, children, ...buttonRest } = props;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
