'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import * as XLSX from 'xlsx'; // Import xlsx
import mammoth from 'mammoth'; // Import mammoth
import ImportModal from './ImportModal'; // Import the modal component

// Define type for import status (can be shared)
type ImportStatus = {
  message: string;
  type: 'success' | 'error' | 'info';
} | null;

// Update props interface
interface AIContentEditorBoxProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  onAiFormat: () => Promise<void>; // Handler for AI format button
  isFormatting: boolean; // Loading state indicator
  onAiConfigOpen: () => void; // Add prop for opening config modal
  // TODO: Add props for AI config handlers
}

const AIContentEditorBox = ({ 
  initialContent, 
  onContentChange, 
  onAiFormat, 
  isFormatting, 
  onAiConfigOpen // Accept the new prop
}: AIContentEditorBoxProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for file import

  // State for modal and import process (copied from ContentEditorBox)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importMode, setImportMode] = useState('word');
  const [importStatus, setImportStatus] = useState<ImportStatus>(null);

  // --- Quill Initialization Effect ---
  useEffect(() => {
    let quillInstance: Quill | null = null;
    const currentEditorRef = editorRef.current; // Store ref current value

    if (currentEditorRef) { // Use the variable
        quillInstance = new Quill(currentEditorRef, {
          modules: { /* Standard toolbar */ 
             toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],
              ['link', 'image'],
              ['clean']
            ]
          },
          placeholder: 'Compose content for AI formatting...',
          theme: 'snow'
        });

        quillInstance.clipboard.dangerouslyPasteHTML(initialContent || '');

        quillInstance.on('text-change', (_, __, source) => {
          if (source === 'user') {
            const html = quillInstance?.root.innerHTML || '';
            onContentChange(html); // Notify parent of content change
          }
        });
        quillRef.current = quillInstance; 
    }
    // Cleanup
    return () => {
        if (currentEditorRef) { // Use the variable in cleanup
            currentEditorRef.innerHTML = ''; 
        }
        quillRef.current = null;
    };
  // Dependency array should only include things that, if changed, require re-running the effect.
  // initialContent is used to set the initial value, but changing it might not require re-initializing Quill.
  // onContentChange is a function reference, stable if defined with useCallback or outside component.
  // Keeping it simple for now, but could refine dependencies if needed.
  }, [/* initialContent, onContentChange */]); // Consider dependencies carefully

  // --- Modal Handlers (copied from ContentEditorBox) ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleModalProceed = (mode: string) => {
    setImportMode(mode);
    closeModal();
    if (fileInputRef.current) {
      if (mode === 'word') {
        fileInputRef.current.accept = '.doc,.docx';
      } else {
        fileInputRef.current.accept = '.xlsx,.xls';
      }
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // --- File Input Handler (copied from ContentEditorBox) ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportStatus({ message: 'Importing file...', type: 'info' });
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) throw new Error("Failed to read file buffer.");
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        let newContent = '';
        if ((fileExt === 'xlsx' || fileExt === 'xls') && importMode.startsWith('excel')) {
          newContent = processExcelFile(arrayBuffer, importMode);
        } else if ((fileExt === 'doc' || fileExt === 'docx') && importMode === 'word') {
          newContent = await processWordFile(arrayBuffer);
        } else {
          throw new Error('File type does not match selected import mode.');
        }
        // Use the onContentChange prop to update the parent state (aiEditorContent)
        onContentChange(newContent); 
        setImportStatus({ message: 'File imported successfully!', type: 'success' });
      } catch (error: unknown) {
        console.error('Error processing file:', error);
        let errorMessage = 'An unknown error occurred processing the file.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setImportStatus({ message: `Error: ${errorMessage}`, type: 'error' });
      }
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setImportStatus({ message: 'Error reading file', type: 'error' });
    };
    reader.readAsArrayBuffer(file);
  };

  // --- File Processing Functions (copied from ContentEditorBox) ---
  const processExcelFile = (arrayBuffer: ArrayBuffer, mode: string): string => {
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    if (mode === 'excel-cell') {
      const cell = worksheet['A1']; return cell ? String(cell.v) : '';
    } else { 
      return XLSX.utils.sheet_to_html(worksheet);
    }
  };
  const processWordFile = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    if (result.messages && result.messages.length > 0) console.warn('Mammoth:', result.messages);
    return result.value;
  };

  // Placeholder handlers for AI buttons
  const handleAiConfig = () => {
    onAiConfigOpen(); // Call parent handler to open modal
  };

  // --- Tailwind Base Styles (copied from ContentEditorBox for consistency) --- 
  const buttonBase = "border-none py-2 px-4 rounded cursor-pointer text-sm flex items-center gap-1.25 disabled:opacity-50 disabled:cursor-not-allowed";
  const importButtonStyle = "bg-green-600 text-white hover:bg-green-700";
  const aiFormatButtonStyle = "bg-purple-600 text-white hover:bg-purple-700"; // Specific style for AI button
  const aiConfigButtonStyle = "bg-transparent border-none p-[8px_5px] cursor-pointer ml-0 disabled:opacity-50 disabled:cursor-not-allowed";
  const statusBase = "text-sm mt-1.25 px-2 py-1 rounded";
  const statusSuccess = "text-green-700 bg-green-100";
  const statusError = "text-red-700 bg-red-100";
  const statusInfo = "text-blue-700 bg-blue-100";

  return (
    <>
      {/* Render Modal */}
      <ImportModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onProceed={handleModalProceed} 
      />

      <div className="bg-white rounded-lg p-4 shadow-md h-auto flex flex-col">
        <h2 className="mt-0 mb-2 text-gray-800 text-lg flex justify-between items-center shrink-0 tracking-[var(--fidelity-header-letter-spacing)] w-full">
          <span>Content Editor</span>
          <div className="flex items-center gap-1.5">
            <button onClick={openModal} className={`${buttonBase} ${importButtonStyle}`} disabled={isFormatting}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-4 h-4'>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Import File
            </button>
            <button onClick={onAiFormat} id="aiFormatButton" className={`${buttonBase} ${aiFormatButtonStyle}`} disabled={isFormatting}>
              {isFormatting ? (<span className="animate-pulse">Formatting...</span>) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-4 h-4'>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <path d="M9 21V9"></path><path d="M15 9v3"></path><path d="M15 15v6"></path>
                    <circle cx="15" cy="12" r="0.5"></circle><circle cx="15" cy="18" r="0.5"></circle>
                  </svg>
                  Format with AI
                </>
              )}
            </button>
            <button onClick={handleAiConfig} id="aiConfigButton" className={`${aiConfigButtonStyle}`} disabled={isFormatting}>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-600">
                   <circle cx="12" cy="12" r="2"></circle><path d="M12 6V4"></path><path d="M12 20v-2"></path><path d="M6 12H4"></path>
                   <path d="M20 12h-2"></path><path d="M16.24 7.76l-1.42 1.42"></path><path d="M9.18 14.82l-1.42 1.42"></path>
                   <path d="M16.24 16.24l-1.42-1.42"></path><path d="M9.18 9.18l-1.42-1.42"></path>
               </svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" /> 
          </div>
        </h2>

        <div style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div ref={editorRef} className='min-h-[300px] mb-2.5 grow border border-gray-200 rounded'></div>
        </div>

        {importStatus && (
          <div className={`${statusBase} ${importStatus.type === 'success' ? statusSuccess : importStatus.type === 'error' ? statusError : statusInfo}`}>
            {importStatus.message}
          </div>
        )}
      </div>
    </>
  );
};

export default AIContentEditorBox; 