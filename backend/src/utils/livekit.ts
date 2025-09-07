import { AccessToken, RoomServiceClient, CreateOptions } from 'livekit-server-sdk';

const apiKey = process.env.LIVEKIT_API_KEY as string;
const apiSecret = process.env.LIVEKIT_API_SECRET as string;
const livekitUrl = process.env.LIVEKIT_URL as string;

// The client is now instantiated here, at the top level of the file.
// This assumes that dotenv.config() has been called in your app's entry point.
const client = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

console.log('LiveKit URL:', livekitUrl);

// Generate an access token for a participant
export function generateToken(roomName: string, identity: string) {
  const at = new AccessToken(apiKey, apiSecret);
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });
  at.identity = identity;
  at.ttl = '1h';
  return at.toJwt();
}

// Create a room if it doesn't exist
export async function createRoom(roomName: string) {
  const options: CreateOptions = {
    name: roomName,
  };
  try {
    // This now uses the pre-instantiated client
    const room = await client.createRoom(options);
    console.log('Room created:', room.name);
    return room;
  } catch (err: any) {
    if (err.code === 6) {
      console.log('Room already exists:', roomName);
    } else {
      console.error('Error creating room:', err);
    }
  }
}