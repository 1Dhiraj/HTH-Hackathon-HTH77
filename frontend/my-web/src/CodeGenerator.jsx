import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InteractivePreview from './InteractivePreview';

const CodeGenerator = () => {
  const location = useLocation();
  const [projectName, setProjectName] = useState(location.state?.projectName || 'Untitled Project');
  const [prompt, setPrompt] = useState('');
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState({
    html: '',
    css: '',
    javascript: '',
    combined: ''
  });
  const [currentTab, setCurrentTab] = useState('combined');
  const [isLoading, setIsLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [uploadedImages, setUploadedImages] = useState({});

  useEffect(() => {
    checkServerStatus();
    const savedProject = location.state;
    if (savedProject) {
      setProjectName(savedProject.projectName || 'Untitled Project');
      setPrompt(savedProject.initialPrompt || '');
      if (savedProject.code) {
        setGeneratedCode(savedProject.code); // Load saved code
      } else if (savedProject.initialPrompt) {
        handleInitialGeneration(savedProject.initialPrompt); // Generate if no code exists
      }
    }
  }, [location.state]);
  
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      if (response.ok) {
        setServerStatus('connected');
        setError('');
      } else {
        setServerStatus('error');
        setError('Server is running but returned an error');
      }
    } catch (err) {
      setServerStatus('disconnected');
      setError('Cannot connect to server. Please ensure the backend is running on port 8000');
      console.error('Server connection error:', err);
    }
  };

  const handleInitialGeneration = async (promptText = prompt) => {
    if (!promptText.trim()) {
      setError('Please provide a description or upload an image');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          type: 'web',
          framework: 'vanilla'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.code) {
        setGeneratedCode(data.code);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      setError(`Failed to generate code: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setUploadedImages(prev => ({
        ...prev,
        [file.name]: base64String
      }));
      setPrompt(`Add an image with src="${file.name}"`);
      handleInitialGeneration(`Add an image with src="${file.name}"`);
    };
    reader.onerror = () => {
      setError('Failed to read the image file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleModification = async () => {
    if (!modificationPrompt.trim()) {
      setError('Please provide modification instructions');
      return;
    }

    setIsModifying(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/modify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: modificationPrompt,
          existingCode: {
            html: generatedCode.html,
            css: generatedCode.css,
            javascript: generatedCode.javascript
          },
          type: 'web',
          framework: 'vanilla',
          modificationType: 'update'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.code) {
        setGeneratedCode(data.code);
        setModificationPrompt('');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error modifying code:', error);
      setError(`Failed to modify code: ${error.message}`);
    } finally {
      setIsModifying(false);
    }
  };

  const handlePreviewGeneration = async (previewContent) => {
    let updatedHtml = previewContent.html;
    Object.keys(uploadedImages).forEach(fileName => {
      const base64String = uploadedImages[fileName];
      updatedHtml = updatedHtml.replace(new RegExp(`"${fileName}"`, 'g'), `"${base64String}"`);
    });

    setGeneratedCode({
      ...previewContent,
      html: updatedHtml,
      combined: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${previewContent.css}</style>
  </head>
  <body>
    ${updatedHtml}
    <script>${previewContent.javascript}</script>
  </body>
</html>`
    });
  };

  const handleSaveProject = () => {
    if (!projectName || !prompt || !generatedCode.combined) {
      alert('Please ensure project name, prompt, and generated code are available before saving.');
      return;
    }

    const newProject = {
      id: Date.now(), // Simple unique ID using timestamp
      name: projectName,
      prompt: prompt,
      code: generatedCode,
      lastEdited: new Date().toLocaleDateString()
    };

    // Load existing projects from localStorage
    const savedProjects = localStorage.getItem('projects');
    const projects = savedProjects ? JSON.parse(savedProjects) : [];

    // Check if project with the same name exists, update it if so
    const existingProjectIndex = projects.findIndex(p => p.name === projectName);
    if (existingProjectIndex !== -1) {
      projects[existingProjectIndex] = newProject;
    } else {
      projects.push(newProject);
    }

    // Save back to localStorage
    localStorage.setItem('projects', JSON.stringify(projects));
    alert('Project saved successfully!');
  };

  return (
    <div className="flex flex-col m-0 p-0">
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{projectName}</h2>
            <button
              onClick={handleSaveProject}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save Project
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Design Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload screenshot/mockup (PNG, JPG)
              </p>
            </div>

            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                className="w-full h-32 p-4 border rounded-lg resize-none"
              />
              <button
                onClick={() => handleInitialGeneration()}
                disabled={isLoading}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Generating...' : 'Generate Code'}
              </button>
            </div>

            {generatedCode.combined && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Modify Existing Code</h3>
                <textarea
                  value={modificationPrompt}
                  onChange={(e) => setModificationPrompt(e.target.value)}
                  placeholder="Describe your modifications (e.g., 'Change the button color to blue')"
                  className="w-full h-24 p-4 border rounded-lg resize-none"
                />
                <button
                  onClick={handleModification}
                  disabled={isModifying}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isModifying ? 'Modifying...' : 'Apply Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {generatedCode.combined && (
        <div className="flex flex-col">
          <div className="w-full bg-white p-6 border-b">
            <h2 className="text-2xl font-semibold mb-4">Generated Code</h2>
            <div className="flex space-x-4 mb-4 overflow-x-auto">
              {['combined', 'html', 'css', 'javascript'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    currentTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <textarea
              value={generatedCode[currentTab]}
              onChange={(e) => {
                const newValue = e.target.value;
                setGeneratedCode(prev => ({
                  ...prev,
                  [currentTab]: newValue,
                  combined: currentTab === 'combined' ? newValue : `
                  <!DOCTYPE html>
                  <html>
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                      ${prev.css}
                      </style>
                  </head>
                  <body>
                      ${prev.html}
                      <script>
                      ${prev.javascript}
                      </script>
                  </body>
                  </html>`
                }));
              }}
              className="w-full h-96 p-4 font-mono text-sm bg-white border rounded-lg"
            />
          </div>

          <div className="w-full bg-gray-50 h-screen">
            <InteractivePreview 
              htmlContent={generatedCode.combined} 
              onGenerateCode={handlePreviewGeneration}
              uploadedImages={uploadedImages}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;
