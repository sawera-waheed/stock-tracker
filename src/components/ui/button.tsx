"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx"; // Optional, helpful for class merging

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

type CustomButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: CustomButtonProps) => {
  const baseStyles =
    "rounded-xl text-white font-semibold shadow hover:opacity-90 transition";

  const variantStyles = {
    primary: "bg-blue-700",
    secondary: "bg-gray-600",
    danger: "bg-red-600",
    ghost: "bg-blue-700",
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-2",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <button
      {...props}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </button>
  );
};
