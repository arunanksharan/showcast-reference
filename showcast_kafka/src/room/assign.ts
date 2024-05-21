import {
  createHuddleRoom,
  updateSupabaseHostAndPeerIsJoined,
  updateSupabaseHostIsJoined,
  updateSupabaseUserRoom,
  updateSupabaseWithHuddleRoom,
} from '../service/huddle';
import { supabase } from '../service/supabaseClient';
import { consoleRoomId } from '../utils/console';

const fetchRooms = async ({
  host_is_joined,
  peer_is_joined,
}: // roomIdLeft,
{
  host_is_joined: boolean;
  peer_is_joined: boolean;
  // roomIdLeft: string;
}) => {
  const { data: roomsData, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('host_is_joined', host_is_joined)
    .eq('peer_is_joined', peer_is_joined);

  const availableRooms = roomsData || [];
  console.log(availableRooms);
  return availableRooms;
};

async function getRandomRoom(availableRooms: any) {
  const randomRoom =
    (await availableRooms[Math.floor(Math.random() * availableRooms.length)]) ||
    {};
  return randomRoom;
}

export async function assignRoom(fc_id: string) {
  // Case 1: Find all rooms with single users - T,F - host is joined, peer is not joined
  // let availableRoomsWithHost = [] as any;
  let roomId: string;
  const availableRoomsWithHost = await fetchRooms({
    host_is_joined: true,
    peer_is_joined: false,
    // roomIdLeft: roomIdLeft as string,
  });

  if (availableRoomsWithHost.length == 0) {
    // No room found with Host = T, Peer = F

    const availableRoomsVacant = await fetchRooms({
      host_is_joined: false,
      peer_is_joined: false,
    });

    if (availableRoomsVacant.length == 0) {
      // No room found with Host = F, Peer = F
      // Create a new room
      roomId = await createHuddleRoom();

      // asign it to the user id as well in user-room table
      // const { data: newUserRoom, error } = await supabase
      //   .from('user_room')
      //   .upsert({
      //     fc_id: fc_id,
      //     room_id: roomId,
      //   })
      //   .select();

      // Update it in supabase
      await updateSupabaseWithHuddleRoom(roomId);
      await updateSupabaseUserRoom(roomId, fc_id);
      // Return that roomId
      return roomId;
    }

    // Get a random room from availableRoomsVacant
    const randomRoom = await getRandomRoom(availableRoomsVacant);
    consoleRoomId({
      module: 'room/host',
      line: '116',
      roomId: randomRoom?.huddle_room_id,
      text: 'Random Room from availableRoomsVacant',
    });
    roomId = randomRoom?.huddle_room_id;
    // asign it to the user id as well in user-room table

    await updateSupabaseHostIsJoined(roomId);
    await updateSupabaseUserRoom(roomId, fc_id);
    return roomId;
  }

  // Get a random room from availableRoomsWithHost
  const randomRoom = await getRandomRoom(availableRoomsWithHost);
  consoleRoomId({
    module: 'room/host',
    line: '135',
    roomId: randomRoom?.huddle_room_id,
    text: 'Random Room from availableRoomsWithHost',
  });
  roomId = randomRoom?.huddle_room_id;
  await updateSupabaseHostAndPeerIsJoined(roomId);
  await updateSupabaseUserRoom(roomId, fc_id);
  return roomId;
}
