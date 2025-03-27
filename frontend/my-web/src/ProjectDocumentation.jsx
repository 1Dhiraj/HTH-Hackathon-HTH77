import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, Download, Youtube } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Mock YouTube video links related to web development
const YOUTUBE_LINKS = [
  {
    title: "HTML Crash Course For Beginners",
    url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
  },
  {
    title: "CSS Crash Course For Beginners",
    url: "https://www.youtube.com/watch?v=yfoY53QXEnI",
  },
  {
    title: "JavaScript Crash Course For Beginners",
    url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
  },
  {
    title: "React JS Crash Course",
    url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
  },
  {
    title: "Responsive Web Design Tutorial",
    url: "https://www.youtube.com/watch?v=srvUrASNj0s",
  },
];

const ProjectDocumentation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    name: "Untitled Project",
    prompt: "",
    code: { html: "", css: "", javascript: "" },
    roadmap: [],
    explanation: "",
  });

  useEffect(() => {
    if (location.state) {
      const { projectName, initialPrompt, code } = location.state;
      setProjectDetails({
        name: projectName || "Untitled Project",
        prompt: initialPrompt || "",
        code: code || { html: "", css: "", javascript: "" },
        roadmap: generateRoadmap(initialPrompt),
        explanation: generateExplanation(code),
      });
    }
  }, [location.state]);

  const generateRoadmap = (prompt) => {
    // This would ideally come from the backend AI, but for now we'll generate a simple roadmap
    const roadmapSteps = [
      {
        title: "Project Setup",
        steps: [
          "Create project structure",
          "Initialize Git repository",
          "Set up development environment",
        ],
      },
      {
        title: "Design Phase",
        steps: [
          "Create wireframes",
          "Design UI/UX mockups",
          "Define color scheme and typography",
        ],
      },
      {
        title: "Development Phase",
        steps: [
          "Create HTML structure",
          "Implement CSS styling",
          "Add JavaScript functionality",
          "Test on different browsers and devices",
        ],
      },
      {
        title: "Testing & Deployment",
        steps: [
          "Perform functional testing",
          "Optimize performance",
          "Deploy to production",
          "Monitor for issues",
        ],
      },
    ];

    return roadmapSteps;
  };

  const generateExplanation = (code) => {
    // This would ideally come from the backend AI, but for now we'll generate a simple explanation
    if (!code || !code.html) return "No code available to explain.";

    return `This project implements a responsive web interface using modern HTML, CSS, and JavaScript. 
    
The HTML structure is organized semantically, with appropriate tags for accessibility and SEO. The layout uses both flexbox and grid for optimal positioning of elements.

The CSS implements a clean, modern design with a responsive approach. Media queries ensure the layout adapts to different screen sizes. The color scheme is consistent and accessible.

The JavaScript provides interactive functionality including form validation, dynamic content loading, and user interaction handling. Event listeners are properly managed and the code follows good practices for maintainability.`;
  };

  const exportToPdf = async () => {
    setIsGenerating(true);

    try {
      const documentElement = document.getElementById("project-documentation");
      if (!documentElement) {
        throw new Error("Documentation element not found");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Adjust scale for better quality
      const scale = 2;
      const options = {
        scale: scale,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      };

      // Function to capture and add a section to PDF
      const captureSection = async (sectionId) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const canvas = await html2canvas(section, options);
        const imgData = canvas.toDataURL("image/png");

        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add subsequent pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      };

      // Capture sections in order
      await captureSection("doc-header");
      pdf.addPage();
      await captureSection("doc-description");
      pdf.addPage();
      await captureSection("doc-roadmap");
      pdf.addPage();
      await captureSection("doc-code");
      pdf.addPage();
      await captureSection("doc-explanation");
      pdf.addPage();
      await captureSection("doc-resources");

      // Save the PDF
      pdf.save(`${projectDetails.name.replace(/\s+/g, "_")}_documentation.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto" id="project-documentation">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Project Documentation
            </h1>
          </div>
          <button
            onClick={exportToPdf}
            disabled={isGenerating}
            className={`flex items-center px-4 py-2 rounded-md ${
              isGenerating
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } transition-colors`}
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating PDF..." : "Export as PDF"}
          </button>
        </div>

        {/* Project Header */}
        <div id="doc-header" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {projectDetails.name}
          </h2>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <FileText className="w-4 h-4 mr-2" />
            <span>
              Documentation generated on {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Project Description */}
        <div
          id="doc-description"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Project Description</h3>
          <p className="text-gray-700 whitespace-pre-line">
            {projectDetails.prompt}
          </p>
        </div>

        {/* Project Roadmap */}
        <div
          id="doc-roadmap"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Development Roadmap</h3>
          <div className="space-y-6">
            {projectDetails.roadmap.map((phase, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-medium mb-2">{phase.title}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {phase.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-gray-700">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Code Implementation */}
        <div id="doc-code" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Code Implementation</h3>

          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">HTML</h4>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="markup"
                style={atomDark}
                showLineNumbers
              >
                {projectDetails.code.html || "<!-- No HTML code available -->"}
              </SyntaxHighlighter>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">CSS</h4>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="css"
                style={atomDark}
                showLineNumbers
              >
                {projectDetails.code.css || "/* No CSS code available */"}
              </SyntaxHighlighter>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-2">JavaScript</h4>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="javascript"
                style={atomDark}
                showLineNumbers
              >
                {projectDetails.code.javascript ||
                  "// No JavaScript code available"}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        {/* Code Explanation */}
        <div
          id="doc-explanation"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Code Explanation</h3>
          <p className="text-gray-700 whitespace-pre-line">
            {projectDetails.explanation}
          </p>
        </div>

        {/* Additional Resources */}
        <div
          id="doc-resources"
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
          <h4 className="text-lg font-medium mb-2">YouTube Tutorials</h4>
          <ul className="space-y-3">
            {YOUTUBE_LINKS.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Youtube className="w-5 h-5 mr-2 text-red-600" />
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentation;
