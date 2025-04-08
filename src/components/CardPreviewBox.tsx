'use client'; // Needs state for the dropdown

import React, { useState } from 'react'; // Import useState

// Define props interface
interface CardPreviewBoxProps {
  content: string;
}

const CardPreviewBox = ({ content }: CardPreviewBoxProps) => {
  // Add state for selected card style
  const [selectedStyle, setSelectedStyle] = useState('with-intent');

  // Handler for dropdown change
  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(event.target.value);
  };

  // --- Tailwind Styles --- 
  const selectStyle = "appearance-none bg-gray-100 border border-gray-300 rounded py-1 px-3 text-sm cursor-pointer font-[inherit] w-full hover:bg-gray-200 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-blue-200";
  // Note: Custom arrow requires background image or alternative approach in Tailwind

  return (
    // Apply Tailwind classes
    <div className="bg-white rounded-lg p-4 shadow-md h-auto flex flex-col">
      <h2 className="mt-0 mb-2 text-gray-800 text-lg flex justify-between items-center shrink-0 tracking-[var(--fidelity-header-letter-spacing)] w-full">
        <span>Card Preview</span>
        <div className="flex items-center gap-2.5">
          <div className="ml-auto min-w-[140px] relative">
            <select 
              id="cardStyleSelector" 
              value={selectedStyle} 
              onChange={handleStyleChange} 
              className={selectStyle} // Apply Tailwind style
              // Custom arrow might need ::after pseudo-element or a wrapper div + SVG
            >
              <option value="text-only">Text Only</option>
              <option value="with-intent">With User Intent</option>
              <option value="with-pills">With Intent & Pills</option>
            </select>
             {/* Placeholder for custom dropdown arrow if needed */}
          </div>
        </div>
      </h2>
      {/* Preview container - Use Tailwind for background, padding */}
      <div className="flex-1 min-h-0 flex flex-col max-w-full overflow-hidden relative bg-gray-100 rounded p-5">
          {/* Card Preview Area - might need adjustments based on inner card */}
          <div className="flex justify-center items-start h-full box-border overflow-auto">
             {/* Inner Card - retains original classes for now */}
            <div 
              className={`card-preview w-[450px] p-6 rounded-xl border border-gray-300 bg-white shadow-sm m-auto box-border break-words font-[inherit] leading-[var(--fidelity-line-height)] tracking-[var(--fidelity-letter-spacing)] ${selectedStyle}`} 
              id="cardPreviewContent"
            >
               {selectedStyle !== 'text-only' && (
                 <div className="card-header flex justify-end items-center mb-4 pb-2">
                   <span className="return-icon mr-2 font-bold text-lg transform scale-x-[-1]">↩</span>
                   <span className="intent-label font-bold text-gray-800 tracking-[var(--fidelity-header-letter-spacing)]">User Intent</span>
                 </div>
               )}

              <div 
                className="card-content mt-4 font-[inherit] leading-[var(--fidelity-line-height)] tracking-[var(--fidelity-letter-spacing)]" 
                id="cardContentArea" 
                dangerouslySetInnerHTML={{ __html: content }}
              ></div>

              {selectedStyle === 'with-pills' && (
                <div className="card-pill-container flex gap-2 mt-6 flex-wrap">
                  {/* Pills retain original classes for now */}
                   <span className="card-pill inline-block py-1.5 px-3.5 bg-[#f0f0f0] rounded-[20px] text-[0.85em] text-[#555] border border-[#ddd] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#e0e0e0] hover:text-[#333]">Option 1</span>
                   <span className="card-pill card-pill-primary inline-block py-1.5 px-3.5 bg-[#e3f2fd] rounded-[20px] text-[0.85em] border cursor-pointer transition-all duration-200 ease-in-out border-[#90caf9] text-[#0d47a1] hover:bg-[#bbdefb] hover:text-[#0d47a1]">Option 2</span>
                   <span className="card-pill card-pill-secondary inline-block py-1.5 px-3.5 bg-[#f3e5f5] rounded-[20px] text-[0.85em] border cursor-pointer transition-all duration-200 ease-in-out border-[#ce93d8] text-[#7b1fa2] hover:bg-[#e1bee7] hover:text-[#7b1fa2]">Option 3</span>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreviewBox; 