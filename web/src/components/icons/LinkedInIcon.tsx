import type { SVGProps } from "react";

export default function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zm-5 19h-2v-6h2v6zm-1-7.2a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4zM18 19h-2v-3c0-.83-.67-1.5-1.5-1.5S13 15.17 13 16v3h-2v-6h2v.52c.3-.36.76-.52 1.24-.52 1.17 0 2.26.96 2.26 2.4V19z" />
    </svg>
  );
}
