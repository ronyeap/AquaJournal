import React from 'react';

interface TestItem {
  id: string;
  name: string;
  index: number;
}

interface ButtonTestComponentProps {
  items: TestItem[];
  onEdit: (item: TestItem) => void;
  onDelete: (item: TestItem) => void;
}

export const ButtonTestComponent: React.FC<ButtonTestComponentProps> = ({ items, onEdit, onDelete }) => {
  console.log('ButtonTestComponent rendered with items:', items);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Button Test Component</h3>
      <ul className="space-y-3">
        {items.map((item, index) => {
          console.log(`Rendering item ${index}:`, item);
          
          return (
            <li key={item.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">Item {index + 1}: {item.name}</p>
                <p className="text-sm text-slate-600">ID: {item.id}</p>
              </div>
              <div className="flex space-x-3 ml-4">
                <button 
                  onClick={() => {
                    console.log(`=== EDIT BUTTON CLICKED FOR ITEM ${index + 1} ===`);
                    console.log('Item data:', item);
                    console.log('Item index:', index);
                    console.log('Item ID:', item.id);
                    console.log('Calling onEdit with:', item);
                    onEdit(item);
                  }} 
                  className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Edit"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => {
                    console.log(`=== DELETE BUTTON CLICKED FOR ITEM ${index + 1} ===`);
                    console.log('Item data:', item);
                    console.log('Item index:', index);
                    console.log('Item ID:', item.id);
                    console.log('Calling onDelete with:', item);
                    onDelete(item);
                  }} 
                  className="p-3 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Delete"
                >
                  🗑️
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
