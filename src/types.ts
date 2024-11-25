export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  subtasks: Task[];
  level: number;
}

export interface TaskState {
  tasks: Task[];
  startTime: number | null;
  estimatedTime: number; // in seconds
}