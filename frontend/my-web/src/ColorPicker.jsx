import React,{ useState } from "react";

const ColorPicker = ({ onColorChange }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeProperty, setActiveProperty] = useState(null);

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setActiveProperty('backgroundColor');
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Background Color"
        >
          <div className="w-5 h-5 bg-current" />
        </button>
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setActiveProperty('color');
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Text Color"
        >
          <div className="w-5 h-5 border border-current" />
        </button>
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setActiveProperty('borderColor');
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Border Color"
        >
          <div className="w-5 h-5 border-2 border-current" />
        </button>
      </div>

      {showColorPicker && (
        <div className="absolute top-full mt-2 p-2 bg-white shadow-lg rounded-lg z-50">
          <input
            type="color"
            onChange={(e) => onColorChange(activeProperty, e.target.value)}
            value="#000000"
            className="w-32 h-10"
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker