import React, { useMemo } from 'react';
import { Task, ModalType } from '../types';
import { CalendarIcon, PencilIcon, TrashIcon } from './icons';

interface UpcomingTasksProps {
  tasks: Task[];
  aquariumId: string;
  onCompleteTask: (taskId: string, completionDate: string) => void;
  openModal: (modal: ModalType, itemToEdit?: any) => void;
  deleteTask: (taskId: string) => void;
}

const getTaskStatus = (dueDate: Date): { text: string; color: string; days: number } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, color: 'text-red-500', days: diffDays };
    if (diffDays === 0) return { text: 'Due Today', color: 'text-orange-500', days: diffDays };
    return { text: `Due in ${diffDays} day(s)`, color: 'text-gray-500', days: diffDays };
};

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks, aquariumId, onCompleteTask, openModal, deleteTask }) => {
  const upcomingTasks = useMemo(() => {
    const filtered = tasks.filter(task => task.aquariumId === aquariumId);
    const processed = filtered.map(task => {
      let dueDate;
      if (task.isRepeatable && task.frequencyDays) {
        const lastCompletedDate = new Date(task.lastCompleted);
        dueDate = new Date(lastCompletedDate.setDate(lastCompletedDate.getDate() + task.frequencyDays));
      } else {
        // For one-off tasks, lastCompleted is the due date
        dueDate = new Date(task.lastCompleted);
      }
      return { ...task, dueDate, status: getTaskStatus(new Date(dueDate)) };
    });
    const sorted = processed.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const result = sorted.slice(0, 5); // Show top 5 upcoming
    
    console.log('Upcoming Tasks Debug:', {
      total: tasks.length,
      filtered: filtered.length,
      aquariumId,
      items: result.map((task, index) => ({
        index,
        id: task.id,
        name: task.name,
        hasValidId: !!task.id,
        hasValidName: !!task.name
      }))
    });
    
    return result;
  }, [tasks, aquariumId]);
  
  const handleDelete = (task: Task) => {
      if (window.confirm(`Are you sure you want to delete the task "${task.name}"?`)) {
          deleteTask(task.id);
      }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <CalendarIcon className="w-6 h-6 mr-3 text-blue-500"/>
        Upcoming Tasks
      </h3>
      {upcomingTasks.length > 0 ? (
        <ul className="space-y-4">
          {upcomingTasks.map(task => (
            <li key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-700">{task.name}</p>
                <p className={`text-sm font-medium ${task.status.color}`}>{task.status.text}</p>
              </div>
              <div className="flex items-center space-x-2">
                 <button 
                   onClick={() => openModal('EDIT_TASK', task)} 
                   className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"
                 >
                   <PencilIcon/>
                 </button>
                 <button 
                   onClick={() => handleDelete(task)} 
                   className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full"
                 >
                   <TrashIcon/>
                 </button>
                 <button 
                    onClick={() => onCompleteTask(task.id, new Date().toISOString())}
                    className="px-4 py-1.5 text-sm font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                    title={task.isRepeatable ? `Last completed: ${new Date(task.lastCompleted).toLocaleDateString()}` : `Due: ${new Date(task.lastCompleted).toLocaleDateString()}`}
                  >
                    Done
                  </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-center py-4">No upcoming tasks scheduled. Add one!</p>
      )}
    </div>
  );
};