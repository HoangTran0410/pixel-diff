import pixelmatch from 'pixelmatch';
import { ComparisonSettings, ComparisonStats } from '../types';
import { hexToRgb } from '../utils/color';

// Helper to load an image from a URL into an ImageBitmap (or HTMLImageElement)
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

// Main comparison function
export const compareImages = async (
  img1Url: string,
  img2Url: string,
  settings: ComparisonSettings
): Promise<{ diffUrl: string; stats: ComparisonStats }> => {
  const startTime = performance.now();

  const [img1, img2] = await Promise.all([loadImage(img1Url), loadImage(img2Url)]);

  // Determine target dimensions
  // We prioritize the first image's aspect ratio, but cap at maxDimension
  const aspectRatio = img1.width / img1.height;
  let targetWidth = img1.width;
  let targetHeight = img1.height;

  if (targetWidth > settings.maxDimension || targetHeight > settings.maxDimension) {
    if (targetWidth > targetHeight) {
      targetWidth = settings.maxDimension;
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else {
      targetHeight = settings.maxDimension;
      targetWidth = Math.round(targetHeight * aspectRatio);
    }
  }

  // Create canvas to draw images and extract data
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Could not get canvas context");

  // Draw Image 1
  ctx.drawImage(img1, 0, 0, targetWidth, targetHeight);
  const img1Data = ctx.getImageData(0, 0, targetWidth, targetHeight);

  // Draw Image 2 (clear first to avoid blending)
  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img2, 0, 0, targetWidth, targetHeight);
  const img2Data = ctx.getImageData(0, 0, targetWidth, targetHeight);

  // Prepare Diff Output
  const diffData = ctx.createImageData(targetWidth, targetHeight);

  // Convert settings colors to RGB tuples
  const aaColorTuple = hexToRgb(settings.aaColor);
  const diffColorTuple = hexToRgb(settings.diffColor);
  const diffColorAltTuple = settings.diffColorAlt ? hexToRgb(settings.diffColorAlt) : undefined;

  // Run Pixelmatch
  const mismatchedPixels = pixelmatch(
    img1Data.data,
    img2Data.data,
    diffData.data,
    targetWidth,
    targetHeight,
    {
      threshold: settings.threshold,
      includeAA: settings.includeAA,
      alpha: settings.alpha,
      aaColor: aaColorTuple,
      diffColor: diffColorTuple,
      diffColorAlt: diffColorAltTuple,
      diffMask: settings.diffMask,
    }
  );

  // Put diff data back to canvas to get data URL
  ctx.putImageData(diffData, 0, 0);
  const diffUrl = canvas.toDataURL("image/png");

  const endTime = performance.now();

  return {
    diffUrl,
    stats: {
      mismatchedPixels,
      totalPixels: targetWidth * targetHeight,
      diffPercentage: (mismatchedPixels / (targetWidth * targetHeight)) * 100,
      width: targetWidth,
      height: targetHeight,
      executionTime: endTime - startTime,
    },
  };
};