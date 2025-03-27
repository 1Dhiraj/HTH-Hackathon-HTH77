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

// New coding challenge questions
const CODE_CHALLENGES = [
  {
    type: "image",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg",
    question: "Write the basic structure of an HTML page.",
    correctAnswer:
      "<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>",
    hint: "Start with <!DOCTYPE html>.",
  },
  {
    type: "image",
    imageUrl: "/login form screenshot.png",
    question:
      "Create the HTML for this login form with username and password fields.",
    correctAnswer:
      '<form>\n  <div>\n    <label for="username">Username</label>\n    <input type="text" id="username" name="username" required>\n  </div>\n  <div>\n    <label for="password">Password</label>\n    <input type="password" id="password" name="password" required>\n  </div>\n  <button type="submit">Login</button>\n</form>',
    hint: "Use form, label, input, and button elements. Don't forget to set proper input types.",
  },
  {
    type: "text",
    question: "What is the correct syntax for a JavaScript arrow function?",
    correctAnswer: "() => {}",
    hint: "It uses '=>' syntax.",
  },
  {
    type: "text",
    question: "Which HTML tag is used to create a hyperlink?",
    correctAnswer: "<a>",
    hint: "It starts with 'a'.",
  },
  {
    type: "image",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg",
    question: "Write a CSS rule to make all <p> elements red.",
    correctAnswer: "p {\n  color: red;\n}",
    hint: "Use the color property.",
  },
  {
    type: "text",
    question: "Which CSS property is used to change the background color?",
    correctAnswer: "background-color",
    hint: "It starts with 'background-'.",
  },
  {
    type: "image",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
    question: "Write a JavaScript function that returns 'Hello, World!'.",
    correctAnswer: 'function greet() {\n  return "Hello, World!";\n}',
    hint: "Use the return keyword.",
  },
  {
    type: "image",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
    question: "Write a JavaScript function to add two numbers.",
    correctAnswer: "function add(a, b) {\n  return a + b;\n}",
    hint: "Define a function with two parameters.",
  },
  {
    type: "text",
    question: "Which keyword is used to declare a variable in JavaScript?",
    correctAnswer: "var, let, const",
    hint: "There are three ways to declare variables.",
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

  // State for challenge type (quiz or coding)
  const [challengeType, setChallengeType] = useState("quiz");

  // States for coding challenge
  const [userInput, setUserInput] = useState("");
  const [currentCodeChallenge, setCurrentCodeChallenge] = useState(null);
  const [codeTimeLeft, setCodeTimeLeft] = useState(180); // 3-minute timer

  // New state for image-based coding challenge
  const [imageChallengeCompleted, setImageChallengeCompleted] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    let interval = null;

    if (challengeType === "quiz") {
      if (isTimerRunning && timer > 0) {
        interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
        }, 1000);
      } else if (timer === 0 && !answered) {
        handleAnswer(null); // Time's up, mark as incorrect
      }
    }

    return () => clearInterval(interval);
  }, [timer, isTimerRunning, answered, challengeType]);

  // Reset timer when moving to next question
  useEffect(() => {
    if (challengeType === "quiz") {
      setTimer(30);
      setIsTimerRunning(true);
    }
  }, [currentQuestionIndex, challengeType]);

  // Image challenge validation
  const validateImageChallenge = () => {
    // Basic validation for login form HTML
    const input = userInput.toLowerCase();

    const requiredElements = [
      "<form",
      "<input",
      'type="text"',
      'type="password"',
      "<button",
      "username",
      "password",
    ];

    const missingElements = requiredElements.filter(
      (el) => !input.includes(el)
    );

    if (missingElements.length === 0) {
      setImageChallengeCompleted(true);
      alert("✅ Great job! Your solution meets all the requirements.");
    } else {
      alert(
        `❌ Your solution is missing: ${missingElements.join(", ")}. Try again!`
      );
    }
  };

  // Code challenge functions
  const loadNewCodeChallenge = () => {
    const randomIndex = Math.floor(Math.random() * CODE_CHALLENGES.length);
    setCurrentCodeChallenge(CODE_CHALLENGES[randomIndex]);
    setUserInput(""); // Clear input field for new question
    setCodeTimeLeft(180); // Reset timer for new question
  };

  useEffect(() => {
    if (challengeType === "code") {
      loadNewCodeChallenge();
    }
  }, [challengeType]);

  useEffect(() => {
    if (challengeType === "code") {
      if (codeTimeLeft <= 0) {
        alert("⏳ Time's up! The quiz will reset.");
        loadNewCodeChallenge();
      }
      const timer = setInterval(() => {
        setCodeTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [codeTimeLeft, challengeType]);

  const checkCodeAnswer = () => {
    if (
      userInput.trim().toLowerCase() ===
      currentCodeChallenge.correctAnswer.toLowerCase()
    ) {
      setTimeout(() => {
        alert("✅ Correct! Well done!");
        loadNewCodeChallenge(); // Load the next question after alert
      }, 10);
    } else {
      alert(`❌ Incorrect! Try again. Hint: ${currentCodeChallenge.hint}`);
    }
  };

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

        {/* Challenge type selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-center flex-wrap gap-3">
            <button
              onClick={() => setChallengeType("quiz")}
              className={`px-6 py-2 rounded-md transition-colors ${
                challengeType === "quiz"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Multiple Choice Quiz
            </button>
            <button
              onClick={() => setChallengeType("code")}
              className={`px-6 py-2 rounded-md transition-colors ${
                challengeType === "code"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Coding Challenge
            </button>
            <button
              onClick={() => {
                setChallengeType("codeFromImage");
                setImageChallengeCompleted(false);
                setUserInput("");
              }}
              className={`px-6 py-2 rounded-md transition-colors ${
                challengeType === "codeFromImage"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Code from Image
            </button>
          </div>
        </div>

        {challengeType === "quiz" && !challengeComplete ? (
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
        ) : challengeType === "quiz" && challengeComplete ? (
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
        ) : challengeType === "code" ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Coding Challenge</h2>
            <p className="mb-2">Answer the following:</p>

            {/* Timer */}
            <div className="text-red-600 font-bold mb-4">
              ⏳ Time Left: {Math.floor(codeTimeLeft / 60)}:
              {(codeTimeLeft % 60).toString().padStart(2, "0")}
            </div>

            {/* Show image if the question type is "image" */}
            {currentCodeChallenge?.type === "image" &&
              currentCodeChallenge.imageUrl && (
                <div className="mb-4">
                  <img
                    src={currentCodeChallenge.imageUrl}
                    alt="Challenge"
                    className="mx-auto w-32 h-32 object-contain"
                  />
                </div>
              )}

            {/* Show text-based question */}
            <div className="bg-gray-100 p-4 rounded-md font-mono">
              <p>{currentCodeChallenge?.question || "Loading question..."}</p>
            </div>

            {/* Input field for answer */}
            <textarea
              className="w-full p-2 border rounded-md mt-4 h-32 font-mono"
              placeholder="Type your answer..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />

            {/* Submit Answer Button */}
            <div className="flex justify-center mt-4 space-x-3">
              <button
                onClick={checkCodeAnswer}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Submit Answer
              </button>

              {/* Next Question Button */}
              <button
                onClick={loadNewCodeChallenge}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Skip Question 🔄
              </button>
            </div>
          </div>
        ) : challengeType === "codeFromImage" ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-center">
              Login Form Challenge
            </h2>
            <p className="mb-6 text-center">
              Create the HTML for a login form based on the image below. Include
              form, label, input, and button elements.
            </p>

            {/* Login Form Image */}
            <div className="flex justify-center mb-6">
              <img
                src="/login form screenshot.png"
                alt="Login Form Challenge"
                className="max-w-full rounded-md shadow-md border border-gray-200"
                style={{ maxHeight: "300px" }}
              />
            </div>

            {/* Requirements */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create a form element</li>
                <li>Include username and password input fields</li>
                <li>Add appropriate labels for each field</li>
                <li>
                  Set correct input types (text for username, password for
                  password)
                </li>
                <li>Add a submit button with the text "Login"</li>
              </ul>
            </div>

            {/* Input field for answer */}
            <textarea
              className="w-full p-3 border rounded-md mt-4 h-60 font-mono text-sm"
              placeholder="Write your HTML solution here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={imageChallengeCompleted}
            />

            {/* Submit Answer Button */}
            <div className="flex justify-center mt-6 space-x-4">
              {!imageChallengeCompleted ? (
                <button
                  onClick={validateImageChallenge}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit Solution
                </button>
              ) : (
                <>
                  <div className="px-6 py-3 bg-green-100 text-green-800 rounded-md border border-green-300">
                    Challenge completed! Great job!
                  </div>
                  <button
                    onClick={() => {
                      setImageChallengeCompleted(false);
                      setUserInput("");
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WebDevChallenge;
