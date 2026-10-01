import type { SVGProps } from 'react';

export default function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 2a7 7 0 100 14A7 7 0 009 2zM8 6h2v5H8V6zm1 8a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}
