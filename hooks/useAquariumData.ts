import React, { useState, useEffect } from 'react';
import { Aquarium, WaterChangeLog, Plant, FertilizationLog, GrowthPhoto, Task } from '../types';

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

const initialAquariums: Aquarium[] = [
    { id: 'aq1', name: 'Living Room Reef', size: 55, unit: 'gallons-us', setupDate: '2023-01-15T12:00:00.000Z', lighting: { brand: 'Kessil A360X', durationStart: '10:00', durationEnd: '20:00' } },
    { id: 'aq2', name: 'Betta\'s Paradise', size: 20, unit: 'litres', setupDate: '2023-08-20T12:00:00.000Z', co2: { details: 'Pressurized, 1 bubble/sec'} },
];

const initialTasks: Task[] = [
    { id: 't1', aquariumId: 'aq1', name: 'Weekly Water Change (25%)', isRepeatable: true, frequencyDays: 7, lastCompleted: '2024-07-15T10:00:00.000Z' },
    { id: 't2', aquariumId: 'aq1', name: 'Dose All-in-One Fertilizer', isRepeatable: true, frequencyDays: 3, lastCompleted: '2024-07-18T10:00:00.000Z' },
    { id: 't3', aquariumId: 'aq2', name: 'Clean filter', isRepeatable: false, lastCompleted: '2024-07-30T11:00:00.000Z' },
];

export const useAquariumData = () => {
  const [aquariums, setAquariums] = useState<Aquarium[]>(() => getInitialState('aquariums', initialAquariums));
  const [waterChanges, setWaterChanges] = useState<WaterChangeLog[]>(() => getInitialState('waterChanges', []));
  const [plants, setPlants] = useState<Plant[]>(() => getInitialState('plants', []));
  const [fertilizations, setFertilizations] = useState<FertilizationLog[]>(() => getInitialState('fertilizations', []));
  const [photos, setPhotos] = useState<GrowthPhoto[]>(() => getInitialState('photos', []));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('tasks', initialTasks));

  useEffect(() => { localStorage.setItem('aquariums', JSON.stringify(aquariums)); }, [aquariums]);
  useEffect(() => { localStorage.setItem('waterChanges', JSON.stringify(waterChanges)); }, [waterChanges]);
  useEffect(() => { localStorage.setItem('plants', JSON.stringify(plants)); }, [plants]);
  useEffect(() => { localStorage.setItem('fertilizations', JSON.stringify(fertilizations)); }, [fertilizations]);
  useEffect(() => { localStorage.setItem('photos', JSON.stringify(photos)); }, [photos]);
  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);

  const createOrUpdate = <T extends {id: string}>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: Omit<T, 'id'> | T) => {
    if ('id' in item && item.id) {
      setter(prev => prev.map(i => i.id === item.id ? item as T : i));
      return item as T;
    } else {
      const newItem = { ...item, id: generateId() } as T;
      setter(prev => [newItem, ...prev]);
      return newItem;
    }
  };

  const deleteItem = <T extends {id: string}>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    setter(prev => prev.filter(item => item.id !== id));
  };
  
  return {
    aquariums,
    waterChanges,
    plants,
    fertilizations,
    photos,
    tasks,
    
    addAquarium: (data: Omit<Aquarium, 'id'>) => createOrUpdate(setAquariums, data),
    updateAquarium: (data: Aquarium) => createOrUpdate(setAquariums, data),
    deleteAquarium: (id: string) => {
        setWaterChanges(prev => prev.filter(i => i.aquariumId !== id));
        setPlants(prev => prev.filter(i => i.aquariumId !== id));
        setFertilizations(prev => prev.filter(i => i.aquariumId !== id));
        setPhotos(prev => prev.filter(i => i.aquariumId !== id));
        setTasks(prev => prev.filter(i => i.aquariumId !== id));
        deleteItem(setAquariums, id);
    },
    
    addWaterChange: (data: Omit<WaterChangeLog, 'id'>) => createOrUpdate(setWaterChanges, data),
    updateWaterChange: (data: WaterChangeLog) => createOrUpdate(setWaterChanges, data),
    deleteWaterChange: (id: string) => deleteItem(setWaterChanges, id),

    addPlant: (data: Omit<Plant, 'id'>) => createOrUpdate(setPlants, data),
    updatePlant: (data: Plant) => createOrUpdate(setPlants, data),
    deletePlant: (id: string) => deleteItem(setPlants, id),
    
    addFertilization: (data: Omit<FertilizationLog, 'id'>) => createOrUpdate(setFertilizations, data),
    updateFertilization: (data: FertilizationLog) => createOrUpdate(setFertilizations, data),
    deleteFertilization: (id: string) => deleteItem(setFertilizations, id),

    addPhoto: (data: Omit<GrowthPhoto, 'id'>) => createOrUpdate(setPhotos, data),
    deletePhoto: (id: string) => deleteItem(setPhotos, id),

    addTask: (data: Omit<Task, 'id'>) => createOrUpdate(setTasks, data),
    updateTask: (data: Task) => createOrUpdate(setTasks, data),
    deleteTask: (id: string) => deleteItem(setTasks, id),
    
    completeTask: (taskId: string, completionDate: string) => {
        const taskToComplete = tasks.find(t => t.id === taskId);
        if (!taskToComplete) return;

        if (taskToComplete.isRepeatable) {
            setTasks(prevTasks => prevTasks.map(task => 
                task.id === taskId ? { ...task, lastCompleted: completionDate } : task
            ));
        } else {
            // It's a one-off task, so we remove it upon completion
            deleteItem(setTasks, taskId);
        }
    },
  };
};

export type UseAquariumDataReturnType = ReturnType<typeof useAquariumData>;