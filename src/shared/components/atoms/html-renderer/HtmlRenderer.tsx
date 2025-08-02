interface HTMLRendererProps {
  htmlString: string;
  className?: string;
}

const HTMLRenderer = ({ htmlString, className = "" }: HTMLRendererProps) => {
  return (
    <div
      className={`w-full text-sm text-[--foreground] ${className} [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[--border] [&_td]:p-2 [&_th]:border [&_th]:border-[--border] [&_th]:p-2 [&_p]:mb-2 [&_p]:text-[--foreground] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-[--foreground] [&_strong]:font-bold [&_em]:italic`}
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
  );
};

export default HTMLRenderer;
