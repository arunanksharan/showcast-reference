// pages/room.tsx
import { useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { supabase } from '@/src/utils/supabaseClient';

/** This Page has been discarded - the waiting room for user is /room/host */
const RoomPageOld = () => {
  return <p>We are preparing your room...</p>;
};

export default RoomPageOld;
