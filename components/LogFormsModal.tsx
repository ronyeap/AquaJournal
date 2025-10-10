import React, { useState, useCallback, useEffect } from 'react';
import { ModalType, Aquarium, Unit, ModalState } from '../types';
import { UseAquariumDataReturnType } from '../hooks/useAquariumData';

interface LogFormsModalProps {
  modalState: ModalState;
  aquariumId: string | null;
  onClose: () => void;
  dataActions: UseAquariumDataReturnType;
  onAddAquarium: (aquarium: Omit<Aquarium, 'id'>) => void;
}

const today = new Date().toISOString().split('T')[0];

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div role="dialog" aria-modal="true" className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export const LogFormsModal: React.FC<LogFormsModalProps> = ({ modalState, aquariumId, onClose, dataActions, onAddAquarium }) => {
  const { type, itemToEdit } = modalState;
  // Helper function to derive initial form data
  const deriveFormData = (modalType: ModalType, item: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (item) {
      // If editing an item, process its data
      const dateFields = ['date', 'setupDate', 'plantingDate', 'lastCompleted'];
      const editedData = { ...item };
      
      dateFields.forEach(field => {
        if (editedData[field]) {
          editedData[field] = new Date(editedData[field]).toISOString().split('T')[0];
        }
      });
      
      return editedData;
    } else {
      // Set defaults for new entries
      const defaultData: any = { date: today, unit: 'gallons-us' };
      if (modalType === 'ADD_AQUARIUM') {
          defaultData.lighting = {durationStart: '10:00', durationEnd: '20:00'};
      }
      if (modalType === 'ADD_TASK') {
          defaultData.isRepeatable = true;
          defaultData.frequencyDays = 7;
      }
      return defaultData;
    }
  };

  // Initialize formData with correct values immediately
  const [formData, setFormData] = useState<any>(() => deriveFormData(type, itemToEdit));
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update formData when props change (for modal reuse)
  useEffect(() => {
    const newFormData = deriveFormData(type, itemToEdit);
    
    // Only update if the data has actually changed
    if (JSON.stringify(formData) !== JSON.stringify(newFormData)) {
      setFormData(newFormData);
    }
  }, [type, itemToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: inputType, checked } = e.target as HTMLInputElement;
    const isNumber = inputType === 'number';
    const isCheckbox = inputType === 'checkbox';

    setFormData((prev: any) => ({ 
        ...prev, 
        [name]: isCheckbox ? checked : (isNumber && value !== '' ? Number(value) : value) 
    }));
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (limit to 10MB to prevent memory issues)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError('File size too large. Please select an image smaller than 10MB.');
        return;
      }
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      setFile(selectedFile);
      setError(null); // Clear any previous errors
    }
  };

  const processFormAndSubmit = (photoDataUrl?: string) => {
    try {
      console.log('processFormAndSubmit called with:', { type, photoDataUrl: photoDataUrl ? 'data URL present' : 'no data URL' });
      
      const data: any = { ...formData };
      if (itemToEdit) data.id = itemToEdit.id;
      if (photoDataUrl) data.photoDataUrl = photoDataUrl;
      
      const date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();
      const setupDate = data.setupDate ? new Date(data.setupDate).toISOString() : new Date().toISOString();

      console.log('Processing form data:', { type, aquariumId, data });

      switch (type) {
        case 'ADD_AQUARIUM':
        case 'EDIT_AQUARIUM':
          const aquariumData = {
            id: data.id,
            name: data.name, size: data.size, unit: data.unit, setupDate,
            dashboardPhotoId: data.dashboardPhotoId,
            co2: data.co2?.details ? { details: data.co2.details } : undefined,
            lighting: data.lighting?.brand ? { brand: data.lighting.brand, durationStart: data.lighting.durationStart, durationEnd: data.lighting.durationEnd } : undefined
          };
          console.log('Adding/updating aquarium:', aquariumData);
          type === 'ADD_AQUARIUM' ? onAddAquarium(aquariumData) : dataActions.updateAquarium(aquariumData);
          break;
        case 'LOG_WATER_CHANGE':
        case 'EDIT_WATER_CHANGE':
          const wcData = { aquariumId: aquariumId!, date, volume: data.volume, unit: data.unit, notes: data.notes, id: data.id };
          console.log('Adding/updating water change:', wcData);
          type === 'LOG_WATER_CHANGE' ? dataActions.addWaterChange(wcData) : dataActions.updateWaterChange(wcData);
          break;
        case 'LOG_FERTILIZER':
        case 'EDIT_FERTILIZER':
          const fertData = { aquariumId: aquariumId!, date, fertilizer: data.fertilizer, dosageMl: data.dosageMl, notes: data.notes, id: data.id };
          console.log('Adding/updating fertilization:', fertData);
          type === 'LOG_FERTILIZER' ? dataActions.addFertilization(fertData) : dataActions.updateFertilization(fertData);
          break;
        case 'ADD_PLANT':
        case 'EDIT_PLANT':
          const plantData = { aquariumId: aquariumId!, plantingDate: date, species: data.species, notes: data.notes, photoDataUrl: data.photoDataUrl, id: data.id };
          console.log('Adding/updating plant:', plantData);
          try {
            type === 'ADD_PLANT' ? dataActions.addPlant(plantData) : dataActions.updatePlant(plantData);
            console.log('Plant added/updated successfully');
          } catch (storageError) {
            console.error('Failed to save plant:', storageError);
            throw new Error('Failed to save plant. Storage may be full. Please try deleting some old photos.');
          }
          break;
        case 'ADD_TASK':
        case 'EDIT_TASK':
          const taskData = { 
              aquariumId: aquariumId!, 
              name: data.name, 
              isRepeatable: data.isRepeatable,
              frequencyDays: data.isRepeatable ? data.frequencyDays : undefined, 
              lastCompleted: date, 
              notes: data.notes, 
              id: data.id 
          };
          console.log('Adding/updating task:', taskData);
          type === 'ADD_TASK' ? dataActions.addTask(taskData) : dataActions.updateTask(taskData);
          break;
        case 'UPLOAD_PHOTO':
          const photoData = { aquariumId: aquariumId!, date, photoDataUrl: data.photoDataUrl!, notes: data.notes };
          console.log('Adding photo:', { ...photoData, photoDataUrl: photoDataUrl ? 'data URL present' : 'no data URL' });
          try {
            dataActions.addPhoto(photoData);
            console.log('Photo added successfully');
          } catch (storageError) {
            console.error('Failed to save photo:', storageError);
            throw new Error('Failed to save photo. Storage may be full. Please try deleting some old photos.');
          }
          break;
        default:
          console.error('Unknown modal type:', type);
      }
      
      console.log('Form processing completed, closing modal');
      onClose();
    } catch (error) {
      console.error('Error in processFormAndSubmit:', error);
      setError('Failed to save. Please try again.');
      setIsProcessing(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called for type:', type, 'aquariumId:', aquariumId);
    
    if (type !== 'ADD_AQUARIUM' && type !== 'EDIT_AQUARIUM' && !aquariumId) {
      console.log('Early return: invalid aquariumId for type:', type);
      return;
    }

    if (file) {
      console.log('File selected, starting image compression for file:', file.name, 'size:', file.size);
      setIsProcessing(true);
      setError(null);
      
      compressImage(file)
        .then((compressedDataUrl) => {
          console.log('Image compression completed, compressed size:', compressedDataUrl.length);
          console.log('Calling processFormAndSubmit with compressed data');
          processFormAndSubmit(compressedDataUrl);
          console.log('processFormAndSubmit completed, setting isProcessing to false');
          setIsProcessing(false);
        })
        .catch((err) => {
          console.error('Error compressing image:', err);
          setError('Failed to process the selected image. Please try again.');
          setIsProcessing(false);
        });
    } else {
      console.log('No file selected, calling processFormAndSubmit with existing photoDataUrl');
      processFormAndSubmit(formData.photoDataUrl);
    }
  };
  
  const renderFormFields = () => {
    switch (type) {
        case 'ADD_AQUARIUM':
        case 'EDIT_AQUARIUM': return (
            <>
                <InputField name="name" label="Aquarium Name" value={formData.name || ''} onChange={handleChange} required />
                <div className="flex gap-2">
                    <InputField name="size" label="Size" type="number" value={formData.size || ''} className="flex-grow" onChange={handleChange} required />
                    <SelectField name="unit" label="Unit" value={formData.unit || 'gallons-us'} onChange={handleChange} options={[
                        {value: 'gallons-us', label: 'US Gallons'}, {value: 'gallons-uk', label: 'UK Gallons'}, {value: 'litres', label: 'Litres'}
                    ]}/>
                </div>
                <InputField name="setupDate" label="Setup Date" type="date" value={formData.setupDate || today} onChange={handleChange} required />
                <h4 className="font-semibold mt-4 pt-2 border-t">Equipment (Optional)</h4>
                <InputField name="lighting.brand" label="Lighting Brand/Model" value={formData.lighting?.brand || ''} onChange={e => setFormData(p => ({...p, lighting: {...p.lighting, brand: e.target.value}}))} />
                <div className="flex gap-2 items-end">
                    <InputField name="lighting.durationStart" label="Lights On" type="time" value={formData.lighting?.durationStart || '10:00'} className="flex-grow" onChange={e => setFormData(p => ({...p, lighting: {...p.lighting, durationStart: e.target.value}}))} />
                    <InputField name="lighting.durationEnd" label="Lights Off" type="time" value={formData.lighting?.durationEnd || '20:00'} className="flex-grow" onChange={e => setFormData(p => ({...p, lighting: {...p.lighting, durationEnd: e.target.value}}))} />
                </div>
                <InputField name="co2.details" label="CO2 Details" value={formData.co2?.details || ''} onChange={e => setFormData(p => ({...p, co2: {...p.co2, details: e.target.value}}))} />
            </>
        );
        case 'LOG_WATER_CHANGE': 
        case 'EDIT_WATER_CHANGE': 
          return (
            <>
                <InputField name="date" label="Date" type="date" value={formData.date} onChange={handleChange} required />
                <div className="flex gap-2">
                    <InputField name="volume" label="Volume Changed" type="number" value={formData.volume || ''} onChange={handleChange} className="flex-grow" required />
                     <SelectField name="unit" label="Unit" value={formData.unit || 'gallons-us'} onChange={handleChange} options={[
                        {value: 'gallons-us', label: 'US Gal'}, {value: 'gallons-uk', label: 'UK Gal'}, {value: 'litres', label: 'L'}
                    ]}/>
                </div>
                <TextAreaField name="notes" label="Notes (e.g., water parameters)" value={formData.notes || ''} onChange={handleChange} />
            </>
        );
        case 'LOG_FERTILIZER': 
        case 'EDIT_FERTILIZER': 
          return (
             <>
                <InputField name="date" label="Date" type="date" value={formData.date} onChange={handleChange} required />
                <InputField name="fertilizer" label="Fertilizer Name" value={formData.fertilizer || ''} onChange={handleChange} required />
                <InputField name="dosageMl" label="Dosage (ml)" type="number" value={formData.dosageMl || ''} onChange={handleChange} required />
                <TextAreaField name="notes" label="Notes" value={formData.notes || ''} onChange={handleChange} />
            </>
        );
        case 'ADD_PLANT': 
        case 'EDIT_PLANT': return (
             <>
                <InputField name="species" label="Plant Species" value={formData.species || ''} onChange={handleChange} required />
                <InputField name="date" label="Planting Date" type="date" value={formData.date} onChange={handleChange} required />
                <InputField name="photo" label="Plant Photo" type="file" onChange={handleFileChange} accept="image/*" />
                {file && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Selected: {file.name}</p>
                    <div className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                  </div>
                )}
                {formData.photoDataUrl && !file && <img src={formData.photoDataUrl} alt="Current plant" className="w-20 h-20 object-cover rounded-md mt-2"/>}
                <TextAreaField name="notes" label="Notes" value={formData.notes || ''} onChange={handleChange} />
            </>
        );
         case 'ADD_TASK': 
         case 'EDIT_TASK': return (
             <>
                <InputField name="name" label="Task Name" value={formData.name || ''} onChange={handleChange} required />
                 <div className="flex items-center my-3">
                    <input type="checkbox" id="isRepeatable" name="isRepeatable" checked={formData.isRepeatable || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="isRepeatable" className="ml-2 block text-sm text-gray-900">Is this a repeatable task?</label>
                </div>
                {formData.isRepeatable && (
                    <InputField name="frequencyDays" label="Frequency (in days)" type="number" value={formData.frequencyDays || ''} onChange={handleChange} required />
                )}
                <InputField name="date" label={formData.isRepeatable ? 'Last Completed Date' : 'Due Date'} type="date" value={formData.date} onChange={handleChange} required />
                <TextAreaField name="notes" label="Notes" value={formData.notes || ''} onChange={handleChange} />
            </>
        );
        case 'UPLOAD_PHOTO': return (
            <>
                <InputField name="date" label="Date" type="date" value={formData.date} onChange={handleChange} required />
                <InputField name="photo" label="Photo" type="file" onChange={handleFileChange} accept="image/*" required={!itemToEdit} />
                {file && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Selected: {file.name}</p>
                    <div className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                  </div>
                )}
                <TextAreaField name="notes" label="Notes" value={formData.notes || ''} onChange={handleChange} />
            </>
        );
        default: return null;
    }
  };
  
  const titles: Record<ModalType, string> = {
      'ADD_AQUARIUM': 'Add New Aquarium',
      'EDIT_AQUARIUM': 'Edit Aquarium',
      'LOG_WATER_CHANGE': 'Log Water Change',
      'EDIT_WATER_CHANGE': 'Edit Water Change Log',
      'LOG_FERTILIZER': 'Log Fertilization',
      'EDIT_FERTILIZER': 'Edit Fertilization Log',
      'ADD_PLANT': 'Add New Plant',
      'EDIT_PLANT': 'Edit Plant',
      'ADD_TASK': 'Add New Task',
      'EDIT_TASK': 'Edit Task',
      'UPLOAD_PHOTO': 'Upload Growth Photo'
  };

  return (
    <Modal title={titles[type]} onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
            {renderFormFields()}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t mt-4">
                <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Save'}
                </button>
            </div>
        </form>
    </Modal>
  );
};

interface FieldProps {
    name: string;
    label: string;
    onChange: (e: React.ChangeEvent<any>) => void;
    value?: string | number;
    type?: string;
    required?: boolean;
    accept?: string;
    className?: string;
}

const InputField: React.FC<FieldProps> = ({ name, label, onChange, value, type = 'text', required = false, accept, className = '' }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type={type} name={name} id={name} value={type === 'file' ? undefined : (value === undefined ? '' : value)} onChange={onChange} required={required} accept={accept}
               className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
    </div>
);

const TextAreaField: React.FC<Omit<FieldProps, 'type' | 'accept'>> = ({ name, label, value, onChange, required = false }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea name={name} id={name} value={value} onChange={onChange} required={required} rows={3}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
    </div>
);

interface SelectFieldProps {
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<any>) => void;
    options: {value: string; label: string}[];
}

const SelectField: React.FC<SelectFieldProps> = ({ name, label, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select name={name} id={name} value={value} onChange={onChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);