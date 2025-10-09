import React from 'react';
import { PlusIcon, ArrowLeftIcon } from './icons';
import AquaLogLogo from '../AquaLog_logo2.png';

interface HeaderProps {
  showBack: boolean;
  onBack: () => void;
  onAddAquariumClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showBack, onBack, onAddAquariumClick }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            {showBack ? (
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 mr-2" title="Back to all aquariums">
                    <ArrowLeftIcon className="h-6 w-6 text-slate-700"/>
                </button>
            ) : (
                <img src={AquaLogLogo} alt="AquaLog Logo" className="h-8 w-8" />
            )}
            <h1 className="text-2xl font-bold text-slate-800 ml-3">AquaLog</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onAddAquariumClick}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Add New Aquarium"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};