import parse from "html-react-parser";
import { useRef } from "react";

interface HTMLRendererProps {
  htmlString: string;
  className?: string;
  enableHighlight?: boolean;
}

const HTMLRendererWithHighlight = ({
  htmlString,
  className = "",
}: HTMLRendererProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={contentRef}
      className={`w-full text-sm text-[--foreground] ${className} [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[--border] [&_td]:p-2 [&_th]:border [&_th]:border-[--border] [&_th]:p-2 [&_p]:mb-2 [&_p]:text-[--foreground] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-[--foreground] [&_strong]:font-bold [&_em]:italic select-text`}
      style={{ userSelect: "text" }}
    >
      {parse(htmlString)}
    </div>
  );
};

export default HTMLRendererWithHighlight;
