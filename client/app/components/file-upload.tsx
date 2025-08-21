'use client';
import * as React from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";

const FileUploadComponent: React.FC = () => {
  const { getToken } = useAuth();
  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');
    el.addEventListener('change', async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append('pdf', file);

          const token = await getToken();
          await fetch('http://localhost:8000/upload/pdf', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          console.log('File uploaded');
        }
      }
    });
    el.click();
  };

  return (
    <div
      className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-2xl flex flex-col justify-center items-center p-8 rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-600 transition-all duration-200 cursor-pointer group relative min-w-[320px] min-h-[220px]"
      onClick={handleFileUploadButtonClick}
      tabIndex={0}
      role="button"
      aria-label="Upload PDF File"
      onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleFileUploadButtonClick(); }}
    >
      <div className="flex flex-col justify-center items-center gap-3 select-none">
        <Upload className="w-16 h-16 text-blue-500 group-hover:scale-110 group-hover:text-blue-700 transition-transform duration-200" />
        <h3 className="text-xl font-semibold text-blue-700 mb-1">Upload PDF File</h3>
        <p className="text-sm text-blue-500 group-hover:text-blue-700 transition-colors text-center max-w-xs">
          Click or tap here to select a PDF file from your device.<br />
          <span className="text-xs text-blue-400">(Only .pdf files are supported)</span>
        </p>
      </div>
      <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-400">
        Secure upload
      </div>
    </div>
  );
};

export default FileUploadComponent;