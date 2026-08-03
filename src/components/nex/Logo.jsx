import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/980c1fdce_generated_image.png";

export default function Logo({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-8",
    md: "h-14",
    lg: "h-20",
  };

  return (
    <img
      src={LOGO_URL}
      alt="NEX2"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
}