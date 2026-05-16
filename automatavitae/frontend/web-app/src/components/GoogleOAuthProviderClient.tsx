"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';

export function GoogleOAuthProviderClient({ children }: { children: React.ReactNode }) {
  // Use a fallback or environment variable for the client ID
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
