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
      <rect x="1" y="3" width="22" height="18" rx="3" fill="#4B6BFB" />
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
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#E53935" />
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
        letterSpacing="0"
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

export function GoogleDriveIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8.267 3L1.5 15.134l3.75 6.5h15l-3.75-6.5L8.267 3z"
        fill="none"
      />
      <path
        d="M8.267 3L4.517 9.567h7.5L15.767 3H8.267z"
        fill="#4285F4"
      />
      <path
        d="M4.517 9.567L1.5 15.134H9l3.017-5.567H4.517z"
        fill="#0F9D58"
      />
      <path
        d="M12.017 9.567L9 15.134h6l3-5.567h-6z"
        fill="#FBBC05"
      />
      <path
        d="M9 15.134l-3.75 6.5h15l-3.75-6.5H9z"
        fill="#EA4335"
      />
      <path
        d="M15.767 3L12.017 9.567h6L22.5 3h-6.733z"
        fill="#1A73E8"
      />
      <path
        d="M12.017 9.567H18L22.5 3l-6.733 0L12.017 9.567z"
        fill="none"
      />
    </svg>
  );
}

export function OneDrivePersonalIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.5 8.5C13.5 6.57 11.93 5 10 5C8.37 5 7.01 6.11 6.6 7.6C5.14 7.85 4 9.12 4 10.65C4 12.33 5.37 13.7 7.05 13.7H13.5V8.5Z"
        fill="#1976D2"
      />
      <path
        d="M6.6 7.6C7.01 6.11 8.37 5 10 5C11.93 5 13.5 6.57 13.5 8.5V13.7H16.6C18.48 13.7 20 12.18 20 10.3C20 8.62 18.78 7.23 17.17 6.97C16.93 5.28 15.46 4 13.73 4C13.15 4 12.6 4.15 12.13 4.41C11.57 3.56 10.61 3 9.5 3C7.84 3 6.5 4.34 6.5 6C6.5 6.22 6.53 6.42 6.57 6.62L6.6 7.6Z"
        fill="#42A5F5"
      />
      <rect x="4" y="13.7" width="16" height="7.3" rx="2" fill="#1565C0" />
    </svg>
  );
}

export function OneDriveWorkIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.5 8.5C13.5 6.57 11.93 5 10 5C8.37 5 7.01 6.11 6.6 7.6C5.14 7.85 4 9.12 4 10.65C4 12.33 5.37 13.7 7.05 13.7H13.5V8.5Z"
        fill="#0078D4"
      />
      <path
        d="M6.6 7.6C7.01 6.11 8.37 5 10 5C11.93 5 13.5 6.57 13.5 8.5V13.7H16.6C18.48 13.7 20 12.18 20 10.3C20 8.62 18.78 7.23 17.17 6.97C16.93 5.28 15.46 4 13.73 4C13.15 4 12.6 4.15 12.13 4.41C11.57 3.56 10.61 3 9.5 3C7.84 3 6.5 4.34 6.5 6C6.5 6.22 6.53 6.42 6.57 6.62L6.6 7.6Z"
        fill="#50B0FF"
      />
      <rect x="4" y="13.7" width="16" height="7.3" rx="2" fill="#005A9E" />
      <path
        d="M10.5 16.5H13.5V19.5H10.5V16.5Z M10.5 16.5L12 15L13.5 16.5"
        fill="white"
        opacity="0.6"
      />
    </svg>
  );
}

export function GoogleDriveIconFull({ size = 22, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 87.3 78"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5C.4 49.9 0 51.45 0 53H27.5z" fill="#00ac47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.75L65.4 64z" fill="#ea4335"/>
      <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="M59.75 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.75 53H87.1c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );
}
