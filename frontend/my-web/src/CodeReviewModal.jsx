import React, { useState } from 'react';
import { FileText, Code, Search } from 'lucide-react';

const CodeReviewModal = ({ isOpen, onClose }) => {
  const [codeInput, setCodeInput] = useState('');
  const [codeReviewResult, setCodeReviewResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCodeReview = async () => {
    if (!codeInput.trim()) {
      alert('Please paste your code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setCodeReviewResult(null);

    try {
      // Split large code into chunks if necessary (e.g., > 10,000 characters)
      const MAX_CODE_LENGTH = 10000;
      let codeToSend = codeInput;
      if (codeInput.length > MAX_CODE_LENGTH) {
        codeToSend = codeInput.substring(0, MAX_CODE_LENGTH) + '\n\n[Code truncated for review...]';
        setErrorMessage('Code was truncated due to size limits. Reviewing the first 10,000 characters.');
      }

      const response = await fetch('http://localhost:8000/code-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: codeToSend,
          language: 'javascript' // Adjust dynamically if needed
        }),
        timeout: 30000, // Increase timeout to 30 seconds
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.strengths || !data.improvements) {
        throw new Error('Invalid response format from server');
      }

      setCodeReviewResult(data);
    } catch (error) {
      console.error('Code Review Error:', error);

      // Fallback: Provide basic improvement suggestions if API fails
      const fallbackReview = {
        strengths: ['Code was submitted for review.'],
        improvements: [
          'Consider splitting large code into smaller, modular functions for better maintainability.',
          'Ensure consistent indentation and formatting for readability.',
          'Add comments to explain complex logic or large code blocks.',
          'Check for unused variables or redundant code to optimize performance.',
        ],
        securityIssues: ['Unable to analyze security due to processing error. Avoid inline scripts and validate inputs where applicable.']
      };

      setCodeReviewResult(fallbackReview);
      setErrorMessage(`Failed to get full review: ${error.message}. Showing basic suggestions instead.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#16213E] rounded-2xl p-8 w-full max-w-2xl h-[80vh] flex flex-col border-4 border-[#E94560] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Code Review Assistant
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-[#E94560] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Code Input Area */}
        <div className="flex-1 mb-4">
          <textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Paste your code here for review (large code supported)..."
            className="w-full h-full px-4 py-3 bg-[#0F3460] border border-[#E94560]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E94560] resize-none font-mono text-sm"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-white text-sm">
            {errorMessage}
          </div>
        )}

        {/* Review Button */}
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={handleCodeReview}
            disabled={isLoading}
            className="flex-1 bg-[#E94560] text-white p-3 rounded-lg hover:bg-[#FF6B9E] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? 'Analyzing...' : 'Review Code'}
            <Search className="ml-2 w-5 h-5" />
          </button>
        </div>

        {/* Review Results */}
        {codeReviewResult && (
          <div className="bg-[#0F3460] rounded-lg p-4 max-h-[40%] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-3">Review Summary</h3>
            <div className="space-y-3">
              <div className="bg-[#16213E] p-3 rounded-lg">
                <h4 className="font-bold text-green-500 mb-2">Strengths</h4>
                <ul className="list-disc list-inside text-white">
                  {codeReviewResult.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#16213E] p-3 rounded-lg">
                <h4 className="font-bold text-yellow-500 mb-2">Improvements</h4>
                <ul className="list-disc list-inside text-white">
                  {codeReviewResult.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
              {codeReviewResult.securityIssues && (
                <div className="bg-[#16213E] p-3 rounded-lg">
                  <h4 className="font-bold text-red-500 mb-2">Security Concerns</h4>
                  <ul className="list-disc list-inside text-white">
                    {codeReviewResult.securityIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeReviewModal;