export interface ComparisonSettings {
  maxDimension: number;
  threshold: number;
  includeAA: boolean;
  alpha: number;
  aaColor: string;
  diffColor: string;
  diffColorAlt: string | null;
  diffMask: boolean;
}

export interface ComparisonStats {
  mismatchedPixels: number;
  totalPixels: number;
  diffPercentage: number;
  width: number;
  height: number;
  executionTime: number;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export interface TransformState {
  scale: number;
  x: number;
  y: number;
}