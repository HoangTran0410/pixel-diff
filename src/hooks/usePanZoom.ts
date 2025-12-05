import { useState, useCallback, useRef } from 'react';
import { TransformState } from '../types';

interface UsePanZoomProps {
  transform: TransformState;
  setTransform: (t: TransformState) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const usePanZoom = ({ transform, setTransform, containerRef }: UsePanZoomProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!containerRef.current) return;

      const scaleAmount = -e.deltaY * 0.001;
      const newScale = Math.max(0.1, Math.min(10, transform.scale * (1 + scaleAmount)));

      // Get container dimensions to calculate center
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate mouse position relative to the CENTER of the container
      const mouseXFromCenter = (e.clientX - rect.left) - centerX;
      const mouseYFromCenter = (e.clientY - rect.top) - centerY;

      // Apply zoom math relative to center
      // newOffset = mousePos - (mousePos - currentOffset) * growthRatio
      const newX = mouseXFromCenter - (mouseXFromCenter - transform.x) * (newScale / transform.scale);
      const newY = mouseYFromCenter - (mouseYFromCenter - transform.y) * (newScale / transform.scale);

      setTransform({
        scale: newScale,
        x: newX,
        y: newY,
      });
    },
    [transform, setTransform, containerRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      // Store the offset between cursor and current transform
      startPos.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    },
    [transform]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setTransform({
        ...transform,
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y,
      });
    },
    [isDragging, transform, setTransform]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isDragging,
  };
};