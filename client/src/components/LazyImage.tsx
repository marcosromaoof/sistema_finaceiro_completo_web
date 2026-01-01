import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  threshold?: number;
}

/**
 * Componente de imagem com lazy loading usando Intersection Observer
 * Carrega a imagem apenas quando ela entra no viewport
 * 
 * @param src - URL da imagem
 * @param alt - Texto alternativo
 * @param fallback - URL de fallback caso a imagem falhe ao carregar
 * @param threshold - Threshold do Intersection Observer (0-1)
 * @param className - Classes CSS adicionais
 */
export function LazyImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className,
  threshold = 0.1,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Se não houver suporte ao Intersection Observer, carregar imagem imediatamente
    if (!("IntersectionObserver" in window)) {
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin: "50px", // Começar a carregar 50px antes de entrar no viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, threshold]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50",
          className
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
