// pages/room.tsx
import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { supabase } from '../../../utils/supabaseClient';
import React from 'react';
import {
  createHuddleRoom,
  updateSupabaseHostAndPeerIsJoined,
  updateSupabaseHostIsJoined,
  updateSupabaseWithHuddleRoom,
} from '@/src/utils/huddle';
import { consoleRoomId } from '@/src/utils/console';
import Image from 'next/image';
import UserAvatar from './UserAvatar';
import { BasicIcons } from '@/src/utils/BasicIcons';
import { useRouter } from 'next/router';

const RoomPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { data: session, status } = useSession();
  const fcId = session?.user?.fcId;

  useEffect(() => {
    const fetchRoom = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/room/get/?fc_id=${fcId}`
      );
      const { roomId } = await res.json();
      if (roomId !== null) router.push(`/room/host/${roomId}`);
    };
    fetchRoom();
    const intervalId = setInterval(() => fetchRoom(), 2000);
    return () => clearInterval(intervalId);
  }, [router, fcId]);
  return (
    <>
      {loading && (
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
            <div className=" h-full w-full flex items-center justify-center rounded-xl">
              <div>{BasicIcons.spin}</div>
              <p>We are finding a room for you!</p>
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default RoomPage;

// pages/room/host/index.tsx
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin', // Redirect to sign-in if not authenticated
        permanent: false,
      },
    };
  }

  try {
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/kafka/producer/?actionType=join&roomId=1}`,
      {
        method: 'GET',
        headers: {
          cookie: req.headers.cookie || '', // Pass along cookies to maintain the session
        },
      }
    );

    if (!apiResponse.ok) throw new Error('Failed to fetch');

    return {
      props: {}, // Props passed to the component
    };
  } catch (error) {
    console.error('Error fetching Kafka producer API:', error);
    return {
      props: {
        error: 'Failed to process request',
      },
    };
  }
};
