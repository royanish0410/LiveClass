'use client';

import { VideoTrack } from 'livekit-client';
import { useRef, useEffect } from 'react';

interface VideoGridProps {
  participants: VideoTrack[];
}

const VideoGrid = ({ participants }: VideoGridProps) => {
  // Use a ref to hold a list of video elements
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // This effect handles the attachment and detachment of tracks to video elements.
    
    // Attach each participant's video track to a corresponding video element.
    // The attach() method is idempotent, so it's safe to call even if the track is already attached.
    participants.forEach((track, index) => {
      const videoElement = videoRefs.current[index];
      if (videoElement) {
        track.attach(videoElement);
      }
    });

    // The cleanup function will detach the tracks when the component re-renders
    // or unmounts, preventing memory leaks.
    return () => {
      participants.forEach((track) => {
        // Detach the track from any element it might be attached to
        track.detach();
      });
    };
  }, [participants]); // Re-run this effect whenever the participants array changes

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {participants.length > 0 ? (
        participants.map((track, index) => (
          <div key={track.sid} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
            <video
              ref={el => {
                videoRefs.current[index] = el;
              }}
              className="w-full h-full object-cover"
              autoPlay
              playsInline // Recommended for mobile browsers
            />
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-sm p-4">No other participants in the room.</p>
      )}
    </div>
  );
};

export default VideoGrid;