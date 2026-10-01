import type { SVGProps } from 'react';

export default function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 1l4 4m0 0l-4 4m4-4H7a6 6 0 00-6 6v3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15l4 4m0 0l4-4m-4 4V7a6 6 0 016-6h3" />
    </svg>
  );
}
