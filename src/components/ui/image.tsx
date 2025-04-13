
import React, { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AccessibleImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  description?: string; // Descrição longa para imagens complexas
}

const Image = forwardRef<HTMLImageElement, AccessibleImageProps>(
  ({ alt, className, fallbackSrc, description, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    
    const handleError = () => {
      if (fallbackSrc) {
        setImgError(true);
      }
    };
    
    // Verificar se há alt text
    if (!alt && process.env.NODE_ENV === "development") {
      console.warn("Image component used without alt text. Please provide alt text for accessibility.");
    }
    
    return (
      <figure className={cn("relative", className)}>
        <img
          ref={ref}
          alt={alt || ""}
          onError={handleError}
          src={imgError ? fallbackSrc : props.src}
          className={cn("max-w-full", className)}
          loading={props.loading || "lazy"}
          {...props}
          aria-describedby={description ? `desc-${props.id || Math.random().toString(36).substring(2, 11)}` : undefined}
        />
        {description && (
          <figcaption 
            id={`desc-${props.id || Math.random().toString(36).substring(2, 11)}`}
            className="sr-only"
          >
            {description}
          </figcaption>
        )}
      </figure>
    );
  }
);

Image.displayName = "Image";

export { Image };
