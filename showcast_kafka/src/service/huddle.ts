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
  return roomId;
};

export const updateSupabaseWithHuddleRoom = async (roomId: string) => {
  const { data: newRoom, error } = await supabase.from('rooms').insert([
    {
      huddle_room_id: roomId,
      host_is_joined: true,
      peer_is_joined: false,
    },
  ]);
};

export const updateSupabaseHostIsJoined = async (roomId: string) => {
  const { data: existingRoom, error } = await supabase
    .from('rooms')
    .update([
      {
        host_is_joined: true,
      },
    ])
    .eq('huddle_room_id', roomId)
    .select();
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
};

export const updateSupabaseUserRoom = async (roomId: string, fc_id: string) => {
  const { data: newUserRoom, error } = await supabase
    .from('user_room')
    .upsert({
      id: fc_id,
      huddle_room_id: roomId,
    })
    .select();
};
