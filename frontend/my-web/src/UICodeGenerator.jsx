import React from 'react'
import {
    Code,
  } from 'lucide-react';
const UICodeGenerator = ({ onGenerateCode }) => (
  <button
    onClick={onGenerateCode}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
               disabled:bg-gray-400 flex items-center gap-2"
  >
    <Code className="w-4 h-4" />
    Generate Code
  </button>
);
  
export default UICodeGenerator