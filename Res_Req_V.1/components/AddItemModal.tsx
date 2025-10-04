
import React, { useState } from 'react';
import { Resource, Language } from '../types';
import { XMarkIcon } from './Icons';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<Resource, 'item_number' | 'category'>) => void;
  lang: Language;
}

const translations = {
    en: {
        title: "Add New Item",
        englishName: "Item Name (English)",
        arabicName: "Item Name (Arabic)",
        unit: "Unit (e.g., Piece, Box)",
        addItem: "Add Item",
        close: "Close"
    },
    ar: {
        title: "إضافة عنصر جديد",
        englishName: "اسم العنصر (انجليزي)",
        arabicName: "اسم العنصر (عربي)",
        unit: "الوحدة (مثال: قطعة, صندوق)",
        addItem: "إضافة عنصر",
        close: "إغلاق"
    }
};

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAddItem, lang }) => {
  const [itemEnglish, setItemEnglish] = useState('');
  const [itemArabic, setItemArabic] = useState('');
  const [unit, setUnit] = useState('');

  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemEnglish.trim() && itemArabic.trim() && unit.trim()) {
      onAddItem({ item_english: itemEnglish, item_arabic: itemArabic, unit });
      setItemEnglish('');
      setItemArabic('');
      setUnit('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">{t.title}</h2>
            <button onClick={onClose} className="text-secondary-gray-light hover:text-primary">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-gray-dark mb-1">{t.englishName}</label>
                <input
                  type="text"
                  value={itemEnglish}
                  onChange={(e) => setItemEnglish(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-gray-dark mb-1">{t.arabicName}</label>
                <input
                  type="text"
                  value={itemArabic}
                  onChange={(e) => setItemArabic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  required
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-gray-dark mb-1">{t.unit}</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-primary rounded-md hover:bg-gray-300 transition"
              >
                {t.close}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition"
              >
                {t.addItem}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
