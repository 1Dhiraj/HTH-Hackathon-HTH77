import React, { useState } from "react";

const ContextMenu = ({ x, y, onClose, onPropertyChange }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

  const properties = [
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'fontSize', 'borderWidth', 'opacity', 'padding',
    'backgroundColor', 'color', 'borderColor'
  ];

  const handlePaddingChange = (side, value) => {
    const newPadding = { ...padding, [side]: parseInt(value) || 0 };
    setPadding(newPadding);
    onPropertyChange('padding', newPadding);
  };

  const handleValueChange = (property, value) => {
    if (property === 'opacity') {
      onPropertyChange(property, Math.min(1, Math.max(0, parseFloat(value) || 0)).toString());
    } else if (['backgroundColor', 'color', 'borderColor'].includes(property)) {
      onPropertyChange(property, value);
    } else if (property !== 'padding') {
      onPropertyChange(property, value ? `${value}px` : '0px');
    }
  };

  return (
    <div 
      className="absolute bg-[#1A2A44] shadow-lg rounded-lg p-2 z-50 border border-[#4A6FA5]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {!selectedProperty ? (
        <ul className="min-w-[150px]">
          {properties.map(prop => (
            <li 
              key={prop}
              className="px-2 py-1 text-white hover:bg-[#4A6FA5] cursor-pointer transition-colors"
              onClick={() => setSelectedProperty(prop)}
            >
              {prop.replace(/([A-Z])/g, ' $1').trim()}
            </li>
          ))}
        </ul>
      ) : selectedProperty === 'padding' ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#D4AF37]">Padding</span>
            <button 
              onClick={() => setSelectedProperty(null)}
              className="text-sm text-[#F5F6F5] hover:text-[#D4AF37] transition-colors"
            >
              Back
            </button>
          </div>
          {['top', 'right', 'bottom', 'left'].map((side) => (
            <div key={side} className="flex items-center gap-2">
              <label className="text-sm text-white">
                {side.charAt(0).toUpperCase() + side.slice(1)}
              </label>
              <input
                type="number"
                value={padding[side]}
                onChange={(e) => handlePaddingChange(side, e.target.value)}
                className="w-16 p-1 bg-[#2E4A77] text-white border border-[#4A6FA5] rounded focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                min="0"
              />
            </div>
          ))}
        </div>
      ) : ['backgroundColor', 'color', 'borderColor'].includes(selectedProperty) ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#D4AF37]">{selectedProperty.replace(/([A-Z])/g, ' $1').trim()}</span>
            <button 
              onClick={() => setSelectedProperty(null)}
              className="text-sm text-[#F5F6F5] hover:text-[#D4AF37] transition-colors"
            >
              Back
            </button>
          </div>
          <input
            type="color"
            onChange={(e) => handleValueChange(selectedProperty, e.target.value)}
            value="#000000"
            className="w-full h-10 bg-[#2E4A77] border border-[#4A6FA5] rounded"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#D4AF37]">{selectedProperty.replace(/([A-Z])/g, ' $1').trim()}</span>
            <button 
              onClick={() => setSelectedProperty(null)}
              className="text-sm text-[#F5F6F5] hover:text-[#D4AF37] transition-colors"
            >
              Back
            </button>
          </div>
          <input
            type="number"
            className="w-full p-1 bg-[#2E4A77] text-white border border-[#4A6FA5] rounded focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            onChange={(e) => handleValueChange(selectedProperty, e.target.value)}
            placeholder={selectedProperty === 'opacity' ? "0-1" : "Value in px"}
            step={selectedProperty === 'opacity' ? 0.1 : 1}
            min={selectedProperty === 'opacity' ? 0 : undefined}
            max={selectedProperty === 'opacity' ? 1 : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default ContextMenu;