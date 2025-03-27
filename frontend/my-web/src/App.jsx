import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import CodeGenerator from "./CodeGenerator";
import WebDevChallenge from "./WebDevChallenge";
import ProjectDocumentation from "./ProjectDocumentation";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<CodeGenerator />} />
          <Route path="/challenge" element={<WebDevChallenge />} />
          <Route path="/documentation" element={<ProjectDocumentation />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
