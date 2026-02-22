'use client';

import { ReactNode, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PostHogContextProvider } from 'posthog-js/react';

type PostHogProviderProps = {
  children: ReactNode;
};

let isPostHogInitialized = false;

export default function PostHogProvider({ children }: PostHogProviderProps) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  useEffect(() => {
    if (!posthogKey || !posthogHost || isPostHogInitialized) {
      return;
    }

    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false,
    });

    isPostHogInitialized = true;
  }, [posthogHost, posthogKey]);

  if (!posthogKey || !posthogHost) {
    return <>{children}</>;
  }

  return <PostHogContextProvider client={posthog}>{children}</PostHogContextProvider>;
}
