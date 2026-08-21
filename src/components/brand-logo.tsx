import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  tone?: "auto" | "light";
};

export function BrandLogo({ className, tone = "auto" }: BrandLogoProps) {
  if (tone === "light") {
    return (
      <div aria-label="Conectados" className={cn("brand-logo", className)}>
        <Image
          src="/uploads/logo%20en%20blanco.png"
          alt=""
          className="h-full w-auto"
          width={3600}
          height={2400}
          sizes="(max-width: 640px) 240px, 340px"
        />
      </div>
    );
  }

  return (
    <div aria-label="Conectados" className={cn("brand-logo", className)}>
      <Image
        src="/uploads/logo%20a%20color%20.png"
        alt=""
        className="brand-logo-light h-full w-auto"
        width={3600}
        height={2400}
        sizes="(max-width: 640px) 240px, 340px"
      />
      <Image
        src="/uploads/logo%20en%20blanco.png"
        alt=""
        className="brand-logo-dark h-full w-auto"
        width={3600}
        height={2400}
        sizes="(max-width: 640px) 240px, 340px"
      />
    </div>
  );
}
