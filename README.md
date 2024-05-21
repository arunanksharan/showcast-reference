# showcast-reference

The 95% completed code for Showcast

## Objective

The objective was to create an Omegle/Chatroulette like app for Farcaster accounts.

1. User can sign in with Farcaster account. FC-Authkit has been used to enable this. Reference: https://docs.farcaster.xyz/auth-kit/introduction

2. The user is assigned to a random room with another signed in user.
   Reference: https://warpcast.com/arunank/0x3cc5362e

3. The user can leave the room and this process repeats till the user signs out.

4. Huddle SDK has been integrated to handle the video calling infrastructure.

5. Kafka queue has been added to avoid race conditions between users leaving and joining the room.

Overall Architecture:
https://warpcast.com/arunank/0x11c281a9

## Personal Note:

Somehow it did not come to pass by my hand! So close, yet so far.
Whosoever is reading this, happy coding! And, please let me know where I went wrong.

**PS: I would advise you to think out your infra and flows first before going through this repo and diagrams.**

It will help you avoid a bias towards my approach which somehow did not work!
