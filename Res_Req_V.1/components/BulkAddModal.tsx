import React, { useState, useCallback } from 'react';
import { Language } from '../types';
import { XMarkIcon, DownloadIcon } from './Icons';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkAdd: (items: { item_english: string; item_arabic: string; unit: string; quantity: number }[]) => void;
  lang: Language;
}

const translations = {
  en: {
    title: "Bulk Add Items via CSV",
    instructions: "To bulk add items, please follow these steps:",
    step1: "1. Download the CSV template file.",
    step2: "2. Fill it with the item names (English and Arabic), unit, and quantities. The columns must be 'item_english', 'item_arabic', 'unit', and 'quantity'. Item numbers will be generated automatically.",
    step3: "3. Upload the filled CSV file below.",
    downloadTemplate: "Download Template",
    uploadFile: "Upload CSV File",
    import: "Import",
    cancel: "Cancel",
    processing: "Processing...",
    errorTitle: "Import Error",
    errorInvalidFile: "Invalid file format. Please upload a CSV file.",
    errorInvalidHeaders: "Invalid CSV headers. Please make sure the headers are 'item_english', 'item_arabic', 'unit', and 'quantity'.",
    errorInvalidData: "Invalid data found in the file. Please check your data.",
    fileDrop: "Drop your CSV file here or click to select",
  },
  ar: {
    title: "إضافة عناصر دفعة واحدة عبر ملف CSV",
    instructions: "لإضافة عناصر دفعة واحدة، يرجى اتباع الخطوات التالية:",
    step1: "1. قم بتنزيل ملف القالب CSV.",
    step2: "2. املأه بأسماء العناصر (انجليزي وعربي)، الوحدة، والكميات. يجب أن تكون الأعمدة 'item_english', 'item_arabic', 'unit', و 'quantity'. سيتم إنشاء أرقام العناصر تلقائيًا.",
    step3: "3. قم بتحميل ملف CSV المملوء أدناه.",
    downloadTemplate: "تنزيل القالب",
    uploadFile: "تحميل ملف CSV",
    import: "استيراد",
    cancel: "إلغاء",
    processing: "جاري المعالجة...",
    errorTitle: "خطأ في الاستيراد",
    errorInvalidFile: "تنسيق ملف غير صالح. يرجى تحميل ملف CSV.",
    errorInvalidHeaders: "رؤوس CSV غير صالحة. يرجى التأكد من أن الرؤوس هي 'item_english', 'item_arabic', 'unit', و 'quantity'.",
    errorInvalidData: "تم العثور على بيانات غير صالحة في الملف. يرجى التحقق من بياناتك.",
    fileDrop: "اسحب ملف CSV هنا أو انقر للاختيار",
  }
};

const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, onBulkAdd, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const t = translations[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv') {
        setError(t.errorInvalidFile);
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv') {
          setError(null);
          setFile(droppedFile);
      } else {
          setError(t.errorInvalidFile);
          setFile(null);
      }
      e.dataTransfer.clearData();
    }
  }, [t.errorInvalidFile]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const downloadTemplate = () => {
    const csvContent = '\uFEFFitem_english,item_arabic,unit,quantity\n"Example Item","مثال على عنصر","Piece",10';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_add_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error(t.errorInvalidData);
        }
        
        const headerLine = lines[0].trim().replace(/^\uFEFF/, '').toLowerCase();
        const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
        
        if (headers[0] !== 'item_english' || headers[1] !== 'item_arabic' || headers[2] !== 'unit' || headers[3] !== 'quantity') {
          throw new Error(t.errorInvalidHeaders);
        }

        const items: { item_english: string; item_arabic: string; unit: string; quantity: number }[] = [];
        for (let i = 1; i < lines.length; i++) {
          const data = lines[i].split(',');
          if (data.length !== 4) {
            console.warn(`Skipping invalid line ${i+1} due to incorrect number of columns: ${lines[i]}`);
            continue;
          }
          const item_english = data[0].trim().replace(/"/g, '');
          const item_arabic = data[1].trim().replace(/"/g, '');
          const unit = data[2].trim().replace(/"/g, '');
          const quantity = parseInt(data[3].trim(), 10);

          if (!item_english || !item_arabic || !unit || isNaN(quantity)) {
            console.warn(`Skipping invalid data on line ${i+1}: ${lines[i]}`);
            continue; // Skip invalid lines
          }
          items.push({ item_english, item_arabic, unit, quantity });
        }

        if (items.length === 0) {
            throw new Error(t.errorInvalidData);
        }
        
        onBulkAdd(items);
        handleClose();
      } catch (err: any) {
        setError(err.message || t.errorInvalidData);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
        setError('Error reading file.');
        setIsProcessing(false);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">{t.title}</h2>
            <button onClick={handleClose} className="text-secondary-gray-light hover:text-primary">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4 text-secondary-gray-dark">
            <p>{t.instructions}</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>{t.step1}</li>
              <li>{t.step2}</li>
              <li>{t.step3}</li>
            </ol>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              <DownloadIcon className="w-4 h-4" />
              {t.downloadTemplate}
            </button>
          </div>

          <div className="mt-6">
            <label onDrop={handleDrop} onDragOver={handleDragOver} className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                <span className="flex items-center space-x-2 rtl:space-x-reverse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-medium text-gray-600">
                        {file ? file.name : t.fileDrop}
                    </span>
                </span>
                <input type="file" name="file_upload" className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-bold">{t.errorTitle}</p>
                <p>{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-primary rounded-md hover:bg-gray-300 transition"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? t.processing : t.import}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAddModal;