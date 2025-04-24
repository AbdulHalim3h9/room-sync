// src/components/ui/button.js
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-accent",
        ghost:
          "bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-accent",
        green:
          "bg-green-600 text-white hover:bg-green-700 focus:ring-green-200 shadow-md text-base h-12 w-full",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-12 px-6",
        icon: "h-7 w-7 p-0", // For nav_button in Calendar
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

export const Button = ({ className, variant, size, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

Button.displayName = "Button";