import React, { useState, useMemo } from 'react';
import { useAquariumData } from './hooks/useAquariumData';
import { Aquarium, ModalState } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AquariumDetail } from './components/AquariumDetail';
import { LogFormsModal } from './components/LogFormsModal';

const App: React.FC = () => {
  const data = useAquariumData();
  const [activeAquariumId, setActiveAquariumId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  const activeAquarium = useMemo(
    () => data.aquariums.find(aq => aq.id === activeAquariumId) || null,
    [data.aquariums, activeAquariumId]
  );
  
  const handleAddAquarium = (aquarium: Omit<Aquarium, 'id'>) => {
    const newAquarium = data.addAquarium(aquarium);
    setActiveAquariumId(newAquarium.id);
    setModal(null);
  };
  
  const handleDeleteAquarium = (aquariumId: string) => {
      if (window.confirm(`Are you sure you want to delete this aquarium? This will remove all of its associated logs, photos, and tasks.`)) {
          data.deleteAquarium(aquariumId);
          setActiveAquariumId(null);
      }
  };

  const renderContent = () => {
    if (!activeAquarium) {
      return (
        <Dashboard 
          aquariums={data.aquariums} 
          photos={data.photos}
          onSelectAquarium={(id) => setActiveAquariumId(id)}
          openModal={(type) => setModal({ type })}
        />
      );
    }

    return (
      <AquariumDetail 
        aquarium={activeAquarium} 
        data={data} 
        openModal={(type, itemToEdit) => setModal({ type, itemToEdit })} 
        onDeleteAquarium={handleDeleteAquarium}
      />
    );
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800">
      <Header 
        showBack={!!activeAquarium}
        onBack={() => {
            setActiveAquariumId(null);
        }}
        onAddAquariumClick={() => setModal({type: 'ADD_AQUARIUM'})}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>
      {modal && (
        <LogFormsModal
          modalState={modal}
          aquariumId={activeAquariumId}
          onClose={() => setModal(null)}
          dataActions={data}
          onAddAquarium={handleAddAquarium}
        />
      )}
    </div>
  );
};

export default App;
