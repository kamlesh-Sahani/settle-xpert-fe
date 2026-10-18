import React from 'react';

const ExchangeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Top arrow */}
    <path d="M 4 12 a 6 6 0 0 1 6 -6 h 10" />
    <path d="M 16 2 l 4 4 l -4 4" />
    
    {/* Bottom arrow */}
    <path d="M 20 12 a 6 6 0 0 1 -6 6 h -10" />
    <path d="M 8 22 l -4 -4 l 4 -4" />
  </svg>
);

export default ExchangeIcon;
