import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { ProgressBar } from './components/ProgressBar';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { parseMarkdown } from './utils/markdownParser';
import { TaskState, Task } from './types';

function App() {
  const [isDark, setIsDark] = useState(() => 
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [view, setView] = useState<'input' | 'tasks'>('input');
  const [markdownInput, setMarkdownInput] = useState('');
  const [taskState, setTaskState] = useState<TaskState>({
    tasks: [],
    startTime: null,
    estimatedTime: 3600,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdownInput(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdownInput(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    const tasks = parseMarkdown(markdownInput);
    setTaskState({
      tasks,
      startTime: Date.now(),
      estimatedTime: tasks.length * 900,
    });
    setView('tasks');
  };

  const handleBack = () => {
    setView('input');
    setTaskState({
      tasks: [],
      startTime: null,
      estimatedTime: 3600,
    });
  };

  const calculateProgress = useCallback((tasks: Task[]): number => {
    let completed = 0;
    let total = 0;

    const countTask = (task: Task) => {
      total++;
      if (task.isCompleted) completed++;
      task.subtasks.forEach(countTask);
    };

    tasks.forEach(countTask);
    return total === 0 ? 0 : (completed / total) * 100;
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setTaskState((prev) => {
      const updateTask = (tasks: Task[]): Task[] => {
        return tasks.map((task) => {
          if (task.id === taskId) {
            const newStatus = !task.isCompleted;
            return {
              ...task,
              isCompleted: newStatus,
              subtasks: task.subtasks.map((st) => ({
                ...st,
                isCompleted: newStatus,
              })),
            };
          }
          if (task.subtasks.some((st) => st.id === taskId)) {
            const updatedSubtasks = updateTask(task.subtasks);
            const allSubtasksCompleted = updatedSubtasks.every(
              (st) => st.isCompleted
            );
            return {
              ...task,
              isCompleted: allSubtasksCompleted,
              subtasks: updatedSubtasks,
            };
          }
          return {
            ...task,
            subtasks: updateTask(task.subtasks),
          };
        });
      };

      return {
        ...prev,
        tasks: updateTask(prev.tasks),
      };
    });
  }, []);

  return (
    <div className="min-h-screen font-[Arial] bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="min-h-screen">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {view === 'input' ? (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Markdown Task Manager
              </h1>
              
              <div className="space-y-4">
                <div
                  ref={dropZoneRef}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <Upload className={`mx-auto h-12 w-12 ${
                    isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`mt-2 text-sm ${
                    isDragging
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {isDragging
                      ? 'Drop your Markdown file here'
                      : 'Click to upload or drag and drop your Markdown file'}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="markdown"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Or paste your Markdown here
                  </label>
                  <textarea
                    id="markdown"
                    rows={10}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={markdownInput}
                    onChange={(e) => setMarkdownInput(e.target.value)}
                    placeholder="# Main Task&#10;- Subtask 1&#10;- Subtask 2"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!markdownInput.trim()}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Generate Tasks
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Progress
                </h1>
                <div className="w-20" /> {/* Spacer for alignment */}
              </div>
              
              <ProgressBar
                progress={calculateProgress(taskState.tasks)}
              />
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <TaskList
                  tasks={taskState.tasks}
                  onToggleTask={toggleTask}
                />
              </div>
              
              <Timer
                startTime={taskState.startTime}
                estimatedTime={taskState.estimatedTime}
                completionPercentage={calculateProgress(taskState.tasks)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;