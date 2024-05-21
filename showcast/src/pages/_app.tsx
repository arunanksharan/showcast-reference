import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { SessionProvider } from 'next-auth/react';
import { useState, createContext, useEffect } from 'react';
import { GlobalContextProvider } from '../context/GlobalContext';
import { signOut } from 'next-auth/react';
import { farcasterConfig } from '../services/config';
import React from 'react';
import { useRouter } from 'next/router';

import { HuddleClient, HuddleProvider } from '@huddle01/react';
import { monaFont } from '../font/fonts';
import Image from 'next/image';
import ShowcastLoginBtn from '../components/ShowcastLoginBtn';
import UserAvatar from './room/host/UserAvatar';
// import { Room } from '@/types/room';

const huddleClient = new HuddleClient({
  projectId: 'M1Q01XrKT3ouASzfleYo-HuutwpY3o56',
  options: {
    activeSpeakers: {
      size: 8,
    },
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // console.log('AuthKitProvider config', config);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && setLoading(true);
    const handleComplete = (url: string) => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <div className={monaFont.variable}>
      <GlobalContextProvider>
        <SessionProvider session={session}>
          <HuddleProvider client={huddleClient}>
            <AuthKitProvider config={farcasterConfig}>
              {/* {session && (
                <button
                  onClick={() =>
                    signOut({ callbackUrl: 'http://localhost:3000/' })
                  }
                >
                  Sign Out
                </button>
              )} */}
              {loading && (
                <main
                  className={`flex h-screen w-screen flex-col items-stretch p-4`}
                >
                  <div className="mb-4 py-3 flex flex-row justify-between items-center rounded-2xl bg-hero-bg w-full">
                    <Image
                      src="/logo.svg"
                      alt="showcast logo"
                      width={78}
                      height={41}
                      className="logo lg:ml-10 mx-auto h-8 py-2"
                    />

                    <UserAvatar />
                  </div>
                  <div className="flex-1 h-full w-full max-w-full max-h-max border relative rounded-xl"></div>
                </main>
              )}
              <Component {...pageProps} />
            </AuthKitProvider>
          </HuddleProvider>
        </SessionProvider>
      </GlobalContextProvider>
    </div>
  );
}
