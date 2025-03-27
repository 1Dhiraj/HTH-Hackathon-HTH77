import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  FileText,
  User,
  LogOut,
  Trash2,
  BookOpen,
  Award,
  MessageCircle,
  Send,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState([]);
  
  // AI Tutor State
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorMessages, setTutorMessages] = useState([]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      alert("Please provide a project name");
      return;
    }
    if (!prompt.trim()) {
      alert("Please provide a description for the project");
      return;
    }

    // Navigate to CodeGenerator with the new project details
    navigate("/generate", { state: { initialPrompt: prompt, projectName } });
    setIsModalOpen(false);
    setProjectName("");
    setPrompt("");
  };

  const openExistingProject = (project) => {
    // Navigate to CodeGenerator with existing project details, including designHtml
    navigate("/generate", {
      state: {
        projectName: project.name,
        initialPrompt: project.prompt,
        code: project.code,
        designHtml: project.designHtml,
      },
    });
  };

  const handleDeleteProject = (projectId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      // Filter out the project to delete
      const updatedProjects = projects.filter(
        (project) => project.id !== projectId
      );
      setProjects(updatedProjects);
      // Update localStorage
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      alert("Project deleted successfully!");
    }
  };

  const handleTutorQuestion = async () => {
    if (!tutorQuestion.trim()) return;
  
    const newMessages = [
      ...tutorMessages, 
      { role: 'user', content: tutorQuestion }
    ];
    setTutorMessages(newMessages);
    setTutorQuestion("");
    setIsTutorLoading(true);
  
    try {
      const response = await fetch('http://localhost:8000/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: tutorQuestion,
          context: 'web development learning' 
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.status === 'success') {
        setTutorMessages(prev => [
          ...prev, 
          { role: 'ai', content: data.response }
        ]);
      } else {
        console.error('AI Tutor Error:', data.message);
        setTutorMessages(prev => [
          ...prev, 
          { 
            role: 'ai', 
            content: `Error: ${data.message || 'Sorry, I encountered an error. Please try again.'}` 
          }
        ]);
      }
    } catch (error) {
      console.error('Tutor Request Error:', error);
      setTutorMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: `Error: ${error.message || 'Network or server error. Please check your connection and try again.'}` 
        }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F3460] border-r border-[#0F3460] flex flex-col shadow-2xl">
        <div className="p-6 bg-gradient-to-r from-[#E94560] to-[#6A0572] flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider">AI CodeCraft</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-white hover:bg-[#E94560]/20 rounded-lg transition-all group"
          >
            <FileText className="w-5 h-5 mr-3 text-[#E94560] group-hover:scale-110 transition-transform" />
            Home
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#E94560]/20 rounded-lg text-left transition-all group"
          >
            <Plus className="w-5 h-5 mr-3 text-[#E94560] group-hover:scale-110 transition-transform" />
            Create New Project
          </button>
          <button
            onClick={() => setIsTutorModalOpen(true)}
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#E94560]/20 rounded-lg text-left transition-all group"
          >
            <MessageCircle className="w-5 h-5 mr-3 text-green-500 group-hover:scale-110 transition-transform" />
            AI Tutor
          </button>
          <Link
            to="/challenge"
            className="flex items-center px-4 py-3 text-white hover:bg-[#E94560]/20 rounded-lg group"
          >
            <Award className="w-5 h-5 mr-3 text-yellow-500 group-hover:scale-110 transition-transform" />
            Web Dev Challenge
          </Link>
          <Link
            to="/documentation"
            className="flex items-center px-4 py-3 text-white hover:bg-[#E94560]/20 rounded-lg group"
          >
            <BookOpen className="w-5 h-5 mr-3 text-purple-500 group-hover:scale-110 transition-transform" />
            Documentation
          </Link>
        </nav>
        <div className="p-4 border-t border-[#E94560]/20">
          <button className="w-full flex items-center px-4 py-3 text-white hover:bg-[#E94560]/20 rounded-lg group">
            <User className="w-5 h-5 mr-3 text-green-500 group-hover:scale-110 transition-transform" />
            Profile
          </button>
          <button className="w-full flex items-center px-4 py-3 text-white hover:bg-[#E94560]/20 rounded-lg group">
            <LogOut className="w-5 h-5 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Rest of the existing Home component code remains the same... */}

      {/* AI Tutor Modal */}
      {isTutorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#16213E] rounded-2xl p-8 w-full max-w-2xl h-[80vh] flex flex-col border-4 border-[#E94560] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                Web Development AI Tutor
              </h2>
              <button 
                onClick={() => setIsTutorModalOpen(false)}
                className="text-white hover:text-[#E94560] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-[#0F3460] rounded-lg">
              {tutorMessages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${
                    message.role === 'user' 
                      ? 'justify-end' 
                      : 'justify-start'
                  }`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-[#E94560] text-white' 
                        : 'bg-[#16213E] border border-[#E94560]/30'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isTutorLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#16213E] border border-[#E94560]/30 p-3 rounded-lg">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Question Input Area */}
            <div className="flex space-x-2">
              <input 
                type="text"
                value={tutorQuestion}
                onChange={(e) => setTutorQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTutorQuestion()}
                placeholder="Ask a web development question..."
                className="flex-1 px-4 py-3 bg-[#0F3460] border border-[#E94560]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E94560]"
              />
              <button 
                onClick={handleTutorQuestion}
                disabled={isTutorLoading}
                className="bg-[#E94560] text-white p-3 rounded-lg hover:bg-[#FF6B9E] transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#0F3460] p-4 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E94560]" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-[#16213E] border border-[#E94560]/30 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#E94560]"
            />
          </div>
          <button className="ml-4 hover:bg-[#E94560]/20 p-2 rounded-full transition-all">
            <User className="w-6 h-6 text-white" />
          </button>
        </header>

        {/* Main Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Feature Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Create Project Box */}
              <div className="bg-[#16213E] rounded-2xl p-6 transform hover:scale-105 hover:shadow-2xl transition-all group">
                <div className="flex justify-center mb-4">
                  <div className="bg-[#E94560]/20 p-3 rounded-full group-hover:rotate-180 transition-transform">
                    <Plus className="w-8 h-8 text-[#E94560]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2 text-white">
                  Create New Project
                </h3>
                <p className="text-gray-400 text-center mb-4">
                  Start a new web development project with AI assistance
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-[#E94560] to-[#6A0572] text-white rounded-full hover:from-[#FF6B9E] hover:to-[#8A0B9E] transition-all"
                >
                  Get Started
                </button>
              </div>

              {/* Challenge Box */}
              <div className="bg-[#16213E] rounded-2xl p-6 transform hover:scale-105 hover:shadow-2xl transition-all group">
                <div className="flex justify-center mb-4">
                  <div className="bg-yellow-500/20 p-3 rounded-full group-hover:rotate-180 transition-transform">
                    <Award className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2 text-white">
                  Web Dev Challenge
                </h3>
                <p className="text-gray-400 text-center mb-4">
                  Test your web development knowledge with interactive challenges
                </p>
                <Link
                  to="/challenge"
                  className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-center hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Take Challenge
                </Link>
              </div>

              {/* Documentation Box */}
              <div className="bg-[#16213E] rounded-2xl p-6 transform hover:scale-105 hover:shadow-2xl transition-all group">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-full group-hover:rotate-180 transition-transform">
                    <BookOpen className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2 text-white">
                  Project Documentation
                </h3>
                <p className="text-gray-400 text-center mb-4">
                  Generate detailed documentation for your web projects
                </p>
                <Link
                  to="/documentation"
                  className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-center hover:from-purple-700 hover:to-pink-600 transition-all"
                >
                  Create Documentation
                </Link>
              </div>
            </div>

            {/* Existing Projects Section */}
            <h2 className="text-2xl font-bold mb-6 text-white">
              Existing Projects
            </h2>
            {projects.length === 0 ? (
              <p className="text-gray-400">
                No projects yet. Create one to get started!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-[#16213E] rounded-2xl p-4 relative group hover:scale-105 transition-all hover:shadow-2xl"
                  >
                    <button
                      onClick={() => openExistingProject(project)}
                      className="w-full text-left"
                    >
                      <div className="h-32 bg-gradient-to-br from-[#0F3460] to-[#E94560]/30 rounded-xl mb-4 opacity-80 group-hover:opacity-100 transition-all"></div>
                      <h3 className="text-lg font-medium text-white">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Last edited: {project.lastEdited}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-500/20 rounded-full transition-all"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#16213E] rounded-2xl p-8 w-full max-w-md border-4 border-[#E94560] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Create New Project
            </h2>

            {/* Project Name Input */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-300 mb-2"
                htmlFor="project-name"
              >
                Project Name
              </label>
              <input
                type="text"
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., My Portfolio Website"
                className="w-full px-4 py-3 bg-[#0F3460] border border-[#E94560]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E94560]"
              />
            </div>

            {/* Prompt Textarea */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-300 mb-2"
                htmlFor="prompt"
              >
                Project Description
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your project (e.g., 'A portfolio website with a navbar, hero section, and footer')"
                className="w-full h-32 px-4 py-3 bg-[#0F3460] border border-[#E94560]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E94560] resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleCreateProject}
                className="flex-1 py-3 bg-gradient-to-r from-[#E94560] to-[#6A0572] text-white rounded-full hover:from-[#FF6B9E] hover:to-[#8A0B9E] transition-all"
              >
                Create Project
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-[#0F3460] border border-[#E94560] text-white rounded-full hover:bg-[#E94560]/20 transition-all"
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