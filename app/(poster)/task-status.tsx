import { TaskStatusScreen } from "@/features/marketplace/task-status/TaskStatusScreen";

export default function ProviderTaskStatusRoute() {
  return <TaskStatusScreen edges={["left", "right"]} basePath="/(poster)" />;
}
