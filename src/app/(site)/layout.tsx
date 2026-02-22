import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostHogPageView from '@/components/PostHogPageView';
import PostHogProvider from '@/components/PostHogProvider';
import PageTransition from '@/components/PageTransition';
import BackToTop from '@/components/BackToTop';

export const metadata: Metadata = {
  title: {
    default: '315 Fabrics',
    template: '%s — 315 Fabrics',
  },
  description: 'Premium asoebi fabrics — Ankara, French Lace, Swiss Voile, Aso-Oke, Senator and more. Based in Epe, Lagos. Shop online.',
  openGraph: {
    siteName: '315 Fabrics',
    locale: 'en_NG',
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <PageTransition>{children}</PageTransition>
        </main>
        <BackToTop />
        <Footer />
      </div>
    </PostHogProvider>
  );
}
