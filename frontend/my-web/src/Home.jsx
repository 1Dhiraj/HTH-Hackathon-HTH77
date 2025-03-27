import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, User, LogOut, Trash2 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState([]);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      alert('Please provide a project name');
      return;
    }
    if (!prompt.trim()) {
      alert('Please provide a description for the project');
      return;
    }

    // Navigate to CodeGenerator with the new project details
    navigate('/generate', { state: { initialPrompt: prompt, projectName } });
    setIsModalOpen(false);
    setProjectName('');
    setPrompt('');
  };

  const openExistingProject = (project) => {
    // Navigate to CodeGenerator with existing project details, including designHtml
    navigate('/generate', {
      state: {
        projectName: project.name,
        initialPrompt: project.prompt,
        code: project.code, // Pass the saved code
        designHtml: project.designHtml // Pass the saved design HTML if available
      }
    });
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      // Filter out the project to delete
      const updatedProjects = projects.filter(project => project.id !== projectId);
      setProjects(updatedProjects);
      // Update localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      alert('Project deleted successfully!');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">AI Code Generator</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link
            to="/"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <FileText className="w-5 h-5 mr-2" />
            Home
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Project
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md w-full">
            <User className="w-5 h-5 mr-2" />
            Profile
          </button>
          <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md w-full">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-800">
              <User className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Create New Project Button */}
            <div className="mb-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Project
              </button>
            </div>

            {/* Existing Projects Section */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Existing Projects</h2>
            {projects.length === 0 ? (
              <p className="text-gray-500">No projects yet. Create one to get started!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <button
                      onClick={() => openExistingProject(project)}
                      className="w-full text-left"
                    >
                      <div className="h-32 bg-gray-100 rounded-md mb-4"></div>
                      <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                      <p className="text-sm text-gray-500">Last edited: {project.lastEdited}</p>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800"
                      title="Delete Project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create New Project Modal */}
      {isModalOpen && (
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

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleCreateProject}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
