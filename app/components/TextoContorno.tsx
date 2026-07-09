import type { ReactNode } from "react";

type TextoContornoProps = {
  children: ReactNode;
  grosor?: string;
  colorBorde?: string;
  className?: string;
};

const TextoContorno = ({
  children,
  grosor = "1px",
  colorBorde = "rgba(255,255,255,0.85)",
  className = "",
}: TextoContornoProps) => {
  return (
    <span
      style={{
        WebkitTextStroke: `${grosor} ${colorBorde}`,
      }}
      className={className}
    >
      {children}
    </span>
  );
};

export default TextoContorno;
