import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Trophy } from "lucide-react";

const QUESTIONS = [
  {
    id: 1,
    question: "What CSS property is used to create space between elements?",
    options: ["margin", "padding", "border", "spacing"],
    correctAnswer: "margin",
    explanation:
      "The margin property defines the space outside an element's border, while padding defines the space inside the border.",
  },
  {
    id: 2,
    question:
      "Which HTML tag is used to define a semantic section that contains navigation links?",
    options: ["<div>", "<section>", "<nav>", "<header>"],
    correctAnswer: "<nav>",
    explanation:
      "The <nav> tag defines a set of navigation links. It's a semantic element that helps screen readers and search engines understand your page structure.",
  },
  {
    id: 3,
    question:
      "In JavaScript, what method is used to add an element at the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctAnswer: "push()",
    explanation:
      "The push() method adds one or more elements to the end of an array and returns the new length of the array.",
  },
  {
    id: 4,
    question:
      "Which CSS property is used to change the text color of an element?",
    options: ["text-color", "font-color", "color", "foreground-color"],
    correctAnswer: "color",
    explanation: "The color property sets the color of text in CSS.",
  },
  {
    id: 5,
    question: "What does the 'viewport' meta tag do in HTML?",
    options: [
      "Controls the page's width and zoom level on different devices",
      "Sets the background color of the page",
      "Defines the character encoding",
      "Creates a responsive layout automatically",
    ],
    correctAnswer:
      "Controls the page's width and zoom level on different devices",
    explanation:
      "The viewport meta tag helps make websites look good on all devices by controlling the page's width and scaling.",
  },
  {
    id: 6,
    question: "Which of the following is NOT a JavaScript framework/library?",
    options: ["React", "Angular", "Vue", "Bootstrap"],
    correctAnswer: "Bootstrap",
    explanation:
      "Bootstrap is a CSS framework, not a JavaScript framework/library. React, Angular, and Vue are JavaScript frameworks/libraries.",
  },
  {
    id: 7,
    question: "What CSS declaration would you use to make all text uppercase?",
    options: [
      "text-case: uppercase;",
      "text-transform: uppercase;",
      "font-case: upper;",
      "text-style: caps;",
    ],
    correctAnswer: "text-transform: uppercase;",
    explanation:
      "text-transform: uppercase; converts all characters to uppercase.",
  },
  {
    id: 8,
    question:
      "Which HTTP method is typically used to submit form data to a server?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctAnswer: "POST",
    explanation:
      "POST is typically used when submitting form data as it allows sending data in the request body, which is more secure and can handle larger amounts of data than GET.",
  },
  {
    id: 9,
    question: "What does API stand for in web development?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Integration",
      "Automated Program Instance",
      "Application Process Integration",
    ],
    correctAnswer: "Application Programming Interface",
    explanation:
      "An API (Application Programming Interface) is a set of rules that allows one software application to interact with another.",
  },
  {
    id: 10,
    question: "What is the purpose of localStorage in web browsers?",
    options: [
      "To store session cookies",
      "To store data with no expiration date",
      "To cache HTTP requests",
      "To store server-side variables",
    ],
    correctAnswer: "To store data with no expiration date",
    explanation:
      "localStorage allows developers to store key-value pairs in a web browser with no expiration date, meaning the data will persist even after the browser window is closed.",
  },
];

const WebDevChallenge = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [timer, setTimer] = useState(30); // 30 seconds per question
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    let interval = null;

    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !answered) {
      handleAnswer(null); // Time's up, mark as incorrect
    }

    return () => clearInterval(interval);
  }, [timer, isTimerRunning, answered]);

  // Reset timer when moving to next question
  useEffect(() => {
    setTimer(30);
    setIsTimerRunning(true);
  }, [currentQuestionIndex]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    setIsTimerRunning(false);

    if (answer === currentQuestion.correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setChallengeComplete(true);
    }
  };

  const restartChallenge = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setChallengeComplete(false);
    setTimer(30);
    setIsTimerRunning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Web Development Challenge
          </h1>
        </div>

        {!challengeComplete ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} of {QUESTIONS.length}
              </div>
              <div
                className={`font-medium ${
                  timer <= 10 ? "text-red-500" : "text-blue-600"
                }`}
              >
                Time: {timer}s
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !answered && handleAnswer(option)}
                    disabled={answered}
                    className={`w-full p-4 text-left rounded-md border transition-colors ${
                      answered && option === currentQuestion.correctAnswer
                        ? "bg-green-100 border-green-500"
                        : answered &&
                          option === selectedAnswer &&
                          option !== currentQuestion.correctAnswer
                        ? "bg-red-100 border-red-500"
                        : option === selectedAnswer
                        ? "bg-blue-100 border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option}</span>
                      {answered && option === currentQuestion.correctAnswer && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                      {answered &&
                        option === selectedAnswer &&
                        option !== currentQuestion.correctAnswer && (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {answered && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Explanation:</h3>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="font-medium">
                Score: {score}/{currentQuestionIndex + (answered ? 1 : 0)}
              </div>
              {answered && (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {currentQuestionIndex < QUESTIONS.length - 1
                    ? "Next Question"
                    : "Finish Challenge"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Challenge Complete!</h2>
            <p className="text-lg mb-6">
              You scored{" "}
              <span className="font-bold text-blue-600">{score}</span> out of{" "}
              <span className="font-bold">{QUESTIONS.length}</span>
            </p>

            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${(score / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {score === QUESTIONS.length && "Perfect score! Amazing job!"}
                {score >= QUESTIONS.length * 0.8 &&
                  score < QUESTIONS.length &&
                  "Great job! You have excellent web development knowledge!"}
                {score >= QUESTIONS.length * 0.6 &&
                  score < QUESTIONS.length * 0.8 &&
                  "Good work! Keep learning and improving!"}
                {score < QUESTIONS.length * 0.6 &&
                  "Keep practicing to improve your web development skills!"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={restartChallenge}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebDevChallenge;
