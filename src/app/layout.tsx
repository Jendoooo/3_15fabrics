import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: '3:15 Fabrics',
  description: 'Premium asoebi fabrics — Ankara, French Lace, Swiss Voile, Aso-Oke, Senator and more. Based in Epe, Lagos. Shop online.',
  icons: {
    icon: '/logo-black.png',
    shortcut: '/logo-black.png',
    apple: '/logo-white.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfairDisplay.variable} bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
