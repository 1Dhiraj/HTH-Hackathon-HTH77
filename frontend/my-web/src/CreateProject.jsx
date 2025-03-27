import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      alert('Please provide a project name');
      return;
    }
    if (!prompt.trim()) {
      alert('Please provide a description for the project');
      return;
    }

    // Navigate to the CodeGenerator with the prompt
    navigate('/generate', { state: { initialPrompt: prompt, projectName } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Project</h2>

        {/* Project Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="project-name">
            Project Name
          </label>
          <input
            type="text"
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., My Portfolio Website"
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Prompt Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="prompt">
            Project Description
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your project (e.g., 'A portfolio website with a navbar, hero section, and footer')"
            className="w-full h-32 px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Create Button */}
        <div className="flex space-x-4">
          <button
            onClick={handleCreateProject}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;