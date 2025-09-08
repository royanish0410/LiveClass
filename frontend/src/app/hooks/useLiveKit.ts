'use client';

import { useEffect, useState, useRef } from 'react';
import { Room, RoomEvent, VideoTrack} from 'livekit-client';

const LIVEKIT_CLOUD_URL = 'wss://liveclass-0c9743o3.livekit.cloud';

export const useLiveKit = (token: string | null, roomName: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<VideoTrack[]>([]);
  const didConnect = useRef(false);

  useEffect(() => {
    if (didConnect.current || !token || !roomName) {
      return;
    }

    const livekitRoom = new Room();
    setRoom(livekitRoom);

    const connect = async () => {
      try {
        await livekitRoom.connect(LIVEKIT_CLOUD_URL, token);
        
        try {
          await livekitRoom.localParticipant.enableCameraAndMicrophone();

          // ✅ Fetch local video track and existing remote tracks
          const localVideoTrack = Array.from(livekitRoom.localParticipant.trackPublications.values())
            .find(pub => pub.track && pub.track.kind === 'video')
            ?.track as VideoTrack;

          const remoteVideoTracks = Array.from(livekitRoom.remoteParticipants.values())
            .flatMap(participant =>
              Array.from(participant.trackPublications.values())
                .filter(pub => pub.track && pub.track.kind === 'video')
                .map(pub => pub.track as VideoTrack)
            );

          const initialTracks = [];
          if (localVideoTrack) initialTracks.push(localVideoTrack);
          if (remoteVideoTracks.length > 0) initialTracks.push(...remoteVideoTracks);

          setParticipants(initialTracks);

        } catch (mediaError) {
          console.error("❌ Failed to enable camera/microphone:", mediaError);
        }

        didConnect.current = true;

      } catch (error) {
        console.error('❌ Failed to connect to LiveKit room:', error);
      }
    };

    livekitRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === 'video') {
        setParticipants(current => [...current, track as VideoTrack]);
      }
    });

    livekitRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      if (track.kind === 'video') {
        setParticipants(current => current.filter(t => t.sid !== track.sid));
      }
    });

    connect();

    return () => {
      if (didConnect.current) {
        livekitRoom.disconnect();
        didConnect.current = false;
      }
    };
  }, [token, roomName]);

  return { room, participants };
};
