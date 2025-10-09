import React, { useMemo, useState } from 'react';
import { Aquarium, ModalType, Plant, Unit, GrowthPhoto, WaterChangeLog, FertilizationLog } from '../types';
import { UseAquariumDataReturnType } from '../hooks/useAquariumData';
import { PlusIcon, CameraIcon, LeafIcon, WaterIcon, PencilIcon, TrashIcon, StarIcon, CalendarIcon } from './icons';
import { UpcomingTasks } from './UpcomingTasks';


interface AquariumDetailProps {
    aquarium: Aquarium;
    data: UseAquariumDataReturnType;
    openModal: (modal: ModalType, itemToEdit?: any) => void;
    onDeleteAquarium: (id: string) => void;
}

const unitLabels: Record<Unit, string> = {
    'gallons-us': 'US Gal',
    'gallons-uk': 'UK Gal',
    'litres': 'L'
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                {icon}
                <span className="ml-3">{title}</span>
            </h3>
        </div>
        <div>{children}</div>
    </div>
);

const LogItem: React.FC<{onEdit: () => void; onDelete: () => void; children: React.ReactNode;}> = ({onEdit, onDelete, children}) => (
    <li className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
        <div>{children}</div>
        <div className="flex space-x-2">
            <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon/></button>
            <button onClick={onDelete} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon/></button>
        </div>
    </li>
);

const FabAction: React.FC<{label: string, icon: React.ReactNode, onClick: () => void}> = ({label, icon, onClick}) => (
    <div className="flex items-center gap-4 w-full justify-end">
        <span className="bg-white text-slate-700 font-semibold px-3 py-1.5 rounded-md shadow-sm">{label}</span>
        <button onClick={onClick} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-blue-500 hover:bg-slate-50 transition-colors">
            {icon}
        </button>
    </div>
);


