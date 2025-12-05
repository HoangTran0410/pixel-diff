import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { TransformState } from '../types';
import { usePanZoom } from '../hooks/usePanZoom';

interface ImageDropzoneProps {
  label: string;
  imagePreview: string | null;
  onImageSelect: (file: File) => void;
  onClear: () => void;
  accept?: string;
  dimensions?: { width: number, height: number };
  transform: TransformState;
  setTransform: (t: TransformState) => void;
  fitToScreen: boolean;
  setFitToScreen: (b: boolean) => void;
  displayDimensions?: { width: number, height: number };
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  label,
  imagePreview,
  onImageSelect,
  onClear,
  accept = "image/*",
  dimensions,
  transform,
  setTransform,
  fitToScreen,
  setFitToScreen,
  displayDimensions
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isDragging
  } = usePanZoom({ 
    transform, 
    setTransform: (t) => {
        setFitToScreen(false);
        setTransform(t);
    }, 
    containerRef 
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (!imagePreview) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between px-1">
         <span className="text-sm font-semibold text-gray-400">{label}</span>
         {dimensions && (
             <span className="text-xs text-gray-500 font-mono">{dimensions.width} x {dimensions.height}</span>
         )}
      </div>
      
      <div
        ref={containerRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onWheel={imagePreview ? handleWheel : undefined}
        onMouseDown={imagePreview ? handleMouseDown : undefined}
        onMouseMove={imagePreview ? handleMouseMove : undefined}
        onMouseUp={imagePreview ? handleMouseUp : undefined}
        onMouseLeave={(e) => {
            if (imagePreview) handleMouseLeave();
            handleDragLeave(e as any);
        }}
        className={`
          relative flex-1 rounded-xl border-2 border-dashed transition-colors duration-200 ease-in-out overflow-hidden
          ${isHovering 
            ? 'border-blue-500 bg-blue-500/10' 
            : imagePreview 
              ? 'border-gray-700 bg-gray-900/50 hover:border-gray-600 cursor-grab active:cursor-grabbing' 
              : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50 hover:border-gray-500 cursor-pointer'
          }
        `}
      >
        <input
          type="file"
          ref={inputRef}
          accept={accept}
          onChange={(e) => e.target.files?.[0] && onImageSelect(e.target.files[0])}
          className="hidden"
        />

        {imagePreview ? (
          <div className={`relative w-full h-full flex items-center justify-center p-2 group`}>
            <div 
                className={`transition-transform ${isDragging ? 'duration-0' : 'duration-100 ease-out'} ${fitToScreen ? 'w-full h-full flex items-center justify-center' : ''}`}
                style={!fitToScreen ? {
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: 'center center'
                } : undefined}
            >
                <img 
                    src={imagePreview} 
                    alt={label} 
                    className={`block select-none pointer-events-none ${fitToScreen ? 'max-w-full max-h-full object-contain' : 'max-w-none'}`}
                    style={{ 
                        imageRendering: 'pixelated',
                        width: displayDimensions && !fitToScreen ? displayDimensions.width : undefined,
                        height: displayDimensions && !fitToScreen ? displayDimensions.height : undefined,
                    }}
                />
            </div>
            
            {/* Close Button - Prevent click propagation to avoid triggering file input or pan */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3 pointer-events-none">
            <div className={`p-4 rounded-full bg-gray-800 ${isHovering ? 'text-blue-400' : 'text-gray-400'}`}>
                <Upload size={32} />
            </div>
            <p className="text-sm font-medium">Drop image here or click</p>
            <p className="text-xs text-gray-600">Supports PNG, JPG, WebP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;