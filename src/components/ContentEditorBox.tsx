import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import showdown from 'showdown';
import * as XLSX from 'xlsx'; // Import xlsx
import mammoth from 'mammoth'; // Import mammoth
import ImportModal from './ImportModal'; // Import the modal component

interface ContentEditorBoxProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

const converter = new showdown.Converter();

// Define type for import status
type ImportStatus = {
  message: string;
  type: 'success' | 'error' | 'info';
} | null;

const ContentEditorBox = ({ initialContent, onContentChange }: ContentEditorBoxProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for file input

  const [currentFormat, setCurrentFormat] = useState<'html' | 'markdown'>('html');
  const [formattedOutput, setFormattedOutput] = useState<string>('');

  // State for modal and import process
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importMode, setImportMode] = useState('word');
  const [importStatus, setImportStatus] = useState<ImportStatus>(null);

  // --- Quill Initialization Effect ---
  useEffect(() => {
    let quillInstance: Quill | null = null;
    const currentEditorRef = editorRef.current; // Store ref current value

    if (currentEditorRef && !quillRef.current) { // Check variable and ensure not already initialized
      quillInstance = new Quill(currentEditorRef, {
        modules: {
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
        placeholder: 'Compose your content here...',
        theme: 'snow'
      });
      quillInstance.clipboard.dangerouslyPasteHTML(initialContent || '');
      quillInstance.on('text-change', (_, __, source) => {
        if (source === 'user') {
          const html = quillInstance?.root.innerHTML || '';
          onContentChange(html);
        }
      });
      quillRef.current = quillInstance; 
    }
    return () => {
      // Cleanup using the captured variable
      if (currentEditorRef) { 
         currentEditorRef.innerHTML = ''; 
      }
      quillRef.current = null;
    };
  }, [initialContent, onContentChange]); // Consider dependencies

  // --- Formatted Output Effect (unchanged) ---
  useEffect(() => {
    // ... (Showdown conversion logic remains the same)
     if (currentFormat === 'html') {
      setFormattedOutput(initialContent);
    } else {
      const markdown = converter.makeMarkdown(initialContent);
      setFormattedOutput(markdown);
    }
  }, [initialContent, currentFormat]);

  // --- Modal Handlers ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleModalProceed = (mode: string) => {
    setImportMode(mode);
    closeModal();
    // Set accept attribute and trigger click
    if (fileInputRef.current) {
      if (mode === 'word') {
        fileInputRef.current.accept = '.doc,.docx';
      } else {
        fileInputRef.current.accept = '.xlsx,.xls';
      }
      fileInputRef.current.value = ''; // Reset file input
      fileInputRef.current.click();
    }
  };

  // --- File Input Handler ---
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

        // Update Quill editor via parent
        onContentChange(newContent);
        // Need to update Quill directly *after* state update if possible, or use initialContent effect?
        // For now, rely on parent state update triggering re-render/Quill update
        // quillRef.current?.clipboard.dangerouslyPasteHTML(newContent);

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

  // --- File Processing Functions ---
  const processExcelFile = (arrayBuffer: ArrayBuffer, mode: string): string => {
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (mode === 'excel-cell') {
      const cell = worksheet['A1']; // Assuming A1
      return cell ? String(cell.v) : '';
    } else { // excel-table
      return XLSX.utils.sheet_to_html(worksheet);
    }
  };

  const processWordFile = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    // Log warnings if any
    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth messages:', result.messages);
    }
    return result.value; // The generated HTML
  };


  // --- Toggle/Copy Handlers (mostly unchanged) ---
  const handleFormatToggle = (format: 'html' | 'markdown') => {
     setCurrentFormat(format);
  };
  const handleCopy = () => {
     navigator.clipboard.writeText(formattedOutput)
      .then(() => { setImportStatus({ message: 'Copied!', type: 'success'}) })
      .catch(err => { console.error('Copy failed', err); setImportStatus({ message: 'Copy failed', type: 'error' }) });
  };

  // --- Tailwind Base Styles --- 
  const buttonBase = "border-none py-2 px-4 rounded cursor-pointer text-sm flex items-center gap-1.25 disabled:opacity-50 disabled:cursor-not-allowed";
  const importButtonStyle = "bg-green-600 text-white hover:bg-green-700";
  const clearButtonStyle = "bg-red-600 text-white hover:bg-red-700";
  const copyButtonStyle = "bg-gray-600 text-white hover:bg-gray-700 text-[0.8em] p-[5px_10px]";
  const toggleButtonBase = "py-1.5 px-3 border border-gray-300 cursor-pointer outline-none flex-1";
  const toggleButtonActive = "bg-blue-600 text-white border-blue-600";
  const toggleButtonInactive = "bg-gray-200 text-gray-800";
  const statusBase = "text-sm mt-1.25 px-2 py-1 rounded";
  const statusSuccess = "text-green-700 bg-green-100";
  const statusError = "text-red-700 bg-red-100";
  const statusInfo = "text-blue-700 bg-blue-100";
  const sectionLabelStyle = "font-bold mt-auto pt-4 mb-1 text-gray-600 border-t border-gray-200 pb-1 flex justify-between items-center tracking-[var(--fidelity-header-letter-spacing)]";

  // --- Render Logic ---
  return (
    <>
      {/* Render Modal */}
      <ImportModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onProceed={handleModalProceed} 
      />

      {/* Main Component Box */}
      <div className="bg-white rounded-lg p-4 shadow-md h-auto flex flex-col">
        {/* Header with Import Button */}
        <h2 className="mt-0 mb-2 text-gray-800 text-lg flex justify-between items-center shrink-0 tracking-[var(--fidelity-header-letter-spacing)] w-full">
          <span>Content Editor</span>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={openModal} // Open modal on click
              id="importButton" 
              className={`${buttonBase} ${importButtonStyle}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-4 h-4'>
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                 <polyline points="7 10 12 15 17 10"></polyline>
                 <line x1="12" y1="15" x2="12" y2="3"></line>
               </svg>
              Import File
            </button>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              // Accept attribute is set dynamically
            />
          </div>
        </h2>

        {/* Quill Editor Container */}
        <div style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div ref={editorRef} className='min-h-[300px] mb-2.5 grow border border-gray-200 rounded'></div>
          {/* ... Clear button (logic needed) ... */}
          <button id="clearButton" className={`${buttonBase} ${clearButtonStyle} absolute bottom-4 left-4 py-1.5 px-3 text-[0.85em] z-10 hidden`}>
             {/* ... SVG ... */}
            Clear Content
         </button>
        </div>

        {/* Import Status Display */}
        {importStatus && (
          <div className={`${statusBase} ${importStatus.type === 'success' ? statusSuccess : importStatus.type === 'error' ? statusError : statusInfo}`}>
            {importStatus.message}
          </div>
        )}

        {/* Format Toggle Section */}
        <div className={`${sectionLabelStyle}`}>
           {/* ... Display Options label and Copy Button ... */}
           Display Options
            <button onClick={handleCopy} id="copyButton" className={`${buttonBase} ${copyButtonStyle}`}>
              {`Copy ${currentFormat === 'html' ? 'HTML' : 'Markdown'} to Clipboard`}
            </button>
        </div>
        <div className="flex mb-2 shrink-0">
           {/* ... Toggle Buttons ... */}
           <button 
              onClick={() => handleFormatToggle('html')}
              id="htmlToggle" 
              className={`${toggleButtonBase} rounded-l ${currentFormat === 'html' ? toggleButtonActive : toggleButtonInactive}`}>
            Show HTML
          </button>
          <button 
            onClick={() => handleFormatToggle('markdown')}
            id="markdownToggle" 
            className={`${toggleButtonBase} rounded-r ${currentFormat === 'markdown' ? toggleButtonActive : toggleButtonInactive}`}>
            Show Markdown
          </button>
        </div>

        {/* Output Textarea */}
        <div className="relative flex flex-col p-0 m-0 shrink-0">
          <textarea 
            id="inputText"
            readOnly
            value={formattedOutput}
            placeholder="Formatted code will appear here..." 
            className='w-full h-[130px] p-2.5 border border-[#ddd] rounded resize-y font-[inherit] shrink-0 leading-[var(--fidelity-line-height)] tracking-[var(--fidelity-letter-spacing)] bg-gray-50'
          ></textarea>
        </div>
      </div>
    </>
  );
};

export default ContentEditorBox;
