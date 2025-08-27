import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RiBookOpenLine,
  RiHeadphoneLine,
  RiLayout2Line,
  RiMic2Line,
  RiPencilLine,
} from "@remixicon/react";

const ResultsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="speaking" className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger
            value="speaking"
            className="min-w-min flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiMic2Line className="w-5 h-5" />
            Speaking
          </TabsTrigger>
          <TabsTrigger
            value="listening"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiHeadphoneLine className="w-5 h-5" />
            Listening
          </TabsTrigger>
          <TabsTrigger
            value="reading"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiBookOpenLine className="w-5 h-5" />
            Reading
          </TabsTrigger>
          <TabsTrigger
            value="writing"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiPencilLine className="w-5 h-5" />
            Writing
          </TabsTrigger>
          <TabsTrigger
            value="full-exam"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiLayout2Line className="w-5 h-5" />
            Full Exam
          </TabsTrigger>
        </TabsList>
        <TabsContent value="speaking" className="mt-6">
          Speaking
        </TabsContent>
        <TabsContent value="listening" className="mt-6">
          Listening
        </TabsContent>
        <TabsContent value="reading" className="mt-6">
          Reading
        </TabsContent>
        <TabsContent value="writing" className="mt-6">
          Writing
        </TabsContent>
        <TabsContent value="full-exam" className="mt-6">
          Full exam
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsPage;
