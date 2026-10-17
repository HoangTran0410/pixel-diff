import React, { useState, useEffect, useCallback } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ImageDropzone from './components/ImageDropzone';
import ComparisonView from './components/ComparisonView';
import {
  ComparisonSettings,
  ComparisonStats,
  ImageFile,
  TransformState,
} from './types';
import { compareImages } from './services/pixelmatchService';
import { Github, Camera, Menu, X } from 'lucide-react';
import useCacheState from './hooks/useCacheState';

const DEFAULT_SETTINGS: ComparisonSettings = {
  maxDimension: 512,
  threshold: 0.1,
  includeAA: false,
  alpha: 0.1,
  aaColor: '#ffff00', // Yellow
  diffColor: '#ff0000', // Red
  diffColorAlt: null,
  diffMask: false,
};

const App: React.FC = () => {
  const [settings, setSettings] = useCacheState<ComparisonSettings>(
    'PixelDiff.Settings',
    DEFAULT_SETTINGS
  );
  const [image1, setImage1] = useState<ImageFile | null>(null);
  const [image2, setImage2] = useState<ImageFile | null>(null);

  const [diffResult, setDiffResult] = useState<{
    url: string;
    stats: ComparisonStats;
  } | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Shared View State (Sync Pan/Zoom)
  const [transform, setTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [fitToScreen, setFitToScreen] = useState(true);

  // Reset view when images change significantly (optional, but good UX to reset to fit)
  useEffect(() => {
    if (diffResult) {
      setFitToScreen(true);
      setTransform({ x: 0, y: 0, scale: 1 });
    }
  }, [diffResult]);

  // Determine shared display dimensions for synchronization
  // If diff exists, everything syncs to diff dimensions.
  // Otherwise, we try to sync to Image 1, then Image 2.
  const displayDimensions = React.useMemo(() => {
    if (diffResult) {
      return { width: diffResult.stats.width, height: diffResult.stats.height };
    }
    if (image1) {
      return { width: image1.width, height: image1.height };
    }
    if (image2) {
      return { width: image2.width, height: image2.height };
    }
    return undefined;
  }, [diffResult, image1, image2]);

  // Helper to handle file selection
  const handleImageSelect = (
    file: File,
    setImage: React.Dispatch<React.SetStateAction<ImageFile | null>>
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: e.target?.result as string,
          width: img.width,
          height: img.height,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Run comparison when images or settings change
  const runComparison = useCallback(async () => {
    if (!image1 || !image2) {
      setDiffResult(null);
      return;
    }

    setIsComparing(true);
    setError(null);

    // Slight delay to allow UI to show loading state if on main thread
    setTimeout(async () => {
      try {
        const result = await compareImages(
          image1.previewUrl,
          image2.previewUrl,
          settings
        );
        setDiffResult({ url: result.diffUrl, stats: result.stats });
      } catch (err) {
        console.error('Comparison failed:', err);
        setError('Failed to generate comparison. Please check image formats.');
      } finally {
        setIsComparing(false);
      }
    }, 100);
  }, [image1, image2, settings]);

  // Debounce the comparison to avoid UI freezing while dragging sliders
  useEffect(() => {
    const timer = setTimeout(() => {
      runComparison();
    }, 300);
    return () => clearTimeout(timer);
  }, [runComparison]);

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white overflow-hidden font-sans">
      {/* Sidebar - Desktop Settings */}
      <aside className="w-80 h-full flex-shrink-0 hidden md:flex flex-col z-20 shadow-xl relative">
        <div className="p-6 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
              <Camera size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PixelDiff</h1>
              <p className="text-xs text-gray-500">Visual Regression Tool</p>
            </div>
          </div>
        </div>
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          isComparing={isComparing}
        />
        <div className="p-4 bg-gray-900 border-t border-gray-800 text-center">
          <a
            href="https://github.com/hoangtran0410/pixel-diff"
            target="_blank"
            className="text-xs text-gray-600 hover:text-gray-400 flex items-center justify-center gap-2 transition-colors"
          >
            <Github size={14} />
            <span>View Source</span>
          </a>
          {window.self === window.top && (
            <a
              href="https://fbaio.org/#/desktop"
              target="_blank"
              rel="noopener"
              className="mt-2 text-xs text-gray-600 hover:text-gray-400 flex items-center justify-center gap-2 transition-colors"
            >
              <span>More tools &amp; games: AIO Desktop</span>
            </a>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center z-30 relative shadow-md">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-600 rounded shadow-lg">
              <Camera size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-lg">PixelDiff</h1>
          </div>
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg border border-gray-700 active:bg-gray-700 transition-colors"
          >
            {showMobileSettings ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Settings Overlay with Slide Animation */}
        <div
          className={`
                md:hidden absolute inset-0 top-[73px] z-40 bg-gray-950 transition-transform duration-300 ease-in-out
                ${showMobileSettings ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            isComparing={isComparing}
          />
        </div>

        <div className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
          {/* Top Row: Input Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
            <div className="h-48 md:h-64">
              <ImageDropzone
                label="Original Image (A)"
                imagePreview={image1?.previewUrl || null}
                onImageSelect={(f) => handleImageSelect(f, setImage1)}
                onClear={() => setImage1(null)}
                dimensions={
                  image1
                    ? { width: image1.width, height: image1.height }
                    : undefined
                }
                transform={transform}
                setTransform={setTransform}
                fitToScreen={fitToScreen}
                setFitToScreen={setFitToScreen}
                displayDimensions={displayDimensions}
              />
            </div>
            <div className="h-48 md:h-64">
              <ImageDropzone
                label="Comparison Image (B)"
                imagePreview={image2?.previewUrl || null}
                onImageSelect={(f) => handleImageSelect(f, setImage2)}
                onClear={() => setImage2(null)}
                dimensions={
                  image2
                    ? { width: image2.width, height: image2.height }
                    : undefined
                }
                transform={transform}
                setTransform={setTransform}
                fitToScreen={fitToScreen}
                setFitToScreen={setFitToScreen}
                displayDimensions={displayDimensions}
              />
            </div>
          </div>

          {/* Bottom Row: Result */}
          <div className="flex-1 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-200">
                Difference Map
              </h2>
              {error && (
                <span className="text-red-400 text-sm bg-red-900/20 px-2 py-1 rounded border border-red-900">
                  {error}
                </span>
              )}
            </div>
            <ComparisonView
              diffUrl={diffResult?.url || null}
              stats={diffResult?.stats || null}
              isComparing={isComparing}
              transform={transform}
              setTransform={setTransform}
              fitToScreen={fitToScreen}
              setFitToScreen={setFitToScreen}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
