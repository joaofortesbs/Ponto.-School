import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export function MarkdownIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1" y="3" width="22" height="18" rx="3" fill="url(#md-grad)" />
      <path
        d="M4.5 15.5V8.5H6.5L8.5 11L10.5 8.5H12.5V15.5H10.5V11.5L8.5 14L6.5 11.5V15.5H4.5Z"
        fill="white"
      />
      <path
        d="M17.5 15.5L15 12.5H16.5V8.5H18.5V12.5H20L17.5 15.5Z"
        fill="white"
      />
      <defs>
        <linearGradient id="md-grad" x1="1" y1="3" x2="23" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4B6BFB" />
          <stop offset="1" stopColor="#3451D1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PDFIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1" y="1" width="22" height="22" rx="3" fill="url(#pdf-grad)" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fill="white"
        fontSize="7.5"
        fontWeight="bold"
        fontFamily="'Inter','Arial',sans-serif"
        letterSpacing="0.5"
      >
        PDF
      </text>
      <defs>
        <linearGradient id="pdf-grad" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF5350" />
          <stop offset="1" stopColor="#B71C1C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DocxIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1" y="1" width="22" height="22" rx="3" fill="url(#docx-grad)" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="bold"
        fontFamily="'Times New Roman','Georgia',serif"
      >
        W
      </text>
      <defs>
        <linearGradient id="docx-grad" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E88E5" />
          <stop offset="1" stopColor="#1565C0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
