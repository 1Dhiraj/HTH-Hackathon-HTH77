import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InteractivePreview from "./InteractivePreview";
import { BookOpen, Eye } from "lucide-react";

const CodeGenerator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState(
    location.state?.projectName || "Untitled Project"
  );
  const [prompt, setPrompt] = useState("");
  const [modificationPrompt, setModificationPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState({
    html: "",
    css: "",
    javascript: "",
    combined: "",
  });
  const [currentTab, setCurrentTab] = useState("combined");
  const [isLoading, setIsLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("checking");
  const [uploadedImages, setUploadedImages] = useState({});
  const [isLivePreview, setIsLivePreview] = useState(false); // State for live preview toggle
  const previewRef = useRef(null); // Ref for the preview container

  useEffect(() => {
    checkServerStatus();
    const savedProject = location.state;
    if (savedProject) {
      setProjectName(savedProject.projectName || "Untitled Project");
      setPrompt(savedProject.initialPrompt || "");
      if (savedProject.code) {
        setGeneratedCode(savedProject.code);
      } else if (savedProject.initialPrompt) {
        handleInitialGeneration(savedProject.initialPrompt);
      }
    }
  }, [location.state]);

  const checkServerStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/");
      if (response.ok) {
        setServerStatus("connected");
        setError("");
      } else {
        setServerStatus("error");
        setError("Server is running but returned an error");
      }
    } catch (err) {
      setServerStatus("disconnected");
      setError(
        "Cannot connect to server. Please ensure the backend is running on port 8000"
      );
      console.error("Server connection error:", err);
    }
  };

  const handleInitialGeneration = async (promptText = prompt) => {
    if (!promptText.trim()) {
      setError("Please provide a description or upload an image");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          type: "web",
          framework: "vanilla",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            `Server returned ${response.status}: ${response.statusText}`
        );
      }
      const data = await response.json();
      if (data.code) setGeneratedCode(data.code);
      else throw new Error("Invalid response format from server");
    } catch (error) {
      console.error("Error generating code:", error);
      setError(`Failed to generate code: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("http://localhost:8000/analyze-image", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            `Server returned ${response.status}: ${response.statusText}`
        );
      }
      const data = await response.json();
      const { description, code } = data;
      if (
        !code.html.includes("<form") ||
        !code.html.includes("input") ||
        !code.html.includes("button")
      ) {
        console.warn("Backend did not generate a login form. Using fallback.");
        setGeneratedCode({
          html: `<div class="login-container">
    <form id="login-form">
        <h2>Login</h2>
        <div class="form-group">
            <label for="username">Username or Email</label>
            <input type="text" id="username" name="username" required aria-label="Username or Email">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required aria-label="Password">
        </div>
        <button type="submit">Login</button>
    </form>
</div>`,
          css: `body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
}
.login-container {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
}
.form-group {
    margin-bottom: 15px;
}
label {
    display: block;
    margin-bottom: 5px;
    font-size: 16px;
}
input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}
button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
}
button:hover {
    background-color: #0056b3;
}`,
          javascript: `document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) {
        alert('Please fill in both fields');
        return;
    }
    alert('Login successful!');
});`,
          combined: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Form</title>
    <style>
    body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
    }
    .login-container {
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
    }
    .form-group {
        margin-bottom: 15px;
    }
    label {
        display: block;
        margin-bottom: 5px;
        font-size: 16px;
    }
    input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    button {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
    }
    button:hover {
        background-color: #0056b3;
    }
    </style>
</head>
<body>
    <div class="login-container">
        <form id="login-form">
            <h2>Login</h2>
            <div class="form-group">
                <label for="username">Username or Email</label>
                <input type="text" id="username" name="username" required aria-label="Username or Email">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required aria-label="Password">
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
    <script>
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (!username || !password) {
            alert('Please fill in both fields');
            return;
        }
        alert('Login successful!');
    });
    </script>
</body>
</html>`,
        });
      } else {
        setGeneratedCode(code);
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setUploadedImages((prev) => ({
          ...prev,
          [file.name]: base64String,
        }));
        setPrompt(
          `Generate a login form based on the uploaded image: ${file.name}`
        );
      };
      reader.onerror = () => {
        setError("Failed to read the image file");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError(`Failed to analyze image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModification = async () => {
    if (!modificationPrompt.trim()) {
      setError("Please provide modification instructions");
      return;
    }
    setIsModifying(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/modify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: modificationPrompt,
          existingCode: {
            html: generatedCode.html,
            css: generatedCode.css,
            javascript: generatedCode.javascript,
          },
          type: "web",
          framework: "vanilla",
          modificationType: "update",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            `Server returned ${response.status}: ${response.statusText}`
        );
      }
      const data = await response.json();
      if (data.code) {
        setGeneratedCode(data.code);
        setModificationPrompt("");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error modifying code:", error);
      setError(`Failed to modify code: ${error.message}`);
    } finally {
      setIsModifying(false);
    }
  };

  const handlePreviewGeneration = async (previewContent) => {
    let updatedHtml = previewContent.html;
    Object.keys(uploadedImages).forEach((fileName) => {
      const base64String = uploadedImages[fileName];
      updatedHtml = updatedHtml.replace(
        new RegExp(`"${fileName}"`, "g"),
        `"${base64String}"`
      );
    });
    setGeneratedCode({
      ...previewContent,
      html: updatedHtml,
      combined: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${previewContent.css}</style>
  </head>
  <body>
    ${updatedHtml}
    <script>${previewContent.javascript}</script>
  </body>
</html>`,
    });
  };

  const handleSaveProject = () => {
    if (!projectName || !prompt || !generatedCode.combined) {
      alert(
        "Please ensure project name, prompt, and generated code are available before saving."
      );
      return;
    }
    const newProject = {
      id: Date.now(),
      name: projectName,
      prompt: prompt,
      code: generatedCode,
      lastEdited: new Date().toLocaleDateString(),
    };
    const savedProjects = localStorage.getItem("projects");
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    const existingProjectIndex = projects.findIndex(
      (p) => p.name === projectName
    );
    if (existingProjectIndex !== -1) {
      projects[existingProjectIndex] = newProject;
    } else {
      projects.push(newProject);
    }
    localStorage.setItem("projects", JSON.stringify(projects));
    alert("Project saved successfully!");
  };

  const handleCreateDocumentation = () => {
    navigate("/documentation", {
      state: { projectName, initialPrompt: prompt, code: generatedCode },
    });
  };

  const toggleFullScreenPreview = () => {
    if (!isLivePreview) {
      // Enter full-screen mode
      if (previewRef.current) {
        previewRef.current.requestFullscreen().then(() => {
          setIsLivePreview(true);
        }).catch((err) => {
          console.error("Failed to enter fullscreen:", err);
          setError("Failed to enter full-screen mode");
        });
      }
    } else {
      // Exit full-screen mode
      if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
          setIsLivePreview(false);
        }).catch((err) => {
          console.error("Failed to exit fullscreen:", err);
          setError("Failed to exit full-screen mode");
        });
      }
    }
  };

  // Listen for fullscreen changes to sync state
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsLivePreview(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] text-white">
      {/* Header Section */}
      <div className="bg-[#0F3460] p-6 border-b border-[#E94560]/20 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-wide text-white">
              {projectName}
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={handleSaveProject}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !generatedCode.html}
              >
                Save Project
              </button>
              <button
                onClick={handleCreateDocumentation}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full hover:from-purple-700 hover:to-pink-600 flex items-center transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !generatedCode.html}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Create Docs
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-[#16213E] p-6 rounded-2xl border border-[#E94560]/30 hover:shadow-xl transition-all">
              <h3 className="text-xl font-semibold mb-3 text-white">
                Upload Login Form Image
              </h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E94560]/20 file:text-[#E94560] hover:file:bg-[#E94560]/30 disabled:opacity-50"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-400">
                Upload a login form screenshot/mockup (PNG, JPG)
              </p>
            </div>

            <div className="bg-[#16213E] p-6 rounded-2xl border border-[#E94560]/30 hover:shadow-xl transition-all">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build (e.g., 'A login form with username and password fields')..."
                className="w-full h-32 p-4 bg-[#0F3460] border border-[#E94560]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E94560] resize-none"
              />
              <button
                onClick={() => handleInitialGeneration()}
                disabled={isLoading}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#E94560] to-[#6A0572] text-white rounded-full hover:from-[#FF6B9E] hover:to-[#8A0B9E] transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Generating..." : "Generate Code"}
              </button>
            </div>

            {generatedCode.combined && (
              <div className="bg-[#16213E] p-6 rounded-2xl border border-[#E94560]/30 hover:shadow-xl transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Modify Existing Code
                </h3>
                <textarea
                  value={modificationPrompt}
                  onChange={(e) => setModificationPrompt(e.target.value)}
                  placeholder="Describe your modifications (e.g., 'Change the button color to green')..."
                  className="w-full h-24 p-4 bg-[#0F3460] border border-[#E94560]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E94560] resize-none"
                />
                <button
                  onClick={handleModification}
                  disabled={isModifying}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isModifying ? "Modifying..." : "Apply Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Code and Preview Section */}
      {generatedCode.combined && (
        <div className="flex-1 flex flex-col">
          <div className="w-full bg-[#16213E] p-6 border-b border-[#E94560]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Generated Code</h2>
              <button
                onClick={toggleFullScreenPreview}
                className={`px-4 py-2 rounded-full flex items-center transform hover:scale-105 transition-all ${
                  isLivePreview
                    ? "bg-gradient-to-r from-[#E94560] to-[#6A0572] text-white"
                    : "bg-[#0F3460] text-gray-300 hover:bg-[#E94560]/20"
                }`}
              >
                <Eye className="w-5 h-5 mr-2" />
                {isLivePreview ? "Exit Full Screen" : "Full Screen Preview"}
              </button>
            </div>

            <div className="flex space-x-4 mb-6 overflow-x-auto">
              {["combined", "html", "css", "javascript"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transform hover:scale-105 transition-all ${
                    currentTab === tab
                      ? "bg-gradient-to-r from-[#E94560] to-[#6A0572] text-white"
                      : "bg-[#0F3460] text-gray-300 hover:bg-[#E94560]/20"
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
                setGeneratedCode((prev) => ({
                  ...prev,
                  [currentTab]: newValue,
                  combined:
                    currentTab === "combined"
                      ? newValue
                      : `
                    <!DOCTYPE html>
                    <html lang="en">
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
                    </html>`,
                }));
              }}
              className="w-full h-96 p-4 font-mono text-sm bg-[#0F3460] border border-[#E94560]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E94560]"
            />
          </div>

          {/* Preview Section */}
          <div
            ref={previewRef}
            className="w-full bg-[#1A1A2E] flex-1"
          >
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