import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ResizableContent from "@/features/exams/components/ResizibleContent";
import { ListeningFormValues } from "@/features/exams/schemas/listening-schema";
import { ListeningPart } from "@/features/exams/types";
import { cn } from "@/lib/utils";
import HTMLRendererWithHighlight from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "../../readings/components/ReadingQuestionRenderer";
import { useAuthStore } from "@/store/auth-store";
import { useTestDisplayStore } from "@/store/test-display-store";
import { getTestDisplayClasses } from "@/shared/utils/test-display-utils";
import parse, { Element } from "html-react-parser";
import { useMemo } from "react";
import ImageDrawer from "@/shared/components/atoms/image-drawer/ImageDrawer";

interface Props {
  part: ListeningPart;
  form: UseFormReturn<ListeningFormValues>;
  testId?: string;
}

const ListeningQuestionContent = ({ part, form, testId }: Props) => {
  const { user } = useAuthStore();
  const { contrast, textSize } = useTestDisplayStore();
  const userId = user?.id || 'guest';
  
  // Create storage keys for persistence (per user)
  const scriptStorageKey = testId && part.id 
    ? `listening-${userId}-${testId}-${part.id}-script` 
    : undefined;
  const questionsStorageKey = testId && part.id 
    ? `listening-${userId}-${testId}-${part.id}-questions` 
    : undefined;

  const displayClasses = getTestDisplayClasses(contrast, textSize);

  // Extract image from questions HTML
  const { imageElement, questionsWithoutImage } = useMemo(() => {
    if (!part.questions) {
      return { imageElement: null, questionsWithoutImage: part.questions };
    }

    let foundImage: JSX.Element | null = null;
    let questionsHtml = part.questions;
    let imageHtml = "";

    // Find first image in HTML
    const imgRegex = /<img[^>]*>/i;
    const match = part.questions.match(imgRegex);
    
    if (match) {
      imageHtml = match[0];
      // Remove image from questions HTML
      questionsHtml = part.questions.replace(imgRegex, "").trim();
      
      // Parse image attributes
      parse(imageHtml, {
        replace: (domNode) => {
          if (domNode instanceof Element && domNode.name === "img") {
            const { src, alt, style, className } = domNode.attribs;
            
            // Parse inline styles if present
            let parsedStyle: React.CSSProperties = {};
            if (style) {
              style.split(";").forEach((rule: string) => {
                const [property, value] = rule.split(":").map((s) => s.trim());
                if (property && value) {
                  const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                  parsedStyle[camelProperty as keyof React.CSSProperties] = value;
                }
              });
            }

            foundImage = (
              <ImageDrawer
                key={src || Math.random().toString()}
                src={src || ""}
                alt={alt || ""}
                style={parsedStyle}
                className={className || ""}
              />
            );
          }
          return domNode;
        },
      });
    }

    return {
      imageElement: foundImage,
      questionsWithoutImage: questionsHtml,
    };
  }, [part.questions]);

  return (
    <div className={cn("h-[calc(100vh-232px)]", displayClasses)}>
      {part.is_script ? (
        <ResizableContent
          leftContent={
            <div 
              className={cn("h-full overflow-y-auto p-6 space-y-4", displayClasses)}
              onScroll={(e) => {
                // Preserve browser selection when scrolling
                e.stopPropagation();
              }}
              onWheel={(e) => {
                // Preserve browser selection when scrolling with wheel
                const selection = window.getSelection();
                if (selection && selection.toString().trim().length > 0) {
                  // Don't interfere with selection when scrolling
                  e.stopPropagation();
                }
              }}
            >
              {/* Image section */}
              {imageElement && (
                <div 
                  className="mb-6 mt-[30px]"
                  onMouseEnter={(e) => {
                    // Don't clear browser selection on mouse enter
                    e.stopPropagation();
                  }}
                  onMouseLeave={(e) => {
                    // Don't clear browser selection on mouse leave
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    // Preserve browser selection when clicking on image
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
                  {imageElement}
                </div>
              )}
              
              {/* Script section in separate frame */}
              {part.audioscript && (
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white/50">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">
                    Script
                  </div>
                  <HTMLRendererWithHighlight
                    className={cn("overflow-y-auto", displayClasses)}
                    htmlString={part.audioscript}
                    storageKey={scriptStorageKey}
                  />
                </div>
              )}
            </div>
          }
          rightContent={
            <div className={cn("h-full overflow-y-auto overflow-x-hidden p-6 space-y-8", displayClasses)}>
              {questionsWithoutImage ? (
                <>
                  <ReadingQuestionRenderer
                    htmlString={questionsWithoutImage}
                    form={form}
                    storageKey={questionsStorageKey}
                    className={displayClasses}
                  />
                </>
              ) : (
                <div>No questions available</div>
              )}
            </div>
          }
        />
      ) : (
        <ResizablePanelGroup
          direction={"horizontal"}
          className={cn("w-full border rounded-none")}
        >
          <ResizablePanel defaultSize={100}>
            <div className={cn("h-full overflow-y-auto overflow-x-hidden p-6 space-y-8", displayClasses)}>
              {part.questions ? (
                <ReadingQuestionRenderer
                  htmlString={part.questions}
                  form={form}
                  storageKey={questionsStorageKey}
                  className={displayClasses}
                />
              ) : (
                <div>No questions available</div>
              )}
              {/* {JSON.stringify(part.questions)} */}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default ListeningQuestionContent;
