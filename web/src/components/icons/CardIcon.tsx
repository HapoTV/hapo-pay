import type { SVGProps } from 'react';

export default function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 7a2 2 0 012-2h12a2 2 0 012 2v2H2V7z" />
      <path d="M2 11h16v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
