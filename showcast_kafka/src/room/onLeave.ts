import { supabase } from '../service/supabaseClient';

export async function updateRoomStatusOnLeave(userId: string, roomId: string) {
  console.log('RoomId from updateRoomStatus', roomId);
  if (!roomId) return { error: 'Room ID not provided' };

  // Fetch room details from supabase to check if the host is leaving or peer is leaving
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('huddle_room_id', roomId);

  console.log('Room data:', roomData);
  console.log('Room error:', roomError);

  if (roomError) {
    console.error('Error fetching room data:', roomError);
    return { error: roomError.message || 'An unexpected error occurred' };
  }

  if (!roomData || roomData.length === 0) {
    return { error: 'Room not found' };
  }

  const room = roomData[0];
  let updateRoom;

  if (room.host_is_joined && room.peer_is_joined) {
    updateRoom = {
      host_is_joined: true,
      peer_is_joined: false,
    };
  } else if (room.host_is_joined && !room.peer_is_joined) {
    updateRoom = {
      host_is_joined: false,
      peer_is_joined: false,
    };
  }

  if (updateRoom) {
    const { data: updatedRoomData, error: updateRoomError } = await supabase
      .from('rooms')
      .update(updateRoom)
      .eq('huddle_room_id', roomId)
      .select();

    if (updateRoomError) {
      console.error('Error updating room data:', updateRoomError);
      return {
        error: updateRoomError.message || 'An unexpected error occurred',
      };
    }
    console.log('Room state updated:', updatedRoomData);
  }

  // Update user_room table
  const { data: userRoomData, error: userRoomError } = await supabase
    .from('user_room')
    .update({
      huddle_room_id: null,
    })
    .eq('huddle_room_id', roomId)
    .select();

  console.log('User room data:', userRoomData);

  if (userRoomError) {
    console.error('Error updating user room data:', userRoomError);
    return { error: userRoomError.message || 'An unexpected error occurred' };
  }

  return { message: 'Room status after leaving room updated' };
}
