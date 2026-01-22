'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DrawingCanvas({ className, showControls = true }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawing, setHasDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const setCanvasSize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const rect = parent.getBoundingClientRect();
                // Set actual canvas size to match display size
                canvas.width = rect.width;
                canvas.height = rect.height;

                // Reset context properties after resize
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        };

        setCanvasSize(); // Initial size setup

        const resizeObserver = new ResizeObserver(() => {
            setCanvasSize();
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        // Calculate scaling factors in case internal resolution differs from display size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        const { x, y } = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { x, y } = getCoordinates(e);

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasDrawing(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const startDrawingTouch = (e) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        startDrawing(mouseEvent);
    };

    const drawTouch = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        draw(mouseEvent);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawing(false);
    };

    return (
        <div className={`relative ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair bg-zinc-900/50 rounded-lg border border-white/10"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawingTouch}
                onTouchMove={drawTouch}
                onTouchEnd={stopDrawing}
            />
            {hasDrawing && showControls && (
                <Button
                    onClick={(e) => { e.stopPropagation(); clearCanvas(); }}
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-1 right-1 h-6 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white px-2"
                >
                    Clear
                </Button>
            )}
        </div>
    );
}
