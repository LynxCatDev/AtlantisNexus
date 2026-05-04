import type { ElementType, HTMLAttributes, ReactNode } from "react";

import "./EmptyPanel.scss";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  compact?: boolean;
  children: ReactNode;
};

export function EmptyPanel({
  as: Tag = "section",
  compact = false,
  className,
  children,
  ...rest
}: Props) {
  const classes = [
    "empty-panel",
    compact ? "empty-panel--compact" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