export const AquariumDetail: React.FC<AquariumDetailProps> = ({ aquarium, data, openModal, onDeleteAquarium }) => {
    const { 
        waterChanges, fertilizations, plants, photos, 
        deleteWaterChange, deletePlant, deleteFertilization, deletePhoto, deleteTask,
        updateAquarium 
    } = data;
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [expandedWaterChanges, setExpandedWaterChanges] = useState(false);
    const [expandedFertilizations, setExpandedFertilizations] = useState(false);

    const filteredWaterChanges = useMemo(() => 
        waterChanges
            .filter(wc => wc.aquariumId === aquarium.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [waterChanges, aquarium.id]
    );
    const filteredFertilizations = useMemo(() => 
        fertilizations
            .filter(f => f.aquariumId === aquarium.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [fertilizations, aquarium.id]
    );
    const filteredPlants = useMemo(() => plants.filter(p => p.aquariumId === aquarium.id), [plants, aquarium.id]);
    const filteredPhotos = useMemo(() => photos.filter(p => p.aquariumId === aquarium.id), [photos, aquarium.id]);
    
    const handleDeletePlant = (plant: Plant) => {
        if (window.confirm(`Are you sure you want to delete the plant "${plant.species}"?`)) {
            deletePlant(plant.id);
        }
    };
    
    const handleDeleteWaterChange = (wc: WaterChangeLog) => {
        if (window.confirm(`Are you sure you want to delete the water change log from ${new Date(wc.date).toLocaleDateString()}?`)) {
            deleteWaterChange(wc.id);
        }
    };

    const handleDeleteFertilization = (f: FertilizationLog) => {
        if (window.confirm(`Are you sure you want to delete the fertilization log for "${f.fertilizer}" from ${new Date(f.date).toLocaleDateString()}?`)) {
            deleteFertilization(f.id);
        }
    };
    
    const handleDeletePhoto = (photo: GrowthPhoto) => {
        if (window.confirm(`Are you sure you want to delete the photo from ${new Date(photo.date).toLocaleDateString()}?`)) {
            deletePhoto(photo.id);
            if (aquarium.dashboardPhotoId === photo.id) {
                updateAquarium({ ...aquarium, dashboardPhotoId: undefined });
            }
        }
    };

    const setDashboardPhoto = (photoId: string) => {
        updateAquarium({ ...aquarium, dashboardPhotoId: photoId });
    };

     const fabActions = [
        { label: 'Log Water Change', icon: <WaterIcon className="w-6 h-6 text-blue-500"/>, modal: 'LOG_WATER_CHANGE' },
        { label: 'Log Fertilizer', icon: <LeafIcon className="w-6 h-6 text-green-500"/>, modal: 'LOG_FERTILIZER' },
        { label: 'Upload Photo', icon: <CameraIcon className="w-6 h-6 text-purple-500"/>, modal: 'UPLOAD_PHOTO' },
        { label: 'Add Plant', icon: <LeafIcon className="w-6 h-6 text-green-500"/>, modal: 'ADD_PLANT' },
        { label: 'Add Task', icon: <CalendarIcon className="w-6 h-6 text-orange-500"/>, modal: 'ADD_TASK' }
    ].reverse();

    return (
        <div className="space-y-6 pb-24">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{aquarium.name}</h2>
                    <p className="text-slate-500">{aquarium.size} {aquarium.unit.replace('-', ' ')}</p>
                    <p className="text-slate-500 text-sm">Setup since {new Date(aquarium.setupDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                     <button onClick={() => openModal('EDIT_AQUARIUM', aquarium)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" aria-label="Edit Aquarium"><PencilIcon/></button>
                     <button onClick={() => onDeleteAquarium(aquarium.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label="Delete Aquarium"><TrashIcon/></button>
                  </div>
                </div>
            </div>
            
            <Section title="Photo Gallery" icon={<CameraIcon className="w-6 h-6 text-purple-500" />}>
                {filteredPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredPhotos.map(photo => {
                            const isDashboardPhoto = aquarium.dashboardPhotoId === photo.id;
                            return (
                                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden shadow-md">
                                    <img src={photo.photoDataUrl} alt={photo.notes || `Growth on ${new Date(photo.date).toLocaleDateString()}`} className="w-full h-full object-cover"/>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-start justify-end p-1.5 space-x-1">
                                         <button onClick={() => setDashboardPhoto(photo.id)} className={`p-1.5 rounded-full bg-white/80 backdrop-blur-sm ${isDashboardPhoto ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`} aria-label="Set as dashboard photo">
                                            <StarIcon filled={isDashboardPhoto} className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleDeletePhoto(photo)} className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:text-red-500" aria-label="Delete photo">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : <p className="text-slate-500 text-center py-4">No photos yet. Add one to track growth!</p>}
            </Section>

            <Section title="Plants" icon={<LeafIcon className="w-6 h-6 text-green-500" />}>
                {filteredPlants.length > 0 ? (
                     <ul className="space-y-2">
                        {filteredPlants.map((plant: Plant) => (
                            <LogItem 
                                key={plant.id} 
                                onEdit={() => openModal('EDIT_PLANT', plant)} 
                                onDelete={() => handleDeletePlant(plant)}>
                                <div className="flex items-center">
                                    {plant.photoDataUrl ? (
                                        <img src={plant.photoDataUrl} className="w-12 h-12 object-cover rounded-md mr-4" alt={plant.species} />
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-200 rounded-md mr-4 flex items-center justify-center">
                                            <LeafIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-slate-700">{plant.species}</p>
                                        <p className="text-sm text-slate-500">Planted: {new Date(plant.plantingDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </LogItem>
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-center py-4">No plants logged for this aquarium.</p>}
            </Section>

            <UpcomingTasks 
              tasks={data.tasks} 
              aquariumId={aquarium.id} 
              onCompleteTask={data.completeTask} 
              openModal={openModal} 
              deleteTask={deleteTask}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
                 <Section title="Water Change Log" icon={<WaterIcon className="w-6 h-6 text-blue-500" />}>
                     {filteredWaterChanges.length > 0 ? (
                         <>
                             <ul className="space-y-2">
                                {(expandedWaterChanges ? filteredWaterChanges : filteredWaterChanges.slice(0, 3)).map(wc => (
                                    <LogItem 
                                        key={wc.id} 
                                        onEdit={() => openModal('EDIT_WATER_CHANGE', wc)} 
                                        onDelete={() => handleDeleteWaterChange(wc)}>
                                        <p className="font-semibold">{new Date(wc.date).toLocaleDateString()}: <span className="font-normal">{wc.volume} {unitLabels[wc.unit]}</span></p>
                                        {wc.notes && <p className="text-sm text-slate-600 mt-1">{wc.notes}</p>}
                                    </LogItem>
                                ))}
                            </ul>
                            {filteredWaterChanges.length > 3 && (
                                <button 
                                    onClick={() => setExpandedWaterChanges(!expandedWaterChanges)}
                                    className="w-full mt-3 py-2 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    {expandedWaterChanges ? 'Show Less' : `Show ${filteredWaterChanges.length - 3} More`}
                                </button>
                            )}
                         </>
                    ) : <p className="text-slate-500 text-center py-4">No water changes logged.</p>}
                </Section>
                <Section title="Fertilization Log" icon={<LeafIcon className="w-6 h-6 text-green-500" />}>
                     {filteredFertilizations.length > 0 ? (
                         <>
                             <ul className="space-y-2">
                                {(expandedFertilizations ? filteredFertilizations : filteredFertilizations.slice(0, 3)).map(f => (
                                    <LogItem 
                                        key={f.id} 
                                        onEdit={() => openModal('EDIT_FERTILIZER', f)} 
                                        onDelete={() => handleDeleteFertilization(f)}>
                                        <p className="font-semibold">{new Date(f.date).toLocaleDateString()}: <span className="font-normal">{f.fertilizer} - {f.dosageMl}ml</span></p>
                                        {f.notes && <p className="text-sm text-slate-600 mt-1">{f.notes}</p>}
                                    </LogItem>
                                ))}
                            </ul>
                            {filteredFertilizations.length > 3 && (
                                <button 
                                    onClick={() => setExpandedFertilizations(!expandedFertilizations)}
                                    className="w-full mt-3 py-2 px-4 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    {expandedFertilizations ? 'Show Less' : `Show ${filteredFertilizations.length - 3} More`}
                                </button>
                            )}
                         </>
                    ) : <p className="text-slate-500 text-center py-4">No fertilizations logged.</p>}
                </Section>
            </div>
             <Section title="Equipment" icon={<PencilIcon className="w-5 h-5 text-gray-500" />}>
                <div className="space-y-3 text-slate-700">
                    {aquarium.lighting && <div><span className="font-semibold">Lighting:</span> {aquarium.lighting.brand} ({aquarium.lighting.durationStart} - {aquarium.lighting.durationEnd})</div>}
                    {aquarium.co2 && <div><span className="font-semibold">CO2:</span> {aquarium.co2.details}</div>}
                    {!aquarium.lighting && !aquarium.co2 && <p className="text-slate-500 text-center py-4">No equipment details logged.</p>}
                </div>
            </Section>

            {isFabOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsFabOpen(false)}></div>}
            <div className="fixed bottom-6 right-6 z-50">
                 <div className={`flex flex-col items-end gap-4 mb-4 transition-all duration-300 ease-in-out ${isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {fabActions.map(action => (
                         <FabAction key={action.label} label={action.label} icon={action.icon} onClick={() => { openModal(action.modal as ModalType); setIsFabOpen(false); }} />
                    ))}
                </div>

                <button 
                    onClick={() => setIsFabOpen(prev => !prev)}
                    className="flex items-center justify-center h-16 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out px-6"
                    aria-label="AquaLog Menu"
                    aria-haspopup="true"
                    aria-expanded={isFabOpen}
                >
                    <span className="text-lg">AquaLog</span>
                    <PlusIcon className={`w-7 h-7 ml-2 transition-transform duration-300 ${isFabOpen ? 'rotate-45' : 'rotate-0'}`} />
                </button>
            </div>
        </div>
    );
};