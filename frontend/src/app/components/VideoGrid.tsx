'use client';

import { VideoTrack } from 'livekit-client';
import { useRef, useEffect } from 'react';

interface VideoGridProps {
  participants: VideoTrack[];
}

const VideoGrid = ({ participants }: VideoGridProps) => {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const validParticipants = participants.filter(track => track.sid);

  useEffect(() => {
    console.log(`🔄 VideoGrid: Rerendering with ${validParticipants.length} participants.`);
    validParticipants.forEach((track) => {
      const videoElement = videoRefs.current[track.sid!];
      if (videoElement) {
        track.attach(videoElement);
        console.log(`🖼️ VideoGrid: Attached track ${track.sid} to video element.`);
      } else {
        console.warn(`⚠️ VideoGrid: Could not find video element for track ${track.sid}.`);
      }
    });

    return () => {
      console.log("🧹 VideoGrid: Cleaning up detached tracks.");
      validParticipants.forEach((track) => {
        track.detach();
      });
    };
  }, [validParticipants]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {validParticipants.length > 0 ? (
        validParticipants.map((track) => (
          <div key={track.sid!} className="bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={el => {
                if (track.sid) {
                  videoRefs.current[track.sid] = el;
                }
              }}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-sm p-4">No participants in the room.</p>
      )}
    </div>
  );
};

export default VideoGrid;
