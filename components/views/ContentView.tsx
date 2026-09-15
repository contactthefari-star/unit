import { GuidedScripting } from "@/components/dashboard/GuidedScripting";
import { ContentFactory } from "@/components/dashboard/ContentFactory";
import { VideoLearning } from "@/components/dashboard/VideoLearning";

export function ContentView() {
  return (
    <div className="space-y-4">
      <GuidedScripting />
      <ContentFactory />
      <VideoLearning />
    </div>
  );
}
