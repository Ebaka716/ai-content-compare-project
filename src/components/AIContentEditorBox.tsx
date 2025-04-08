'use client';

import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface AIContentEditorBoxProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  onAiFormat: () => void;
  isFormatting: boolean;
  onAiConfigOpen: () => void;
}

const AIContentEditorBox = ({ 
  initialContent, 
  onContentChange, 
  onAiFormat, 
  isFormatting,
  onAiConfigOpen 
}: AIContentEditorBoxProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    let quillInstance: Quill | null = null;
    const currentEditorRef = editorRef.current;

    if (currentEditorRef && !quillRef.current) {
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
        placeholder: 'Paste plain text or type here, then use \'Format with AI\'...',
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
      if (currentEditorRef) {
         currentEditorRef.innerHTML = '';
      }
      quillRef.current = null;
    };
  }, [initialContent, onContentChange]);

  const buttonBase = "border-none py-2 px-4 rounded cursor-pointer text-sm flex items-center gap-1.25 disabled:opacity-50 disabled:cursor-not-allowed";
  const aiFormatButtonStyle = "bg-[#6200ea] text-white hover:bg-[#4a00b3]";
  const aiConfigButtonStyle = "bg-transparent border-none p-2 cursor-pointer";

  return (
    <>
      <div className="bg-white rounded-lg p-4 shadow-md h-full flex flex-col">
        <h2 className="mt-0 mb-2 text-gray-800 text-lg flex justify-between items-center shrink-0 tracking-[var(--fidelity-header-letter-spacing)] w-full">
          <span>AI Editor</span>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onAiFormat}
              id="aiFormatButton" 
              className={`${buttonBase} ${aiFormatButtonStyle}`}
              disabled={isFormatting}
            >
              {isFormatting ? (
                <span className="ai-loader inline-block w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] rounded-[50%] border-t-white animate-spin"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-4 h-4'>
                    <path d="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 Z"></path>
                </svg>
              )}
              {isFormatting ? 'Formatting...' : 'Format with AI'}
            </button>
            <button 
              onClick={onAiConfigOpen}
              id="aiConfigButton" 
              className={aiConfigButtonStyle}
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-5 h-5'>
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </h2>

        <div style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div ref={editorRef} className='min-h-[300px] mb-2.5 grow border border-gray-200 rounded'></div>
        </div>
      </div>
    </>
  );
};

export default AIContentEditorBox; 