// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import run from '@/src/services/kafka/producer';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // await ru('224616').catch((e) =>
  //   console.error('[example/producer] e.message', e)
  // );
  console.log('Inside hello');
  res.status(200).json({ name: 'John Doe' });
}
