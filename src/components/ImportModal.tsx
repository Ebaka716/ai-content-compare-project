'use client'; // Needs state for selection, button clicks

import React, { useState } from 'react';

// Define props interface
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (mode: string) => void; // Passes selected mode back
}

const ImportModal = ({ isOpen, onClose, onProceed }: ImportModalProps) => {
  const [selectedMode, setSelectedMode] = useState('word'); // Default mode

  const handleProceed = () => {
    onProceed(selectedMode);
  };

  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="modal fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] z-[1000] flex justify-center items-center">
      <div className="modal-content bg-white p-[30px] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] w-[400px] max-w-[90%]">
        <div className="modal-header flex justify-between items-center mb-5">
          <h3 className="modal-title text-[1.2em] font-bold m-0">Select Import Format</h3>
          <button onClick={onClose} className="modal-close cursor-pointer text-[1.5em] leading-none bg-transparent border-none text-[#999]">
            &times;
          </button>
        </div>
        <div className="modal-options flex flex-col gap-3 mb-[25px]">
          {/* Word Option */}
          <div 
            onClick={() => setSelectedMode('word')} 
            className={`modal-option flex items-center p-[12px_15px] border border-[#ddd] rounded-md cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f0f0f0] hover:border-[#bbb] ${selectedMode === 'word' ? 'bg-[#e3f2fd] border-[#90caf9]' : ''}`}
            data-import-mode="word"
          >
            <div className="modal-option-icon flex items-center justify-center w-9 h-9 bg-[#f0f0f0] rounded-full mr-[15px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2b579a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-5 h-5'>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="modal-option-text flex-1">
              <div className="modal-option-title font-bold mb-0.5">Word Document</div>
              <div className="modal-option-desc text-[0.85em] text-[#666]">Import formatted text from Word (.docx, .doc)</div>
            </div>
          </div>
          {/* Excel Table Option */}
          <div 
            onClick={() => setSelectedMode('excel-table')} 
            className={`modal-option flex items-center p-[12px_15px] border border-[#ddd] rounded-md cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f0f0f0] hover:border-[#bbb] ${selectedMode === 'excel-table' ? 'bg-[#e3f2fd] border-[#90caf9]' : ''}`}
            data-import-mode="excel-table"
            >
            <div className="modal-option-icon flex items-center justify-center w-9 h-9 bg-[#f0f0f0] rounded-full mr-[15px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#217346" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-5 h-5'>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </div>
            <div className="modal-option-text flex-1">
              <div className="modal-option-title font-bold mb-0.5">Excel (Table)</div>
              <div className="modal-option-desc text-[0.85em] text-[#666]">Import entire worksheet as HTML table</div>
            </div>
          </div>
          {/* Excel Cell Option */}
          <div 
            onClick={() => setSelectedMode('excel-cell')}
            className={`modal-option flex items-center p-[12px_15px] border border-[#ddd] rounded-md cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#f0f0f0] hover:border-[#bbb] ${selectedMode === 'excel-cell' ? 'bg-[#e3f2fd] border-[#90caf9]' : ''}`}
            data-import-mode="excel-cell"
            >
            <div className="modal-option-icon flex items-center justify-center w-9 h-9 bg-[#f0f0f0] rounded-full mr-[15px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#217346" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-5 h-5'>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
              </svg>
            </div>
            <div className="modal-option-text flex-1">
              <div className="modal-option-title font-bold mb-0.5">Excel (Single Cell)</div>
              <div className="modal-option-desc text-[0.85em] text-[#666]">Import content from a single cell (A1)</div>
            </div>
          </div>
        </div>
        <div className="modal-actions flex justify-end gap-2.5">
          <button onClick={onClose} className="modal-button modal-button-cancel py-2 px-4 rounded cursor-pointer font-[inherit] text-sm border-none bg-[#f2f2f2] text-[#333]">
            Cancel
          </button>
          <button onClick={handleProceed} className="modal-button modal-button-proceed py-2 px-4 rounded cursor-pointer font-[inherit] text-sm border-none bg-[#28a745] text-white">
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal; 