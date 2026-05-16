import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeScript } from '@/components/layout/ThemeScript';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amity',
  description: 'Video-first AI emotional recovery for high-pressure teams',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
