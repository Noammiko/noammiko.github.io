import * as React from "react";
import { Button, type ButtonProps } from "./button";

// Exclude keys from anchor props that are already in ButtonProps
type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonProps>;

export interface LinkProps extends ButtonProps, AnchorProps {
  children?: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, target, children, ...props }) => {
  return (
    <Button {...props} asChild>
      <a href={href} target={target}>{children}</a>
    </Button>
  );
};

Link.displayName = "Link";

export { Link };
