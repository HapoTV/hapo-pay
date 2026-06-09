import logoUrl from "../assets/Hapo_Pay_Logo___Secondary__NBG_.svg";

interface LogoProps {
  className?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}

export function Logo({ className, alt = "HapoPay logo", width, height }: LogoProps) {
  return <img src={logoUrl} alt={alt} className={className} width={width} height={height} />;
}
