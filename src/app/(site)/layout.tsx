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
    default: 'iby_closet',
    template: '%s — iby_closet',
  },
  description: "Lagos men's fashion. Designed by Ibrahim Hamed.",
  openGraph: {
    siteName: 'iby_closet',
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
