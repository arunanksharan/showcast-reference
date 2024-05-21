/**
 * This entire codebase has been moved to the kafka consumer where the consumer is assigning the room and updating the database state accordingly.
 */

import { supabase } from './supabaseClient';

export const createHuddleRoom = async () => {
  const response = await fetch('https://api.huddle01.com/api/v1/create-room', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Huddle01 Room',
    }),
    headers: {
      'Content-type': 'application/json',
      'x-api-key': process.env.HUDDLE_API_KEY || '',
    },
  });
  const data = await response.json();
  const roomId = data.data.roomId;
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('xxxxxxxxxx Huddle New Room Id - Start xxxxxxxxxx');
  console.log(`Newly Created RoomId Is :: ${roomId}`);
  console.log('xxxxxxxxxx Huddle New Room Id - End xxxxxxxxxx');
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  return roomId;
};

export const updateSupabaseWithHuddleRoom = async (roomId: string) => {
  const { data: newRoom, error } = await supabase.from('rooms').insert([
    {
      huddle_room_id: roomId,
      host_is_connecting: false,
      host_is_joined: true,
      peer_is_joined: false,
    },
  ]);

  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('RoomId Just Before Redirect', roomId);
  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
};

export const updateSupabaseHostIsJoined = async (roomId: string) => {
  const { data: existingRoom, error } = await supabase
    .from('rooms')
    .update([
      {
        peer_is_joined: true,
      },
    ])
    .eq('huddle_room_id', roomId)
    .select();

  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('xxxxxxxxxx Huddle Existing Room Id - Start xxxxxxxxxx');
  console.log(`Updated Existing RoomId Is :: ${roomId}`);
  console.log('xxxxxxxxxx Huddle Existing Room Id - End xxxxxxxxxx');
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
};

export const updateSupabaseHostAndPeerIsJoined = async (roomId: string) => {
  const { data: existingRoom, error } = await supabase
    .from('rooms')
    .update([
      {
        peer_is_joined: true,
      },
    ])
    .eq('huddle_room_id', roomId)
    .select();

  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('xxxxxxxxxx Huddle Existing Room Id - Start xxxxxxxxxx');
  console.log(`Updated Existing RoomId Is :: ${roomId}`);
  console.log('xxxxxxxxxx Huddle Existing Room Id - End xxxxxxxxxx');
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
};
