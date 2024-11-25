import React from 'react';
import { Task } from '../types';
import { Check } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask }) => {
  const renderTask = (task: Task) => {
    const paddingLeft = task.level * 1.5;

    return (
      <div key={task.id}>
        <div
          className="flex items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          style={{ paddingLeft: `${paddingLeft}rem` }}
        >
          <button
            onClick={() => onToggleTask(task.id)}
            className={`w-5 h-5 rounded border ${
              task.isCompleted
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 dark:border-gray-600'
            } mr-3 flex items-center justify-center transition-colors`}
            aria-label={`Toggle ${task.text}`}
          >
            {task.isCompleted && <Check className="w-4 h-4 text-white" />}
          </button>
          <span
            className={`${
              task.level === 0 ? 'font-bold' : 'font-normal'
            } ${
              task.isCompleted
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            {task.text}
          </span>
        </div>
        {task.subtasks.map(renderTask)}
      </div>
    );
  };

  return <div className="space-y-1">{tasks.map(renderTask)}</div>;
};