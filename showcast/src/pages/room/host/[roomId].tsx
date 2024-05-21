import {
  useLocalAudio,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from '@huddle01/react/hooks';
import { signOut, useSession, getSession } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import { useGlobalContext } from '../../../context/GlobalContext';
import UserAvatar from './UserAvatar';
import { useProfile } from '@farcaster/auth-kit';
import { TPeerMetadata } from '@/src/utils/types';
import classNames from 'classnames';
import RemotePeer from '@/src/components/RemotePeer/RemotePeer';
import { GetServerSideProps, NextPage } from 'next';
import { BasicIcons } from '@/src/utils/BasicIcons';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  token: string;
};

export default function HostRoom() {
  const [displayName, setDisplayName] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const pathName = router.pathname;
  const { data: session } = useSession();
  const fcId = session?.user?.fcId || '';
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const prevRoomIdRef = useRef<string | undefined>(undefined);

  const { isAuthenticated } = useProfile();
  const { joinRoom, leaveRoom, state } = useRoom({
    onJoin: async (room: any) => {
      console.log('onJoin', room.state);
      updateMetadata({ displayName: 'User1' });
    },
    onPeerJoin: (peer) => {
      console.log('onPeerJoin', peer);
    },
    onLeave: async () => {
      console.log('onLeave');
      try {
        const apiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/kafka/producer/?actionType=leave&roomId=${roomId}`,
          {
            method: 'GET',
          }
        );
        setTimeout(() => {
          window.location.replace('/room/host/');
        }, 2000);
      } catch (error) {
        console.error('Error fetching Kafka producer API:', error);
      }
    },
  });

  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const { updateMetadata } = useLocalPeer<TPeerMetadata>();
  const { peerIds } = usePeerIds();
  const roomId = router.query.roomId as string;

  // Every time roomId changes, join the room
  useEffect(() => {
    const join = async () => {
      // Get Access Token for the room
      const response = await fetch('/api/room/getAccessToken', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      await joinRoom({
        roomId,
        token: data.token,
      });
      await enableVideo();
      await enableAudio();
    };

    join();
  }, [roomId]); // roomId

  // Video Ref and Stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  const handleLeaveRoom = async () => {
    leaveRoom();
  };

  return (
    <main className={`flex h-screen w-screen flex-col items-stretch p-4`}>
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
      <div className="flex-1 h-full w-full max-w-full max-h-max border relative rounded-xl">
        {!isVideoOn && (
          <div className=" h-full w-full flex items-center justify-center rounded-xl">
            <div>{BasicIcons.spin}</div>
          </div>
        )}
        {isVideoOn && (
          <div
            className={classNames(
              'rounded-xl absolute bg-blue-300',
              !peerIds.length && 'h-full w-full',
              peerIds.length && 'bottom-4 right-4 h-36 w-auto z-10'
            )}
          >
            <video
              ref={videoRef}
              className={classNames(
                'object-cover rounded-xl max-w-full w-full h-full',
                state !== 'connected' && 'animate-pulse'
                // peerIds.length && "aspect-video"
              )}
              autoPlay
              muted
            />
          </div>
        )}

        {state === 'connected' && peerIds.length >= 1 && (
          <div className="rounded-xl absolute h-full w-full ">
            {peerIds.map((peerId) => {
              console.log('peerId', peerId);
              return peerId ? (
                <RemotePeer key={peerId} peerId={peerId} />
              ) : null;
            })}
          </div>
        )}
      </div>
      <div className="flex flex-row md:fixed bottom-10 justify-center w-full left-0 mt-4">
        {state === 'connected' && (
          <>
            <button
              type="button"
              className="border-1 border-solid border-hero-bg bg-hero-bg text-white font-manrope py-2 px-8 rounded-full flex items-center justify-center hover:bg-hero-bg transition-all mx-4 cursor-pointer"
              onClick={handleLeaveRoom}
            >
              Leave
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/signIn',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
