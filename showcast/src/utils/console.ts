export const consoleRoomId = ({
  text,
  roomId,
  topic,
  module,
  line,
}: {
  text?: string;
  roomId?: string;
  topic?: string;
  module?: string;
  line?: string;
}) => {
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log(`xxxxxxxxxx ${module}::${line} - Start xxxxxxxxxx`);
  console.log(`${text}::${roomId}`);
  console.log(`xxxxxxxxxx ${module}::${line} - End xxxxxxxxxx`);
};
