export type Unit = 'gallons-us' | 'gallons-uk' | 'litres';

export interface Aquarium {
  id: string;
  name: string;
  size: number;
  unit: Unit;
  setupDate: string; // ISO string
  dashboardPhotoId?: string;
  co2?: { details: string };
  lighting?: { brand: string; durationStart: string; durationEnd: string };
}

export interface WaterChangeLog {
  id: string;
  aquariumId: string;
  date: string; // ISO string
  volume: number;
  unit: Unit;
  notes?: string;
}

export interface Plant {
  id:string;
  aquariumId: string;
  species: string;
  plantingDate: string; // ISO string
  photoDataUrl?: string;
  notes?: string;
}

export interface FertilizationLog {
  id: string;
  aquariumId: string;
  date: string; // ISO string
  fertilizer: string;
  dosageMl: number;
  notes?: string;
}

export interface GrowthPhoto {
  id:string;
  aquariumId: string;
  date: string; // ISO string
  photoDataUrl: string;
  notes?: string;
}

export interface Task {
  id: string;
  aquariumId: string;
  name: string;
  isRepeatable: boolean;
  frequencyDays?: number;
  lastCompleted: string; // For repeatable tasks: last done date. For one-off: due date.
  notes?: string;
}

export type Log = WaterChangeLog | FertilizationLog;

export type ModalType = 
  | 'LOG_WATER_CHANGE' 
  | 'LOG_FERTILIZER' 
  | 'ADD_PLANT'
  | 'ADD_TASK' 
  | 'UPLOAD_PHOTO'
  | 'ADD_AQUARIUM'
  | 'EDIT_AQUARIUM'
  | 'EDIT_WATER_CHANGE'
  | 'EDIT_FERTILIZER'
  | 'EDIT_PLANT'
  | 'EDIT_TASK';

export interface ModalState {
    type: ModalType;
    itemToEdit?: any;
}