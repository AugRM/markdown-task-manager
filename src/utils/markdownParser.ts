import { marked } from 'marked';
import { Task } from '../types';

export const parseMarkdown = (markdown: string): Task[] => {
  const tokens = marked.lexer(markdown);
  const tasks: Task[] = [];

  const processListItems = (items: marked.Tokens.ListItem[], level: number = 0): Task[] => {
    return items.map(item => {
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        text: item.text,
        isCompleted: false,
        subtasks: [],
        level,
      };

      // Process nested lists if they exist
      if (item.tokens) {
        const nestedList = item.tokens.find(token => token.type === 'list');
        if (nestedList && 'items' in nestedList) {
          task.subtasks = processListItems(nestedList.items, level + 1);
        }
      }

      return task;
    });
  };

  tokens.forEach((token) => {
    if (token.type === 'heading') {
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        text: token.text,
        isCompleted: false,
        subtasks: [],
        level: 0,
      };
      tasks.push(task);
    } else if (token.type === 'list') {
      if (tasks.length > 0 && tasks[tasks.length - 1].subtasks.length === 0) {
        // Add subtasks to the last main task
        tasks[tasks.length - 1].subtasks = processListItems(token.items, 1);
      } else {
        // Create main tasks from list items
        tasks.push(...processListItems(token.items, 0));
      }
    }
  });

  return tasks;
};