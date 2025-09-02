import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    RiBookOpenLine,
    RiHeadphoneLine,
    RiMic2Line,
    RiPencilLine,
} from "@remixicon/react";
import StudentReadingResults from "./StudentReadingMockResults";

const StudentResults = () => {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-center">Results</div>
      <Tabs defaultValue="reading" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger
            value="reading"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiBookOpenLine className="w-5 h-5" />
            Reading
          </TabsTrigger>
          <TabsTrigger
            value="listening"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiHeadphoneLine className="w-5 h-5" />
            Listening
          </TabsTrigger>
          <TabsTrigger
            value="writing"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiPencilLine className="w-5 h-5" />
            Writing
          </TabsTrigger>
          <TabsTrigger
            value="speaking"
            className="min-w-min flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiMic2Line className="w-5 h-5" />
            Speaking
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reading" className="mt-6">
          <Tabs defaultValue="mock" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger
                value="mock"
                className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
              >
                <RiBookOpenLine className="w-5 h-5" />
                Mock
              </TabsTrigger>
              <TabsTrigger
                value="thematic"
                className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
              >
                <RiHeadphoneLine className="w-5 h-5" />
                Thematic
              </TabsTrigger>
            </TabsList>
            <TabsContent value="speaking" className="mt-6">
              Speaking
            </TabsContent>
            <TabsContent value="listening" className="mt-6">
              Listening
            </TabsContent>
          </Tabs>
          {/* Reading */}
          {/* <StudentReadingResults /> */}
        </TabsContent>
        <TabsContent value="listening" className="mt-6">
          Listening
        </TabsContent>
        <TabsContent value="writing" className="mt-6">
          Writing
        </TabsContent>
        <TabsContent value="speaking" className="mt-6">
          Speaking
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentResults;
