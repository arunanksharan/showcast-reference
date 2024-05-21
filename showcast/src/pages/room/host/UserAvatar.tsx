import { Menu, Transition } from '@headlessui/react';
import { useLocalAudio, useLocalVideo } from '@huddle01/react/hooks';
import classNames from 'classnames';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { FaAngleDown } from 'react-icons/fa';

const UserAvatar = () => {
  const { disableVideo } = useLocalVideo();
  const { disableAudio } = useLocalAudio();
  const router = useRouter();

  // const {
  //     isAuthenticated, profile: { displayName, pfpUrl },
  // } = useProfile();
  const session = useSession();
  const user = session.data?.user;
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await disableVideo();
    await disableAudio();

    const roomId = router.query.roomId;

    if (roomId && typeof roomId === 'string') {
      try {
        const apiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/kafka/producer/?actionType=leave&roomId=${roomId}`,
          {
            method: 'GET',
          }
        );

        if (apiResponse.ok) {
          signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}` });
        } else {
          console.error('Failed to queue leave message in Kafka');
        }
      } catch (error) {
        console.error('Error fetching Kafka producer API:', error);
      }
    } else {
      console.error('Room ID not found in session');
      signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}` });
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="text-white font-manrope flex space-x-2 items-center px-4 mr-3 bg-white bg-opacity-20 h-full rounded-xl cursor-pointer text-sm outline-none border-none py-2">
          <img src={user.image || ''} alt="" className="h-5 w-5 rounded-full" />
          <span>{user.name}</span>
          <FaAngleDown />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-left text-sm border-none outline-none cursor-pointer hover:bg-gray-100'
                  )}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserAvatar;
