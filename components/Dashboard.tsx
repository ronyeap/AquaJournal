import React from 'react';
import { Aquarium, GrowthPhoto, ModalType } from '../types';
import { PlusIcon } from './icons';
import AquaLogLogo from '../AquaLog_logo2.png';

interface DashboardProps {
  aquariums: Aquarium[];
  photos: GrowthPhoto[];
  onSelectAquarium: (id: string) => void;
  openModal: (modal: ModalType) => void;
}

const unitLabels: Record<string, string> = {
    'gallons-us': 'US Gallons',
    'gallons-uk': 'UK Gallons',
    'litres': 'Litres'
};

export const Dashboard: React.FC<DashboardProps> = ({ aquariums, photos, onSelectAquarium, openModal }) => {
  if (aquariums.length === 0) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Welcome to Your Aquarium Tracker!</h2>
        <p className="text-slate-500 mb-6">Get started by adding your first aquarium.</p>
        <button
          onClick={() => openModal('ADD_AQUARIUM')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full inline-flex items-center transition-colors"
        >
          <PlusIcon />
          <span className="ml-2">Add Aquarium</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">My Aquariums</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aquariums.map(aq => {
          const dashboardPhoto = photos.find(p => p.id === aq.dashboardPhotoId);
          return (
            <div key={aq.id} onClick={() => onSelectAquarium(aq.id)}
                 className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
              <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                {dashboardPhoto ? (
                  <img src={dashboardPhoto.photoDataUrl} alt={aq.name} className="w-full h-full object-cover" />
                ) : (
                  <img src={AquaLogLogo} alt="AquaLog Logo" className="w-16 h-16 opacity-40 grayscale" />
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 truncate">{aq.name}</h2>
                  <p className="text-slate-500">{aq.size} {unitLabels[aq.unit]}</p>
                </div>
                <p className="text-slate-400 text-sm mt-4">Setup since {new Date(aq.setupDate).toLocaleDateString()}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};