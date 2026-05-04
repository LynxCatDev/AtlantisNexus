import type { ElementType, HTMLAttributes, ReactNode } from "react";

import "./Eyebrow.scss";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
};

export function Eyebrow({ as: Tag = "p", className, children, ...rest }: Props) {
  const classes = className ? `eyebrow ${className}` : "eyebrow";
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
