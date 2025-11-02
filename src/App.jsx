import React, { useState, useEffect } from "react";

const apiKey = import.meta.env.VITE_Gemini_API_key;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

const SYSTEM_INSTRUCTION =
  "You are a friendly and knowledgeable AI assistant specializing only in food, recipes, cooking techniques, ingredients, and meal planning. You operate as a dedicated culinary guide for a food shop. If a user asks a question unrelated to food, politely inform them that you can only help with culinary topics. ---------> and remember u just return ans as text so i don't get ans with like ** #### when u use steps or else dont add new line spaces etc or else because i just return text ans to my interface";

export default function App() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const chatContainer = document.getElementById("chat-history");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [history]);

  async function generateAnswer() {
    if (!query.trim() || isLoading) return;

    const userQuery = query.trim();
    setIsLoading(true);
    setQuery("");

    setHistory((prev) => [...prev, `You: ${userQuery}`]);

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ google_search: {} }],
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
    };

    const url = `${API_URL}?key=${apiKey}`;

    try {
      setHistory((prev) => [...prev, `AI: Thinking...`]);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const responseText =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = `AI: ${responseText}`;
        return newHistory;
      });
    } catch (error) {
      console.error("Gemini API call failed:", error);
      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] =
          "AI: Error - Could not connect to the service. Please try again.";
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isAIMessage = (text) => text.startsWith("AI:");

  return (
    <div className="w-full h-screen px-10 py-8 flex flex-col justify-between items-center bg-[#1a1d1e] font-sans">
      <style>
        {`
          .custom-textarea::placeholder {
            color: #c7abff; 
            opacity: 0.7;
          }
        `}
      </style>

      <h1 className="text-5xl font-extrabold pb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#FF6347] to-[#FFA07A]">
        ChefBot
      </h1>

      <div
        id="chat-history"
        className="w-full max-w-[700px]  p-4 grow flex flex-col gap-3 overflow-y-scroll scrollbar-thumb-rounded-full no-scrollbar"
      >
        {history.length === 0 && (
          <div className="flex justify-center items-center h-full text-gray-500 italic">
            Hey, here is your ChefBot. Ask me anything about ingredients,
            recipes, or cooking techniques—let's make something delicious!
          </div>
        )}
        {history.map((item, index) => (
          <div
            key={index}
            className={`max-w-[85%] p-3 rounded-xl shadow-md ${
              isAIMessage(item)
                ? "self-start bg-[#2d333e] text-gray-200"
                : "self-end bg-[#4b5563] text-white"
            }`}
          >
            {item}
          </div>
        ))}
        {isLoading && (
          <div className="self-start text-gray-400 italic p-3 rounded-xl bg-[#2d333e] max-w-fit">
            AI is consulting the cookbook...
          </div>
        )}
      </div>

      {/* Input and Button Area */}
      <div className="w-full flex flex-col gap-3 justify-end items-center max-w-[700px] pt-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              generateAnswer();
            }
          }}
          rows={3}
          placeholder="e.g., 'What can I make with paneer and basil' or 'How long to boil pasta?'"
          className="custom-textarea w-full p-4 rounded-xl resize-none overflow-y-scroll no-scrollbar 
                     border-2 border-orange-300 bg-[#2d333e] text-white 
                     shadow-[1px_2px_15px_rgba(255,100,0,.6)] 
                     caret-white 
                     focus:outline-none focus:border-orange-500 
                     focus:shadow-[0_0_15px_rgba(255,160,119,0.8)]
                     transition duration-200"
        ></textarea>

        <button
          className={`w-full md:w-fit px-8 py-3 rounded-full text-white font-semibold shadow-lg 
                      bg-gradient-to-r from-[#FF6347] to-[#FFA07A] transition duration-200 
                      hover:scale-[1.01]
                      ${
                        isLoading || !query.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "shadow-[2px_4px_10px_rgba(255,99,71,.4)] hover:shadow-[3px_5px_15px_rgba(255,160,122,.6)]"
                      }`}
          onClick={generateAnswer}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? "Consulting..." : "Get Answer"}
        </button>
      </div>
    </div>
  );
}
