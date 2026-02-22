'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const search = searchParams.toString();
    const currentUrl = search ? `${pathname}?${search}` : pathname;

    posthog.capture('$pageview', {
      $current_url: currentUrl,
    });
  }, [pathname, searchParams]);

  return null;
}
