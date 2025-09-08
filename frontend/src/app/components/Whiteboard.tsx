'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

// Define the structure of events in the whiteboard
interface WhiteboardEvent {
    type: 'draw' | 'erase';
    x?: number;
    y?: number;
    start?: boolean;
    end?: boolean;
    color?: string;
    lineWidth?: number;
    timestamp: string;
}

// Define the shape of the functions exposed by the ref
export interface WhiteboardHandle {
    replayEvents: (events: WhiteboardEvent[]) => void;
}

interface WhiteboardProps {
    sendMessage: (message: WhiteboardEvent) => void;
}

type Tool = 'draw' | 'erase';
const whiteboardColor = '#ffffff'; // Use a lighter color for light mode

const Whiteboard = forwardRef<WhiteboardHandle, WhiteboardProps>(({ sendMessage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>('draw');

    // Expose the replayEvents function via the ref
    useImperativeHandle(ref, () => ({
        replayEvents: (events: WhiteboardEvent[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear the canvas for replay
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = whiteboardColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let lastTimestamp = 0;

            events.forEach((event, index) => {
                const delay = index === 0 ? 0 : new Date(event.timestamp).getTime() - lastTimestamp;
                lastTimestamp = new Date(event.timestamp).getTime();

                setTimeout(() => {
                    if (event.type === 'draw' || event.type === 'erase') {
                        ctx.strokeStyle = event.color || 'black';
                        ctx.lineWidth = event.lineWidth || 1;

                        if (event.start && event.x !== undefined && event.y !== undefined) {
                            ctx.beginPath();
                            ctx.moveTo(event.x, event.y);
                        } else if (event.end) {
                            ctx.closePath();
                        } else if (event.x !== undefined && event.y !== undefined) {
                            ctx.lineTo(event.x, event.y);
                            ctx.stroke();
                        }
                    }
                }, delay);
            });
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const { width, height } = container.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = whiteboardColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = 'black';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const getCoordinates = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return { x, y };
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = tool === 'draw' ? 'black' : whiteboardColor;
            ctx.lineWidth = tool === 'draw' ? 5 : 20;
            sendMessage({
                type: tool,
                x,
                y,
                start: true,
                color: ctx.strokeStyle,
                lineWidth: ctx.lineWidth,
                timestamp: new Date().toISOString(),
            });
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            sendMessage({
                type: tool,
                x,
                y,
                color: ctx.strokeStyle as string,
                lineWidth: ctx.lineWidth,
                timestamp: new Date().toISOString(),
            });
        }
    };

    const onMouseUp = () => {
        if (isDrawing) {
            setIsDrawing(false);
            sendMessage({ type: tool, end: true, timestamp: new Date().toISOString() });
        }
    };

    const onToolChange = (newTool: Tool) => {
        setTool(newTool);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = newTool === 'draw' ? 'black' : whiteboardColor;
            ctx.lineWidth = newTool === 'draw' ? 5 : 20;
        }
    };

    const cursorStyle = tool === 'draw' ? 'cursor-crosshair' : 'cursor-cell';

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <div className="absolute top-4 left-4 z-10 flex space-x-2 p-2 bg-white rounded-md shadow-lg border border-gray-200">
                <button
                    onClick={() => onToolChange('draw')}
                    className={`p-2 rounded-md font-semibold text-sm ${tool === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                    Draw
                </button>
                <button
                    onClick={() => onToolChange('erase')}
                    className={`p-2 rounded-md font-semibold text-sm ${tool === 'erase' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                    Erase
                </button>
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                className={`w-full h-full ${cursorStyle}`}
            />
        </div>
    );
});

Whiteboard.displayName = 'Whiteboard';

export default Whiteboard;
