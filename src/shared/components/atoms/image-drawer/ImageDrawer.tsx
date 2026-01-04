import { useRef, useEffect, useState } from "react";
import { RiEraserLine, RiPencilLine } from "@remixicon/react";

interface ImageDrawerProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}

type DrawColor = "black" | "red" | "yellow";

const ImageDrawer: React.FC<ImageDrawerProps> = ({ src, alt, style, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEraseMode, setIsEraseMode] = useState(false);
  const [drawColor, setDrawColor] = useState<DrawColor>("black");

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    const updateCanvasSize = () => {
      if (image && canvas) {
        const rect = image.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Save current context state
        const currentMode = ctx.globalCompositeOperation;
        const currentLineWidth = ctx.lineWidth;
        const currentStrokeStyle = ctx.strokeStyle;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        // Reset transform and scale
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        
        // Restore context state
        ctx.globalCompositeOperation = currentMode;
        ctx.lineWidth = currentLineWidth;
        ctx.strokeStyle = currentStrokeStyle;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    // Wait for image to load
    const handleImageLoad = () => {
      updateCanvasSize();
    };

    if (image.complete) {
      handleImageLoad();
    } else {
      image.addEventListener("load", handleImageLoad);
    }

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    
    if (image) {
      resizeObserver.observe(image);
    }

    return () => {
      image.removeEventListener("load", handleImageLoad);
      resizeObserver.disconnect();
    };
  }, [src]);

  // Update canvas context based on mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isEraseMode) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20; // Eraser size
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else {
      ctx.globalCompositeOperation = "source-over";
      // Rangni tanlash
      const colorMap: Record<DrawColor, string> = {
        black: "#000000",
        red: "#ff0000",
        yellow: "#ffeb3b",
      };
      ctx.strokeStyle = colorMap[drawColor];
      ctx.lineWidth = 5; // Qalinlashtirildi
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [isEraseMode, drawColor]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;
    
    // Pencil cursor hotspot is at (12, 6) - eng yuqori uchi nuqtasiga moslashtirilgan
    // Pencil iconning eng yuqori uchi nuqtasiga chizish uchun offset
    return {
      x: clientX - rect.left - 2, // Chap tomonga biroz surilgan
      y: clientY - rect.top - 4, // Yuqoriga ko'tarilgan
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Only prevent default if actually drawing, not if there's a text selection
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      // If there's a text selection, don't start drawing and preserve selection
      return;
    }
    e.preventDefault();
    setIsHovering(true); // Enable drawing when user starts drawing
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    // Only prevent default if actually drawing, preserve browser selection
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      // If there's a text selection, stop drawing and preserve selection
      setIsDrawing(false);
      return;
    }
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  // Handle mouse leave to stop drawing
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDrawing(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // Pencil cursor SVG - eng yuqori uchi nuqtasiga chizish uchun hotspot (12, 6) - pencil eng yuqori uchi
  const pencilCursor = "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000%22 stroke-width=%222%22><path d=%22M12 19l7-7 3 3-7 7-3-3z%22/><path d=%22M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z%22/><path d=%22M2 2l7.586 7.586%22/><path d=%22M11 11l2 2%22/></svg>') 12 6, auto";
  
  // Eraser cursor SVG - markazda (12, 12)
  const eraserCursor = "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ff0000%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M8 8l8 8M16 8l-8 8%22/></svg>') 12 12, auto";
  
  const currentCursor = isEraseMode ? eraserCursor : pencilCursor;

  // Preserve browser selection on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = (e: Event) => {
      // Preserve browser selection when scrolling
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        // Selection is preserved automatically by browser
        e.stopPropagation();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Preserve browser selection when scrolling with wheel
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // Don't interfere with selection when scrolling
        e.stopPropagation();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="relative inline-block image-drawer-container">
      <div
        ref={containerRef}
        className="relative inline-block group image-drawer-container"
        style={{ cursor: isHovering ? currentCursor : "default" }}
        onMouseEnter={(e) => {
          // Don't clear browser selection on mouse enter
          e.stopPropagation();
          handleMouseEnter();
        }}
        onMouseLeave={(e) => {
          // Don't clear browser selection on mouse leave
          e.stopPropagation();
          handleMouseLeave();
        }}
        onClick={(e) => {
          // Prevent highlight clearing when clicking on image, but preserve browser selection
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 0) {
            // If there's a selection, don't stop propagation to preserve it
            return;
          }
          e.stopPropagation();
        }}
        onScroll={(e) => {
          // Preserve browser selection when scrolling
          e.stopPropagation();
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt || ""}
          style={style}
          className={className}
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-auto"
          style={{
            cursor: isHovering ? currentCursor : "default",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <br />
      <br />
      {/* Color picker and erase mode toggle - rasm tashqarisida, o'ng yuqori burchakda */}
      <div className="absolute top-16 right-0 -translate-y-full mb-2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-gray-200">
        {/* Color picker buttons */}
        {!isEraseMode && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDrawColor("black");
              }}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                drawColor === "black"
                  ? "border-gray-900 scale-110 shadow-md ring-2 ring-gray-300"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              style={{ backgroundColor: "#000000" }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDrawColor("red");
              }}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                drawColor === "red"
                  ? "border-gray-900 scale-110 shadow-md ring-2 ring-red-200"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              style={{ backgroundColor: "#ff0000" }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDrawColor("yellow");
              }}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                drawColor === "yellow"
                  ? "border-gray-900 scale-110 shadow-md ring-2 ring-yellow-200"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              style={{ backgroundColor: "#ffeb3b" }}
            />
          </div>
        )}
        {/* Toggle button for erase mode */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEraseMode(!isEraseMode);
          }}
          className={`p-2 rounded-md shadow-sm transition-all hover:scale-105 ${
            isEraseMode
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isEraseMode ? (
            <RiPencilLine className="w-4 h-4" />
          ) : (
            <RiEraserLine className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageDrawer;

