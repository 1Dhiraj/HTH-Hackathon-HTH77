import React from 'react';
import PropTypes from 'prop-types';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  Trash2,
  Move,
  Type,
  Square,
  Image
} from 'lucide-react';

export default function ToolbarButton({ onClick, isActive, title, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded ${isActive ? 'bg-gray-200' : ''}`}
      title={title}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

ToolbarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};