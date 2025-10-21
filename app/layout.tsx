import type { ReactNode } from 'react';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

export const metadata = {
  title: 'Vegane Wunder Club',
  description: 'Community-Plattform für pflanzliche Wunder.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
