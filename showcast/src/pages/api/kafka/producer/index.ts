import { Kafka, logLevel } from 'kafkajs';
import { getServerSession } from 'next-auth/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../../auth/[...nextauth]';

const kafka = new Kafka({
  brokers: ['add_your_own_broker_url_here'],
  ssl: true,
  sasl: {
    mechanism: 'add_your_own_mechanism_here',
    username: 'add_your_own_username_here',
    password: 'add_your_own_password_here',
  },
  logLevel: logLevel.ERROR,
});

const producer = kafka.producer();
// console.log(producer);

const run = async ({
  fc_id,
  actionType,
  roomId,
}: {
  fc_id: string;
  actionType: string;
  roomId: string;
}) => {
  console.log('FC_ID:', fc_id);
  await producer.connect();
  console.log('Producer connected', producer);

  const value = `${fc_id}||${roomId}||${actionType}`;

  await producer.send({
    topic: 'users-for-room',
    messages: [{ value: value }],
  });

  console.log('Message sent successfully');
  await producer.disconnect();
  return;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).end(); // Make sure to end the response here
    return;
  }
  if (req.method !== 'GET') {
    // Only GET method is supported
    res.status(405).end(); // End response for non-GET methods
    return;
  }

  console.log('Session', JSON.stringify(session, null, 2));
  const fc_id = session.user?.fcId; // '514730'

  // extract query param action from request
  const actionType = req.query.actionType || '';
  const roomId = req.query.roomId || '1';
  console.log('Action Type:', actionType);
  console.log(req.query);

  if (
    fc_id &&
    typeof fc_id === 'string' &&
    actionType &&
    typeof actionType === 'string' &&
    roomId &&
    typeof roomId === 'string'
  ) {
    await run({ fc_id, actionType, roomId });
    res.status(200).json({ message: 'Message sent successfully from API' });
  } else {
    res.status(500).json({ error: 'Failed to send message' });
  }
}
