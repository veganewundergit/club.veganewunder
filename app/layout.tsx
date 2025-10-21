import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Vegane Wunder Club',
  description: 'Community-Plattform für pflanzliche Wunder.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
