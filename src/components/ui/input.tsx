"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full rounded-md border border-gray-600 bg-gray-800 text-sm text-white placeholder-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
