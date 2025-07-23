import { useQuery } from "@tanstack/react-query";
import { getReadingData } from "../../api/reading";
import { get } from "lodash";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";


const ReadingPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reading"],
    queryFn: getReadingData,
  });

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  if (isError) {
    return <div>Xatolik yuz berdi.</div>;
  }

  const htmlContent = get(data?.[0], "reading_sections[0].content", "");

  return (
    <div>
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] rounded-lg border w-full"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ReadingPage;
