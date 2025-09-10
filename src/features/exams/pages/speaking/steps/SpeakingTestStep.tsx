import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useSpeakingForm } from "@/features/exams/hooks/useSpeakingForm";
import useTestLogic from "@/features/exams/hooks/useTestLogic";
import { SpeakingPart } from "@/features/exams/types";
import { cn } from "@/lib/utils";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useAuthStore } from "@/store/auth-store";
import { TabsContent } from "@radix-ui/react-tabs";
import { RiShieldUserLine } from "@remixicon/react";
import { get } from "lodash";
import { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import SpeakingQuestionContent from "../components/SpeakingQuestionContent";

const SpeakingTestStep = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { form, onSubmit, query } = useSpeakingForm(id);
  const [combinedAudioUrl, setCombinedAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Submit qilish holati
  const allAudioChunks = useRef<Blob[]>([]); // Barcha partlar uchun umumiy audio Blob lar

  const parts: SpeakingPart[] = get(query, "data.speaking_parts", []);

  const { activeTab, setActiveTab, currentTabIndex } =
    useTestLogic<SpeakingPart>(null, parts, form.handleSubmit(onSubmit));

  // Oxirgi part ekanligini aniqlash
  const isLastPart = currentTabIndex === parts.length - 1;

  const activePart = parts.find((part) => `tab-${part.id}` === activeTab);

  // Audio URL ni yangilash
  useEffect(() => {
    // Oldingi URL ni tozalash
    if (combinedAudioUrl) {
      URL.revokeObjectURL(combinedAudioUrl);
    }
    // Agar audio mavjud bo‘lsa, yangi URL yaratish
    if (allAudioChunks.current.length > 0) {
      const combinedBlob = new Blob(allAudioChunks.current, {
        type: "audio/webm",
      });
      const url = URL.createObjectURL(combinedBlob);
      setCombinedAudioUrl(url);
    } else {
      setCombinedAudioUrl(null);
    }
    // Komponent unmount bo‘lganda URL ni tozalash
    return () => {
      if (combinedAudioUrl) {
        URL.revokeObjectURL(combinedAudioUrl);
      }
    };
  }, [allAudioChunks.current.length]);

  const handleNextPart = () => {
    if (currentTabIndex < parts.length - 1) {
      setActiveTab(`tab-${parts[currentTabIndex + 1].id}`);
    }
  };

  const handleFinish = () => {
    // Agar allaqachon submit qilingan bo‘lsa, qayta submit qilmaslik
    if (isSubmitting) {
      console.log("Submit allaqachon bajarilgan, qayta urinish rad etildi");
      return;
    }

    setIsSubmitting(true);

    // FormData ob'ektini yaratish
    const formData = new FormData();
    if (allAudioChunks.current.length > 0) {
      const combinedBlob = new Blob(allAudioChunks.current, {
        type: "audio/webm",
      });
      const combinedFile = new File(
        [combinedBlob],
        `speaking-test-combined.webm`,
        { type: "audio/webm" }
      );
      formData.append("record", combinedFile);
      formData.append("speaking", id || "");
      console.log("FormData ga qo‘shildi:", {
        fileName: combinedFile.name,
        fileSize: combinedFile.size,
        fileType: combinedFile.type,
        speakingId: id,
      });
    } else {
      console.warn("Hech qanday audio yozilmadi");
      formData.append("speaking", id || "");
    }
    // onSubmit ga FormData yuborish
    onSubmit(formData);
  };

  if (query.isLoading) return <LoadingSpinner message="Loading test data..." />;
  if (query.isError)
    return (
      <ErrorMessage
        title="Failed to Load Test"
        message="An error occurred while loading the test. Please try again later."
      />
    );

  if (query.data?.speaking_parts.length === 0)
    return (
      <ErrorMessage
        title="Failed to load test"
        message="An error occurred while loading the test questions. Please try again later."
      />
    );

  return (
    <FormProvider {...form}>
      <form className="min-h-screen">
        <div className="sticky top-0 z-50 bg-primary-foreground space-y-1">
          <Card className="w-full shadow-md rounded-none">
            <CardContent className="p-3 flex justify-between items-center h-[50px]">
              <div className="text-sm flex items-center gap-2">
                <RiShieldUserLine />
                <b>Candidate:</b> {user?.username || "Guest"}
              </div>
              <div className="flex items-center gap-8"></div>
            </CardContent>
          </Card>
          <Card className="w-full shadow-sm rounded-none">
            <CardContent className="p-3 text-sm h-[70px]">
              <div className="font-semibold">
                Part {activePart?.speaking_part}
              </div>
              <div>{activePart?.description}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div>
            {parts.map((part) => (
              <TabsContent
                key={part.id}
                value={`tab-${part.id}`}
                className={cn(
                  "h-full bg-muted",
                  activeTab !== `tab-${part.id}` && "hidden"
                )}
              >
                <SpeakingQuestionContent
                  part={part}
                  activeTab={activeTab}
                  isLastPart={isLastPart}
                  onNextPart={handleNextPart}
                  onFinish={handleFinish}
                  allAudioChunks={allAudioChunks}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </form>
    </FormProvider>
  );
};

export default SpeakingTestStep;
