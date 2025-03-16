import React, { useEffect, useState } from 'react';
import { Task, TaskPriority } from '@/types/database.types';
import { TaskService } from '@/services/task.service';

// Initialize the task service
const taskService = new TaskService();

export default function TasksDashboard() {
  // State for different task categories
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all task categories on component mount
  useEffect(() => {
    loadAllTasks();
  }, []);

  // Function to load all task categories
  const loadAllTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load overdue tasks
      const overdueResponse = await taskService.getOverdueTasks();
      if (overdueResponse.error) throw new Error(overdueResponse.error.message);
      setOverdueTasks(overdueResponse.data || []);

      // Load today's tasks
      const todayResponse = await taskService.getTasksDueToday();
      if (todayResponse.error) throw new Error(todayResponse.error.message);
      setTodaysTasks(todayResponse.data || []);

      // Load upcoming tasks using search
      const upcomingResponse = await taskService.search({
        dueAfter: new Date(new Date().setDate(new Date().getDate() + 1)),
        completed: false,
      });
      if (upcomingResponse.error) throw new Error(upcomingResponse.error.message);
      setUpcomingTasks(upcomingResponse.data || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle task completion
  const handleToggleComplete = async (task: Task) => {
    try {
      const response = task.completed_at
        ? await taskService.markAsIncomplete(task.id)
        : await taskService.markAsComplete(task.id);

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Reload all tasks to update the lists
      await loadAllTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  // Helper function to render priority badge
  const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-sm ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  // Helper function to render task list
  const TaskList = ({ title, tasks }: { title: string; tasks: Task[] }) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className="p-4 border rounded shadow flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={!!task.completed_at}
                  onChange={() => handleToggleComplete(task)}
                  className="h-5 w-5"
                />
                <div>
                  <h3 className={`font-medium ${task.completed_at ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(task.due_date!).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <PriorityBadge priority={task.priority} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 p-4 rounded">
          <TaskList title="Overdue Tasks" tasks={overdueTasks} />
        </div>
      )}
      
      <TaskList title="Today's Tasks" tasks={todaysTasks} />
      <TaskList title="Upcoming Tasks" tasks={upcomingTasks} />
    </div>
  );
} 