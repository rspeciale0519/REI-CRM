import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Card from '../ui/Card';
import { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <Card title="Upcoming Tasks" className="h-full">
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <li className="py-4 text-center text-gray-500">No tasks found</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="py-4">
                <Link to={`/tasks/${task.id}`} className="flex items-center hover:bg-gray-50 -mx-6 px-6 py-2 rounded-md">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center
                      ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 
                        'bg-green-100 text-green-600'}`}>
                      <CheckSquare size={20} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="truncate">{task.description}</span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="mt-4">
        <Link
          to="/tasks"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View all tasks
        </Link>
      </div>
    </Card>
  );
};

export default TaskList;
