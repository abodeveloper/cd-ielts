import * as React from "react";
import { useEffect, useState } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { RiEyeCloseLine, RiEyeLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "focus-visible:ring-ring",
        failure:
          "focus-visible:ring-destructive focus-visible:text-destructive placeholder:text-destructive border-destructive text-destructive",
        success:
          "focus-visible:ring-success focus-visible:text-success placeholder:text-success border-success text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    const [isPassword, setIsPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
      setIsPassword(type === "password");
    }, [type]);
    return (
      <div className={"relative"}>
        <input
          type={!showPassword ? type : "text"}
          className={cn(
            inputVariants({ variant }),
            className,
            isPassword && "pr-12" // ⬅️ padding-right ni kattalashtirdik
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <Button
            type="button"
            size="icon"
            variant="ghost" // 👈 vizual yengil ko‘rinish uchun
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0 size-6 bg:transparent hover:bg-transparent focus:bg-transparent"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? <RiEyeLine /> : <RiEyeCloseLine />}
          </Button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
