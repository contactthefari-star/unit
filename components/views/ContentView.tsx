import { RepurposeInbox } from "@/components/dashboard/RepurposeInbox";
import { GuidedScripting } from "@/components/dashboard/GuidedScripting";
import { ReadingSession } from "@/components/dashboard/ReadingSession";
import { ResourceHub } from "@/components/dashboard/ResourceHub";
import { PostWritingJournal } from "@/components/dashboard/PostWritingJournal";
import { ContentFactory } from "@/components/dashboard/ContentFactory";
import { VideoLearning } from "@/components/dashboard/VideoLearning";

export function ContentView() {
  return (
    <div className="space-y-4">
      <RepurposeInbox />
      <GuidedScripting />
      <ReadingSession />
      <ContentFactory />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ResourceHub />
        <PostWritingJournal />
      </div>
      <VideoLearning />
    </div>
  );
}
