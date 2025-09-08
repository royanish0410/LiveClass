'use client';

import { useEffect, useState, useRef } from 'react';
import { Room, RoomEvent, VideoTrack, RemoteTrackPublication } from 'livekit-client';

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
        console.log(`Connected to LiveKit room: ${roomName}`);
        await livekitRoom.localParticipant.enableCameraAndMicrophone();
        didConnect.current = true;
      } catch (error) {
        console.error('Failed to connect to LiveKit room:', error);
      }
    };

    livekitRoom.on(RoomEvent.TrackPublished, (trackPublication: RemoteTrackPublication) => {
      if (trackPublication.kind === 'video' && trackPublication.track) {
        const videoTrack = trackPublication.track as VideoTrack;
        setParticipants(current => [...current, videoTrack]);
      }
    });

    livekitRoom.on(RoomEvent.TrackUnpublished, (trackPublication: RemoteTrackPublication) => {
      setParticipants(current => current.filter(t => t.sid !== trackPublication.trackSid));
    });

    connect();

    return () => {
      if (didConnect.current) {
        livekitRoom.disconnect();
        didConnect.current = false;
      }
    };
  }, [token, roomName]);

  // Expose the room object so the parent component can call disconnect()
  return { room, participants };
};