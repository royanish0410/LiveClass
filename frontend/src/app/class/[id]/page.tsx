'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useRef } from 'react';
import { useLiveKit } from '@/app/hooks/useLiveKit';
import { useWebSocket } from '@/app/hooks/useWebSocket';
import Whiteboard, { WhiteboardHandle } from '@/app/components/Whiteboard';
import VideoGrid from '@/app/components/VideoGrid';
import Chat from '@/app/components/Chat';
import { getClassEvents } from '../../services/api';

const ClassPage = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter(); 
    
    const classId = params.id as string;
    const identity = searchParams.get('identity');
    const liveKitToken = searchParams.get('token'); 

    const [chatMessages, setChatMessages] = useState<string[]>([]);
    const [isReplaying, setIsReplaying] = useState(false);
    const [isTeacherTyping, setIsTeacherTyping] = useState(false);
    const whiteboardRef = useRef<WhiteboardHandle>(null);

    const handleWebSocketMessage = useCallback((event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
            setChatMessages(prevMessages => [...prevMessages, data.message]);
        } else if (data.type === 'teacher-typing') {
            setIsTeacherTyping(data.isTyping);
        }
    }, []);
    
    const { room, participants } = useLiveKit(liveKitToken ?? '', classId);
    const { sendMessage, ws } = useWebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/${classId}`, handleWebSocketMessage);
    const sendChatMessage = useCallback((message: string) => {
        const messagePayload = { 
            type: 'chat', 
            message: `${identity}: ${message}`, 
            classId: classId 
        };
        setChatMessages(prevMessages => [...prevMessages, messagePayload.message]);
        sendMessage(messagePayload);
    }, [sendMessage, identity, classId]);

    const handleLeaveClass = () => {
        if (room) room.disconnect();
        if (ws) ws.close();
        router.push('/');
    };

    const handleReplaySession = async () => {
        setIsReplaying(true);
        try {
            const response = await getClassEvents(classId);
            const events = response as any[]; 
            setChatMessages([]);
            whiteboardRef.current?.replayEvents(events);
        } catch (error) {
            console.error('Failed to replay session:', error);
            alert('Failed to replay session. An error occurred.');
        } finally {
            setIsReplaying(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
            <header className="p-4 bg-white flex justify-between items-center shadow-md border-b border-gray-200">
                <h1 className="text-2xl font-bold text-blue-600">Live Class: {classId}</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleReplaySession}
                        disabled={isReplaying}
                        className="p-2 px-4 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed"
                    >
                        {isReplaying ? 'Replaying...' : 'Replay Session'}
                    </button>
                    <button
                        onClick={handleLeaveClass}
                        className="p-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                    >
                        Leave Class
                    </button>
                </div>
            </header>
            
            <main className="flex flex-1 overflow-hidden p-4 space-x-4 bg-gray-50">
                <div className="flex-1 bg-white rounded-lg shadow-lg flex justify-center items-center overflow-hidden relative border border-gray-200">
                    <Whiteboard sendMessage={sendMessage} ref={whiteboardRef} />
                </div>
                <aside className="w-1/4 flex flex-col space-y-4">
                    <div className="bg-white rounded-lg shadow-lg flex-1 overflow-y-auto p-2 border border-gray-200">
                        <h2 className="text-lg font-semibold mb-2 text-gray-700">Participants</h2>
                        <VideoGrid participants={participants} />
                    </div>
                    <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col">
                        <h2 className="text-lg font-semibold p-4 text-gray-700">Chat</h2>
                        <Chat 
                            messages={chatMessages} 
                            sendMessage={sendChatMessage} 
                            currentIdentity={identity || ''}
                            isTeacherTyping={isTeacherTyping}
                        />
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default ClassPage;