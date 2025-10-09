import React from 'react';
import { Aquarium, ModalType } from '../types';
import { UseAquariumDataReturnType } from '../hooks/useAquariumData';
import { UpcomingTasks } from './UpcomingTasks';
import { WaterIcon, LeafIcon, CameraIcon, CalendarIcon, PencilIcon, TrashIcon } from './icons';

interface AquariumDashboardProps {
  aquarium: Aquarium;
  data: UseAquariumDataReturnType;
  setView: (view: 'dashboard' | 'detail') => void;
  openModal: (modal: ModalType, itemToEdit?: any) => void;
  onDeleteAquarium: (id: string) => void;
}

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow text-slate-600 hover:text-blue-600">
        <div className="p-3 bg-blue-100 rounded-full">
            {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
    </button>
);


export const AquariumDashboard: React.FC<AquariumDashboardProps> = ({ aquarium, data, setView, openModal, onDeleteAquarium }) => {
  
  return (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{aquarium.name}</h2>
                <p className="text-slate-500">{aquarium.size} {aquarium.unit.replace('-', ' ')}</p>
                <p className="text-slate-500 text-sm">Setup since {new Date(aquarium.setupDate).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                 <button onClick={() => openModal('EDIT_AQUARIUM', aquarium)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon/></button>
                 <button onClick={() => onDeleteAquarium(aquarium.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon/></button>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickActionButton icon={<WaterIcon className="w-6 h-6 text-blue-500"/>} label="Log Water Change" onClick={() => openModal('LOG_WATER_CHANGE')} />
            <QuickActionButton icon={<LeafIcon className="w-6 h-6 text-green-500"/>} label="Log Fertilizer" onClick={() => openModal('LOG_FERTILIZER')} />
            <QuickActionButton icon={<CameraIcon className="w-6 h-6 text-purple-500"/>} label="Upload Photo" onClick={() => openModal('UPLOAD_PHOTO')} />
            <QuickActionButton icon={<CalendarIcon className="w-6 h-6 text-orange-500"/>} label="Add Task" onClick={() => openModal('ADD_TASK')} />
        </div>

        <UpcomingTasks tasks={data.tasks} aquariumId={aquarium.id} onCompleteTask={data.completeTask} openModal={openModal} deleteTask={data.deleteTask}/>
        
        <div className="text-center">
            <button 
                onClick={() => setView('detail')}
                className="mt-4 px-6 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
                View Full Details & Logs
            </button>
        </div>
    </div>
  );
};