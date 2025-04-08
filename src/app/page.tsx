'use client'; // Mark this page as a Client Component

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic

// Dynamically import components that use browser APIs
const ContentEditorBox = dynamic(() => import('@/components/ContentEditorBox'), { ssr: false });
const CardPreviewBox = dynamic(() => import('@/components/CardPreviewBox'), { ssr: false });
const AIContentEditorBox = dynamic(() => import('@/components/AIContentEditorBox'), { ssr: false });
const AIDisplayOptionsBox = dynamic(() => import('@/components/AIDisplayOptionsBox'), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
const AIConfigModal = dynamic(() => import('@/components/AIConfigModal'), { ssr: false });

export default function Home() {
  // State for Tab One
  const [editorContent, setEditorContent] = useState<string>("<p>Start typing or paste your content here.</p><p>Use the formatting tools above to style your text.</p>");
  
  // State for Tab Two
  const [aiEditorContent, setAiEditorContent] = useState<string>("<p>Content for AI formatting.</p>"); // Content before AI processing
  const [aiFormattedContent, setAiFormattedContent] = useState<string>(""); // Content after AI processing
  
  const [activeView, setActiveView] = useState('tab-one');
  const [isFormatting, setIsFormatting] = useState(false); // State for loading indicator
  const [formatError, setFormatError] = useState<string | null>(null); // State for error message

  // State and handlers for AI Config Modal
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);
  
  // State to hold loaded AI config (optional, could read directly in handler)
  const [aiConfig, setAiConfig] = useState({ model: '', temperature: 0.7, systemPrompt: '' });

  // Load AI config from localStorage on initial mount (client-side)
  useEffect(() => {
    const model = localStorage.getItem('ai_model') || 'gpt-3.5-turbo';
    const temp = parseFloat(localStorage.getItem('ai_temperature') || '0.7');
    const prompt = localStorage.getItem('ai_system_prompt') || ''; // Let API use default if empty
    setAiConfig({ model, temperature: temp, systemPrompt: prompt });
  }, []);

  const openAiConfigModal = () => setIsAiConfigModalOpen(true);
  // Refresh config state after modal closes (optional, alternative to event/callback)
  const closeAiConfigModal = () => {
    setIsAiConfigModalOpen(false);
    // Re-read from localStorage in case changes were saved
    const model = localStorage.getItem('ai_model') || 'gpt-3.5-turbo';
    const temp = parseFloat(localStorage.getItem('ai_temperature') || '0.7');
    const prompt = localStorage.getItem('ai_system_prompt') || '';
    setAiConfig({ model, temperature: temp, systemPrompt: prompt });
  };

  // Handler to call the backend API for AI formatting
  const handleAiFormatRequest = async () => {
    setIsFormatting(true); // Start loading
    setFormatError(null); // Clear previous errors
    console.log("Requesting AI format with config:", aiConfig);

    // Read current config from localStorage directly or use state
    // Reading directly ensures latest values if modal save doesn't update parent state
    const currentModel = localStorage.getItem('ai_model') || 'gpt-3.5-turbo';
    const currentTemp = parseFloat(localStorage.getItem('ai_temperature') || '0.7');
    const currentPrompt = localStorage.getItem('ai_system_prompt') || undefined; // Send undefined if empty to let API use default

    try {
      const response = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            content: aiEditorContent,
            // Pass the retrieved config settings
            model: currentModel,
            temperature: currentTemp,
            systemPrompt: currentPrompt 
         }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Formatting request failed');
      }

      const data = await response.json();
      setAiFormattedContent(data.formattedContent); // Update state with formatted content

    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred during formatting.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("AI Formatting Error:", errorMessage);
      setFormatError(errorMessage);
      setAiFormattedContent("");
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 min-h-0">
        <Sidebar 
          activeView={activeView} 
          onSwitchView={setActiveView} 
        />
        <main className="flex-1 overflow-y-auto p-5 bg-[#f5f5f5]">
          {/* TODO: Display formatError globally? */}
          {formatError && <div className="text-red-600 bg-red-100 p-2 rounded mb-4">Error: {formatError}</div>}
          
          {activeView === 'tab-one' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
              <ContentEditorBox 
                initialContent={editorContent} 
                onContentChange={setEditorContent} 
              />
              <CardPreviewBox content={editorContent} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
              <AIContentEditorBox 
                initialContent={aiEditorContent}
                onContentChange={setAiEditorContent}
                onAiFormat={handleAiFormatRequest}
                isFormatting={isFormatting}
                onAiConfigOpen={openAiConfigModal}
              />
              <AIDisplayOptionsBox 
                aiFormattedContent={aiFormattedContent} 
              />
            </div>
          )}
        </main>
      </div>
      
      <AIConfigModal 
        isOpen={isAiConfigModalOpen} 
        onClose={closeAiConfigModal} 
      />
    </div>
  );
}
