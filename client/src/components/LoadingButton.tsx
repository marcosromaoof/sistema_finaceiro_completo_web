import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LoadingButtonProps {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function LoadingButton({
  children,
  loading,
  loadingText,
  disabled,
  variant,
  size,
  className,
  onClick,
  type,
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      type={type}
    >
      <motion.div
        className="flex items-center gap-2"
        whileTap={!loading && !disabled ? { scale: 0.95 } : undefined}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </motion.div>
    </Button>
  );
}
