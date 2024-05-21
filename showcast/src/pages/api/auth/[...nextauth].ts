import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '../../../utils/supabaseClient';

export const authHandler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);

export default authHandler;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'Sign in with Farcaster',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
        // In a production app with a server, these should be fetched from
        // your Farcaster data indexer rather than have them accepted as part
        // of credentials.
        name: {
          label: 'Name',
          type: 'text',
          placeholder: '0x0',
        },
        pfp: {
          label: 'Pfp',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials, req) {
        const csrfToken = req.body?.csrfToken;
        const appClient = createAppClient({
          ethereum: viemConnector(),
        });

        const verifyResponse = await appClient.verifySignInMessage({
          message: credentials?.message as string,
          signature: credentials?.signature as `0x${string}`,
          domain: `${process.env['NEXTAUTH_URL']}`,
          nonce: csrfToken,
        });
        const { success, fid } = verifyResponse;
        console.log('Inside authorize', success, fid);

        if (!success) {
          console.log('Inside NOT success');
          return null;
        }

        const fc_id = fid.toString();
        let sc_user_id = null;
        const { data: existingUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('fc_id', fc_id);

        if (existingUser?.length == 0) {
          const { data: newUser, error } = await supabase
            .from('users')
            .insert([
              {
                fc_id: fc_id,
                fc_username: credentials?.name as string,
                fc_image_url: credentials?.pfp as string,
              },
            ])
            .select();
          console.log('New User:', newUser);
          console.log('Error:', error);
          sc_user_id = newUser?.[0].id;
          sc_user_id = newUser?.[0].id;
        }

        // Update is_active=true & session_huddle_room_id=''
        if (existingUser?.length == 1) {
          sc_user_id = existingUser[0].id;
        }

        return {
          id: sc_user_id,
          fcId: fc_id,
          name: credentials?.name as string,
          image: credentials?.pfp as string,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          fcId: user.fcId,
          // roomId: user.roomId,
        };
      }
      return token;
    },
    async session({ session, token, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          fcId: token.fcId,
        },
      };
    },
  },
};
