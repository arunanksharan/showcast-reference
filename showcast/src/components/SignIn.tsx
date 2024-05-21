import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useSession, signIn, getCsrfToken } from 'next-auth/react';
import { StatusAPIResponse } from '@farcaster/auth-kit';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Common.module.css';
import ShowcastLoginBtn from './ShowcastLoginBtn';

function SignIn() {
  const [error, setError] = useState(false);
  const [isSignInComplete, setIsSignInComplete] = useState(false); // New state to control the sign-in completion
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  const stopVideoStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isSignInComplete) {
      stopVideoStream();
    }
  }, [isSignInComplete]);

  useEffect(() => {
    if (status === 'authenticated' && !isSignInComplete) {
      setIsSignInComplete(true); // Mark sign-in as complete
      router.push('/room/host');
    }
  }, [status, isSignInComplete, router]);

  useEffect(() => {
    // Function to initialize the webcam
    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        // setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing the webcam', err);
      }
    };

    initializeWebcam();

    // Setup event listener for route changes
    const handleRouteChange = () => {
      stopVideoStream();
    };
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      stopVideoStream();
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error('Unable to generate nonce');
    console.log('Nonce: ', nonce);
    return nonce;
  }, []);

  const handleSuccess = useCallback(
    async (res: StatusAPIResponse) => {
      console.log('Inside signin', res);
      if (status !== 'authenticated') {
        // Only call signIn if not already authenticated
        const result = await signIn('credentials', {
          message: res.message,
          signature: res.signature,
          name: res.username,
          pfp: res.pfpUrl,
          redirect: false,
        });
        if (result?.ok) {
          console.log('Sign in successful');
          console.log(JSON.stringify(result));
          setIsSignInComplete(true); // Mark sign-in as complete

          router.push(`/room/host`); // Use Next.js router for redirection
        }
      }
    },
    [status, router]
  );

  if (status === 'authenticated' && isSignInComplete) {
    // User is authenticated and sign-in is complete, no need to render SignInButton
    return null;
  }
  // lg:m-0 lg:p-0
  // max-[740px]:text-4xl

  return (
    <div className="flex flex-col w-full h-screen bg-white ">
      <div className="mx-2 mt-4 mb-2 flex flex-row justify-center items-center bg-hero-bg py-2 rounded-2xl">
        <Image
          src="/logo.svg"
          alt="showcast logo"
          width={202}
          height={41}
          className="logo mx-auto h-8 py-2"
        />

        {/* <ShowcastLoginBtn
          nonce={getNonce}
          onSuccess={handleSuccess}
          onError={() => setError(true)}
          className="mr-3 lg:block hidden"
        /> */}
      </div>
      {/* <div className="lg:flex flex-1 lg:flex-row lg:w-full"> */}
      <div className="flex flex-col md:flex-row md:gap-3 w-full h-[80vh] max-[768px]:h-fit px-2">
        <div className="md:w-full md:h-full md:flex-1 my-4 rounded-3xl md:max-w-fit md:overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="lg:w-full lg:h-full rounded-3xl max-[768px]:min-h-[75vh]"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="w-full h-full flex flex-col flex-1 my-4 justify-between items-center bg-signin-content-bg rounded-xl">
          <div className="lg:max-w-md lg:px-0 p-4 px-4 relative">
            <div
              className={`font-mona text-3xl font-black uppercase text-black mb-4 bg-red-400`}
            >
              Welcome to Showcast
            </div>
            <div
              className={`font-mona pt-4 py-2 font-black uppercase text-hero-bg lg:text-6xl text-6xl `}
            >
              Ready to Meet
              <br />
              Farcaster
              <br />
              Frens?
            </div>
            <hr className="opacity-30" />
            <div className="max-[882px]:text-xs text-sm grid gap-2 my-4">
              <div className="font-manrope font-thin">
                <span className="font-medium">1. Age Limit:</span> Must be 18+
                or 13+ with parental consent
              </div>
              <div className="font-manrope font-thin">
                <span className="font-medium">2. Content Alert:</span> May
                encounter adult or offensive content
              </div>
              <div className="font-manrope font-thin">
                <span className="font-medium">3. Respect Others:</span> No
                harassment or discrimination tolerated
              </div>
              <div className="font-manrope font-thin">
                <span className="font-medium">4. Protect Privacy:</span> Avoid
                sharing personal info
              </div>
              <div className="font-manrope font-thin">
                <span className="font-medium">5. Use at Own Risk:</span> Not
                liable for user interactions
              </div>
            </div>
            <hr className="opacity-30" />
            <div className="font-manrope font-light text-gray-500 text-sm mb-8">
              Signing up for a Showcast account means you agree to the{' '}
              <Link
                className="no-underline outline-none text-black font-medium"
                href="#"
              >
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                className="no-underline outline-none text-black font-medium"
                href="#"
              >
                Terms of Service
              </Link>
              .
            </div>

            <ShowcastLoginBtn
              nonce={getNonce}
              onSuccess={handleSuccess}
              onError={() => setError(true)}
              fullWidth
              className="bottom-4 px-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
