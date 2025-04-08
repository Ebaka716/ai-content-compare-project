'use client';

import React, { useState, useEffect } from 'react';
import showdown from 'showdown';

// Define props interface
interface AIDisplayOptionsBoxProps {
  aiFormattedContent: string; // Content received from AI formatting
}

const converter = new showdown.Converter();

const AIDisplayOptionsBox = ({ aiFormattedContent }: AIDisplayOptionsBoxProps) => {
  const [currentFormat, setCurrentFormat] = useState<'html' | 'markdown'>('html');
  const [displayOutput, setDisplayOutput] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Effect to update the display output based on AI content and format selection
  useEffect(() => {
    if (currentFormat === 'html') {
      setDisplayOutput(aiFormattedContent);
    } else {
      // Convert AI HTML output to Markdown
      const markdown = converter.makeMarkdown(aiFormattedContent);
      setDisplayOutput(markdown);
    }
  }, [aiFormattedContent, currentFormat]);

  // Handlers for toggle buttons
  const handleFormatToggle = (format: 'html' | 'markdown') => {
    setCurrentFormat(format);
    setCopyStatus(null); // Reset copy status on format change
  };

  // Handler for copy button
  const handleCopy = () => {
    navigator.clipboard.writeText(displayOutput)
      .then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus(null), 2000); // Clear status after 2s
      })
      .catch(err => {
        console.error('Failed to copy AI output:', err);
        setCopyStatus('Copy failed!');
         setTimeout(() => setCopyStatus(null), 2000);
      });
  };

  // --- Tailwind Styles --- 
  const buttonBase = "border-none py-2 px-4 rounded cursor-pointer text-sm flex items-center gap-1.25 disabled:opacity-50 disabled:cursor-not-allowed";
  const copyButtonStyle = "bg-gray-600 text-white hover:bg-gray-700 text-[0.8em] p-[5px_10px]";
  const toggleButtonBase = "py-1.5 px-3 border border-gray-300 cursor-pointer outline-none flex-1";
  const toggleButtonActive = "bg-blue-600 text-white border-blue-600";
  const toggleButtonInactive = "bg-gray-200 text-gray-800";
  const textareaStyle = "w-full h-full p-2.5 border border-gray-300 rounded resize-y font-[inherit] grow leading-[var(--fidelity-line-height)] tracking-[var(--fidelity-letter-spacing)] bg-gray-50";

  return (
    <div className="bg-white rounded-lg p-4 shadow-md h-auto flex flex-col">
      <h2 className="mt-0 mb-2 text-gray-800 text-lg flex justify-between items-center shrink-0 tracking-[var(--fidelity-header-letter-spacing)] w-full">
        <span>Display Options</span>
         <button onClick={handleCopy} id="copyButton2" className={`${buttonBase} ${copyButtonStyle}`}>
           {copyStatus || `Copy ${currentFormat === 'html' ? 'HTML' : 'Markdown'}`}
        </button>
      </h2>
      
      <div className="flex mb-2 shrink-0">
        <button 
          onClick={() => handleFormatToggle('html')}
          id="htmlToggle2" 
          className={`${toggleButtonBase} rounded-l ${currentFormat === 'html' ? toggleButtonActive : toggleButtonInactive}`}>
          Show HTML
        </button>
        <button 
          onClick={() => handleFormatToggle('markdown')}
          id="markdownToggle2" 
          className={`${toggleButtonBase} rounded-r ${currentFormat === 'markdown' ? toggleButtonActive : toggleButtonInactive}`}>
          Show Markdown
        </button>
      </div>
      
      {/* Raw text output */}
      <div className="relative grow flex flex-col p-0 m-0">
        <textarea 
          id="inputText2"
          readOnly 
          value={displayOutput} 
          placeholder="Formatted AI output will appear here..." 
          className={`${textareaStyle}`}>
        </textarea>
      </div>
    </div>
  );
};

export default AIDisplayOptionsBox; 