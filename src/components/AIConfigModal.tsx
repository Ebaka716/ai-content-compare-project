'use client';

import React, { useState, useEffect } from 'react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConfigModal = ({ isOpen, onClose }: AIConfigModalProps) => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [aiModel, setAiModel] = useState('gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(0.7);
  const [apiKey, setApiKey] = useState(''); // Only used for input, not displayed
  const [apiKeyExists, setApiKeyExists] = useState(false); // Indicate if key is saved

  // Load settings from localStorage on mount
  useEffect(() => {
    if (isOpen) { // Only load when modal becomes visible
      const savedPrompt = localStorage.getItem('ai_system_prompt');
      const savedModel = localStorage.getItem('ai_model');
      const savedTemp = localStorage.getItem('ai_temperature');
      const savedApiKey = localStorage.getItem('openai_api_key');

      setSystemPrompt(savedPrompt || "You are a helpful assistant that formats text into clear, structured content. Create organized sections with headings, bullet points, and numbered lists as appropriate.");
      setAiModel(savedModel || 'gpt-3.5-turbo');
      setTemperature(savedTemp ? parseFloat(savedTemp) : 0.7);
      setApiKeyExists(!!savedApiKey); // Check if key exists
      setApiKey(''); // Clear the input field regardless
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('ai_system_prompt', systemPrompt);
    localStorage.setItem('ai_model', aiModel);
    localStorage.setItem('ai_temperature', temperature.toString());
    if (apiKey) { // Only save if a new key was entered
      localStorage.setItem('openai_api_key', apiKey);
    }
    console.log('AI Config saved:', { systemPrompt, aiModel, temperature });
    onClose(); // Close modal after saving
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] z-[1000] flex justify-center items-center">
      <div className="modal-content bg-white p-[30px] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] w-[450px] max-w-[90%]">
        <div className="modal-header flex justify-between items-center mb-5">
          <h3 className="modal-title text-[1.2em] font-bold m-0">AI Configuration</h3>
          <button onClick={onClose} className="modal-close cursor-pointer text-[1.5em] leading-none bg-transparent border-none text-[#999]">
            &times;
          </button>
        </div>
        <div className="p-4">
          {/* System Prompt */}
          <div className="mb-4">
            <label htmlFor="systemPrompt" className="block mb-1.5 font-medium">System Prompt</label>
            <textarea 
              id="systemPrompt" 
              rows={5} 
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-2 border rounded border-[#ccc]"
              placeholder="Enter instructions for the AI..."
            ></textarea>
          </div>
          {/* AI Model */}
          <div className="mb-4">
            <label htmlFor="aiModel" className="block mb-1.5 font-medium">AI Model</label>
            <select 
              id="aiModel" 
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full p-2 border rounded border-[#ccc] bg-white"
            >
              <option value="gpt-4">GPT-4 (High quality, more expensive)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, less expensive)</option>
               {/* Add other models as needed */}
            </select>
          </div>
          {/* Temperature */}
          <div className="mb-4">
            <label htmlFor="temperature" className="block mb-1.5 font-medium">Temperature: <span className="font-normal">{temperature.toFixed(1)}</span></label>
            <input 
              type="range" 
              id="temperature" 
              min="0" max="1" step="0.1" 
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[#666]">
              <span>More focused</span>
              <span>More creative</span>
            </div>
          </div>
          {/* API Key */}
          <div className="mb-4">
            <label htmlFor="apiKey" className="block mb-1.5 font-medium">OpenAI API Key</label>
            <input 
              type="password" 
              id="apiKey"
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border rounded border-[#ccc]"
              placeholder={apiKeyExists ? '••••••••••••••••••••••••••••••' : 'sk-...'} 
            />
            <div className="text-xs text-[#666] mt-1">
              Your API key is stored locally in your browser's localStorage.
            </div>
          </div>
        </div>
        <div className="modal-actions flex justify-end gap-2.5 mt-2">
          <button onClick={onClose} className="modal-button modal-button-cancel py-2 px-4 rounded cursor-pointer font-[inherit] text-sm border-none bg-[#f2f2f2] text-[#333]">
            Cancel
          </button>
          <button onClick={handleSave} className="modal-button modal-button-proceed py-2 px-4 rounded cursor-pointer font-[inherit] text-sm border-none bg-[#28a745] text-white">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfigModal; 