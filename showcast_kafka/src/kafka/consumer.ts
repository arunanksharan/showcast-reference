import { Kafka, logLevel } from 'kafkajs';
import { assignRoom } from '../room/assign';
import { updateRoomStatusOnLeave } from '../room/onLeave';

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

const consumer = kafka.consumer({ groupId: 'internal-heron' });

export const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'users-for-room', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });
      console.log('Message received by consumer, line 27');
      const userRoomAction: string | null = message.value?.toString() || null;
      if (userRoomAction !== null) {
        const [userId, roomId, action] = userRoomAction.split('||');
        console.log('User ID:', userId);
        console.log('Room ID:', roomId);
        console.log('Action:', action);
        try {
          if (action === 'join') {
            await assignRoom(userId);
          }
          if (action === 'leave') {
            const result = await updateRoomStatusOnLeave(userId, roomId);
            if (result.error) {
              console.error(
                'Error updating room status on leave:',
                result.error
              );
            } else {
              console.log(result.message);
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    },
  });
};

// run().catch((e) => console.error('[example/consumer] e.message', e));
