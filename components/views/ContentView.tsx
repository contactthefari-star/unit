import { RepurposeInbox } from "@/components/dashboard/RepurposeInbox";
import { GuidedScripting } from "@/components/dashboard/GuidedScripting";
import { ReadingSession } from "@/components/dashboard/ReadingSession";
import { ContentFactory } from "@/components/dashboard/ContentFactory";
import { VideoLearning } from "@/components/dashboard/VideoLearning";

export function ContentView() {
  return (
    <div className="space-y-4">
      <RepurposeInbox />
      <GuidedScripting />
      <ReadingSession />
      <ContentFactory />
      <VideoLearning />
    </div>
  );
}
