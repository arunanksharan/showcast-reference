import { supabase } from '@/src/utils/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).end(); // Make sure to end the response here
    return;
  }

  // Ensure the request uses the GET method
  if (req.method !== 'GET') {
    return res.status(405).end(); // Method not allowed
  }

  // Extract fc_id query param from request
  console.log('Session', JSON.stringify(session, null, 2));
  const fc_id = session.user?.fcId;
  // const { fcId } = req.query;

  if (!fc_id || typeof fc_id !== 'string') {
    return res.status(400).json({ error: 'fcId must be provided as a string' });
  }

  try {
    // Get room_id from user_room table in Supabase
    const { data, error } = await supabase
      .from('user_room')
      .select('huddle_room_id')
      .eq('id', fc_id)
      .single(); // Fetches only one record or null

    if (error) {
      console.error('Error fetching room data:', error);
      return res.status(500).json({ error: 'Failed to retrieve room data' });
    }

    // Send back the room_id or null if no data found
    console.log('Data:', data);
    const roomId = data ? data.huddle_room_id : null;
    console.log('Room ID:', roomId);
    return res.status(200).json({ roomId });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
