import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Plus, Search, Filter, ArrowUpDown, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Task } from '../types';

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Schedule property inspection',
    description: 'Contact inspector for 123 Main St',
    dueDate: '2023-06-15T00:00:00.000Z',
    status: 'Not Started',
    priority: 'High',
    relatedTo: {
      type: 'Property',
      id: '1',
    },
    createdAt: '2023-05-20T00:00:00.000Z',
    updatedAt: '2023-05-20T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '2',
    title: 'Call potential tenant',
    description: 'Follow up with John regarding 456 Oak Ave',
    dueDate: '2023-06-10T00:00:00.000Z',
    status: 'In Progress',
    priority: 'Medium',
    relatedTo: {
      type: 'Property',
      id: '2',
    },
    createdAt: '2023-05-18T00:00:00.000Z',
    updatedAt: '2023-05-25T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '3',
    title: 'Review purchase contract',
    description: 'Go through contract details for 789 Pine Ln',
    dueDate: '2023-06-05T00:00:00.000Z',
    status: 'Not Started',
    priority: 'High',
    relatedTo: {
      type: 'Deal',
      id: '1',
    },
    createdAt: '2023-05-22T00:00:00.000Z',
    updatedAt: '2023-05-22T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '4',
    title: 'Schedule property showing',
    description: 'Arrange showing for potential buyer at 222 Market St',
    dueDate: '2023-06-08T00:00:00.000Z',
    status: 'Not Started',
    priority: 'Medium',
    relatedTo: {
      type: 'Property',
      id: '5',
    },
    createdAt: '2023-05-26T00:00:00.000Z',
    updatedAt: '2023-05-26T00:00:00.000Z',
    ownerId: 'user1',
  },
  {
    id: '5',
    title: 'Submit loan application',
    description: 'Complete and submit loan application for 101 River Rd purchase',
    dueDate: '2023-06-01T00:00:00.000Z',
    status: 'Completed',
    priority: 'High',
    relatedTo: {
      type: 'Deal',
      id: '5',
    },
    createdAt: '2023-05-15T00:00:00.000Z',
    updatedAt: '2023-05-30T00:00:00.000Z',
    ownerId: 'user1',
  },
];

// Mock related item names for display
const relatedItemNames: Record<string, string> = {
  '1': '123 Main St',
  '2': '456 Oak Ave',
  '3': '789 Pine Ln',
  '4': '101 River Rd',
  '5': '222 Market St',
};

const Tasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState(mockTasks);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task | null;
    direction: 'ascending' | 'descending';
  }>({
    key: 'dueDate',
    direction: 'ascending',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredTasks(mockTasks);
    } else {
      const filtered = mockTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(term.toLowerCase()) ||
          task.description.toLowerCase().includes(term.toLowerCase()) ||
          task.status.toLowerCase().includes(term.toLowerCase()) ||
          task.priority.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  };

  const handleSort = (key: keyof Task) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredTasks(sortedTasks);
  };

  // Sort tasks by due date by default
  React.useEffect(() => {
    const sortedTasks = [...mockTasks].sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    setFilteredTasks(sortedTasks);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your to-do list and follow-ups
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
        >
          Add Task
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              leftIcon={<Filter size={16} />}
              className="w-full sm:w-auto"
            >
              Filter
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowUpDown size={16} />}
              className="w-full sm:w-auto"
            >
              Sort
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Task
                    {sortConfig.key === 'title' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">
                    Priority
                    {sortConfig.key === 'priority' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center">
                    Due Date
                    {sortConfig.key === 'dueDate' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Related To
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center
                          ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 
                            'bg-green-100 text-green-600'}`}>
                          <CheckSquare size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Clock size={16} className="mr-1 text-gray-500" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                      {new Date(task.dueDate) < new Date() && task.status !== 'Completed' && (
                        <div className="text-xs text-red-600 flex items-center mt-1">
                          <AlertCircle size={12} className="mr-1" />
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.relatedTo.type && task.relatedTo.id ? (
                        <div className="text-sm text-gray-900">
                          {task.relatedTo.type}: {relatedItemNames[task.relatedTo.id]}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Tasks;
