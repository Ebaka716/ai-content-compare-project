'use client'; 

import React, { useState } from 'react';

interface SidebarProps {
  activeView: string;
  onSwitchView: (view: string) => void;
}

const Sidebar = ({ activeView, onSwitchView }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => setIsCollapsed(!isCollapsed);
  const handleSwitchView = (view: string) => onSwitchView(view);

  // Define base and active styles using Tailwind classes
  const navItemBaseClass = "nav-item cursor-pointer text-sm border-l-4 transition-all duration-200 ease-in-out hover:bg-white/10";
  const navItemCollapsedClass = "text-center py-3 px-0";
  const navItemExpandedClass = "py-3 px-5 border-l-transparent";
  const navItemActiveClass = "border-l-purple-600 bg-white/10 font-bold";
  const navItemInactiveClass = "border-l-transparent";
  
  const iconBaseClass = "nav-item-icon opacity-80 inline-block align-middle";
  const iconCollapsedClass = "mr-0";
  const iconExpandedClass = "mr-2.5";

  const textBaseClass = "nav-item-text transition-opacity duration-200 ease-in-out inline-block align-middle";
  const textCollapsedClass = "hidden";
  const textExpandedClass = "";

  return (
    <div 
      className={`nav-sidebar bg-slate-800 text-white py-5 px-0 overflow-y-auto shrink-0 transition-[width] duration-300 ease-in-out relative ${isCollapsed ? 'w-12' : 'w-56'}`}
    >
      <button 
        onClick={handleToggle}
        className={`sidebar-toggle relative bg-white/10 border-none text-white w-[30px] h-[30px] rounded flex items-center justify-center cursor-pointer p-0 text-sm z-10 hover:bg-white/20 ${isCollapsed ? 'mx-auto mb-5' : 'ml-auto mr-5 mb-5'}`}
        id="sidebarToggle"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {/* Toggle Icon */} 
        {isCollapsed ? (
          <svg className="sidebar-toggle-icon text-base" /* ... */ >
             <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        ) : (
          <svg className="sidebar-toggle-icon text-base" /* ... */ >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        )}
      </button>
      
      {/* Content Editor Nav Item */}
      <div 
        onClick={() => handleSwitchView('tab-one')}
        className={`${navItemBaseClass} ${isCollapsed ? navItemCollapsedClass : navItemExpandedClass} ${activeView === 'tab-one' ? navItemActiveClass : navItemInactiveClass}`}
        data-view="tab-one"
      >
        <span className={`${iconBaseClass} ${isCollapsed ? iconCollapsedClass : iconExpandedClass}`}>
          ✏️
        </span>
        <span className={`${textBaseClass} ${isCollapsed ? textCollapsedClass : textExpandedClass}`}>Content Editor</span>
      </div>
      
      {/* AI Format Nav Item */}
      <div 
        onClick={() => handleSwitchView('tab-two')}
        className={`${navItemBaseClass} ${isCollapsed ? navItemCollapsedClass : navItemExpandedClass} ${activeView === 'tab-two' ? navItemActiveClass : navItemInactiveClass}`}
        data-view="tab-two"
      >
        <span className={`${iconBaseClass} ${isCollapsed ? iconCollapsedClass : iconExpandedClass}`}>🤖</span>
        <span className={`${textBaseClass} ${isCollapsed ? textCollapsedClass : textExpandedClass}`}>AI Format</span>
      </div>
    </div>
  );
};

export default Sidebar;
