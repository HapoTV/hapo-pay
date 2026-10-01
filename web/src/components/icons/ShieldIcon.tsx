import type { SVGProps } from 'react';

export default function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2.5a1 1 0 01.832.445l4.5 6a1 1 0 01.168.645v3.764a7 7 0 01-4.332 6.44l-.168.063a.997.997 0 01-.832 0 7 7 0 01-4.332-6.44V9.59a1 1 0 01.168-.645l4.5-6A1 1 0 0110 2.5zm0 1.68L6.5 9.5v3.764a5 5 0 003.5 4.286 5 5 0 003.5-4.286V9.5L10 4.18z" clipRule="evenodd" />
    </svg>
  );
}
