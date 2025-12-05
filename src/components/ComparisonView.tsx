import React, { useRef } from 'react';
import { ComparisonStats, TransformState } from '../types';
import { Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { usePanZoom } from '../hooks/usePanZoom';

interface ComparisonViewProps {
  diffUrl: string | null;
  stats: ComparisonStats | null;
  isComparing: boolean;
  transform: TransformState;
  setTransform: (t: TransformState) => void;
  fitToScreen: boolean;
  setFitToScreen: (b: boolean) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  diffUrl, 
  stats, 
  isComparing, 
  transform, 
  setTransform,
  fitToScreen,
  setFitToScreen
}) => {
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

  const handleZoomBtn = (delta: number) => {
    setFitToScreen(false);
    setTransform({ ...transform, scale: Math.max(0.1, Math.min(10, transform.scale + delta)) });
  };

  const resetZoom = () => {
    setFitToScreen(false);
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  if (!diffUrl && !isComparing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30">
        <div className="p-4 bg-gray-800 rounded-full mb-4">
             <Maximize size={48} className="text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Comparison Generated</h3>
        <p className="max-w-md">Upload two images to see the difference map here. Configure the settings in the sidebar to fine-tune the output.</p>
      </div>
    );
  }

  if (isComparing) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[200px]">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p>Processing difference map...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Mismatch Pixels</p>
            <p className="text-lg font-bold text-red-400">{stats.mismatchedPixels.toLocaleString()}</p>
          </div>
           <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Difference</p>
            <p className="text-lg font-bold text-orange-400">{stats.diffPercentage.toFixed(2)}%</p>
          </div>
           <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Dimension</p>
            <p className="text-lg font-bold text-blue-400">{stats.width} x {stats.height}</p>
          </div>
           <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Time</p>
            <p className="text-lg font-bold text-green-400">{stats.executionTime.toFixed(0)}ms</p>
          </div>
        </div>
      )}

      {/* Main Diff Viewer */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex flex-col min-h-[300px] cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Controls - Fixed z-index to 50 to stay on top */}
        <div className="absolute top-4 right-4 z-50 flex gap-2 flex-wrap justify-end pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
             <button
                onClick={(e) => { e.stopPropagation(); setFitToScreen(true); }}
                className={`px-3 py-2 rounded-lg backdrop-blur-sm border transition-colors flex items-center gap-2 text-xs font-bold shadow-lg ${
                    fitToScreen 
                    ? 'bg-blue-600/90 text-white border-blue-500' 
                    : 'bg-gray-800/90 text-gray-300 border-gray-600 hover:bg-gray-700'
                }`}
             >
                <Maximize size={14} />
                Fit
             </button>

             <div className="flex gap-1 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-600 p-1 shadow-lg">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleZoomBtn(-0.1); }}
                    className="p-1 hover:bg-gray-700 rounded text-white transition-colors"
                >
                    <ZoomOut size={16} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                    className="px-2 py-1 text-white text-xs font-mono font-bold hover:bg-gray-700 rounded transition-colors"
                    title="Reset Zoom (100%)"
                >
                    {Math.round(transform.scale * 100)}%
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleZoomBtn(0.1); }}
                    className="p-1 hover:bg-gray-700 rounded text-white transition-colors"
                >
                    <ZoomIn size={16} />
                </button>
             </div>
             
             <a 
                href={diffUrl!} 
                download="diff-result.png"
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-gray-800/90 text-white rounded-lg hover:bg-gray-700 backdrop-blur-sm border border-gray-600 transition-colors shadow-lg"
             >
                <Download size={16} />
             </a>
            </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex items-center justify-center">
             {/* Checkered background wrapper with optimized transform */}
             <div 
                className={`relative shadow-2xl shadow-black/50 transition-transform ${isDragging ? 'duration-0' : 'duration-100 ease-out'} ${fitToScreen ? 'w-full h-full flex items-center justify-center' : ''}`}
                style={!fitToScreen ? {
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: 'center center'
                } : undefined}
             >
                {/* Background Pattern Layer */}
                 <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ 
                        backgroundImage: 'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                        opacity: 0.5
                    }}
                 />

                 <img 
                    src={diffUrl!} 
                    alt="Diff Result" 
                    draggable={false}
                    className={`relative z-10 block select-none ${fitToScreen ? 'max-w-full max-h-full object-contain' : 'max-w-none'}`} 
                    style={{
                        imageRendering: 'pixelated',
                    }} 
                 />
             </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;