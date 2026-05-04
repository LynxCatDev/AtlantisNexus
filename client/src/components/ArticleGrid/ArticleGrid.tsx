import type { ElementType, HTMLAttributes, ReactNode } from "react";

import "./ArticleGrid.scss";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
};

export function ArticleGrid({
  as: Tag = "div",
  className,
  children,
  ...rest
}: Props) {
  const classes = className ? `article-grid ${className}` : "article-grid";
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
