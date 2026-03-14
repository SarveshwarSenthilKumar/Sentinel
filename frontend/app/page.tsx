import { IncidentQueueWorkspace } from "@/components/incident-queue-workspace";
import { getIncidentQueue } from "@/lib/api";

export default async function DashboardPage() {
  const queue = await getIncidentQueue();

  return (
    <main>
      <IncidentQueueWorkspace initialQueue={queue} />
    </main>
  );
}
