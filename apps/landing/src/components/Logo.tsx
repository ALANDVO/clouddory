'use client';

export default function Logo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cloud shape */}
      <path
        d="M12 30c-3.3 0-6-2.7-6-6 0-2.8 1.9-5.2 4.5-5.8C11.3 14.3 15.2 11 20 11c4.2 0 7.8 2.5 9.3 6.1C30.1 17 31 17 32 17c3.3 0 6 2.7 6 6s-2.7 6-6 6H12z"
        fill="rgba(0, 229, 199, 0.12)"
        stroke="#00e5c7"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Fish body - stylized */}
      <ellipse cx="22" cy="24" rx="7" ry="4.5" fill="#00e5c7" opacity="0.9" />
      {/* Fish tail */}
      <path
        d="M14 24l-4-3.5v7z"
        fill="#67f7e0"
        opacity="0.8"
      />
      {/* Fish eye */}
      <circle cx="26" cy="23" r="1.2" fill="#050816" />
      <circle cx="26.3" cy="22.7" r="0.4" fill="white" />
      {/* Sonar waves emanating from fish */}
      <path
        d="M30 21c1.5-1.2 2.5-1 3.5-0.5"
        stroke="#67f7e0"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M30 24c2 0 3.2 0 4.5 0"
        stroke="#67f7e0"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M30 27c1.5 1.2 2.5 1 3.5 0.5"
        stroke="#67f7e0"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
