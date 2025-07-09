import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (value && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = value;
    }
  }, [value]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const end = () => {
    if (!drawing) return;
    setDrawing(false);
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        className="border rounded bg-white cursor-crosshair"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={end}
        onMouseLeave={end}
      />
      <button type="button" onClick={clear} className="text-sm text-red-600 underline">
        Effacer
      </button>
    </div>
  );
};

export default SignaturePad;

