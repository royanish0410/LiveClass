import { useEffect, useState, useRef } from 'react';

export const useWebSocket = <T = unknown>(
    url: string,
    onMessage: (event: MessageEvent) => void
) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socket.onmessage = (event) => {
            onMessageRef.current(event);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed.');
            setWs(null);
        };

        setWs(socket);

        return () => {
            if (socket.readyState === 1) {
                socket.close();
            }
        };
    }, [url]);

    const sendMessage = (message: T) => {
        if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify(message));
        }
    };

    return { ws, sendMessage };
};
