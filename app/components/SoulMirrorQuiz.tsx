"use client";
import { useState } from "react";

const Q = [
  {
    k: "current_state", 
    q: "Where are you right now?", 
    a: [
      { text: "Just starting to question things", value: "beginning" },
      { text: "Deep in the struggle, need guidance", value: "struggling" }, 
      { text: "Ready to do the real work", value: "ready" }
    ]
  },
  {
    k: "support_style",
    q: "How do you prefer to work through challenges?",
    a: [
      { text: "I learn best with tools and resources", value: "self_directed" },
      { text: "I need community and shared experience", value: "community" },
      { text: "I work best with focused, personal attention", value: "one_on_one" }
    ]
  },
  {
    k: "readiness",
    q: "What feels true for you right now?",
    a: [
      { text: "I want to explore but not commit yet", value: "exploring" },
      { text: "I'm lonely in this journey", value: "isolated" },
      { text: "I'm ready for deep, intensive work", value: "committed" }
    ]
  }
];

export default function SoulMirrorQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  
  const handleAnswer = (questionKey: string, answerValue: string) => {
    const newAnswers = { ...answers, [questionKey]: answerValue };
    setAnswers(newAnswers);
    
    if (currentQ < Q.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const getRecommendation = () => {
    const { current_state, support_style, readiness } = answers;
    
    // Prioritize 1:1 for those who are struggling and need personal attention
    if (current_state === "struggling" && support_style === "one_on_one") {
      return { path: "/work#one-to-one", name: "1:1 Deep Work", reason: "You're in the thick of it and need focused, personal guidance to break through." };
    }
    
    // Community for those who are isolated or prefer group support
    if (readiness === "isolated" || support_style === "community") {
      return { path: "/circle", name: "The Circle of Return", reason: "You need brothers on this path. Community heals isolation and accelerates growth." };
    }
    
    // 1:1 for those who are committed and ready for intensive work
    if (readiness === "committed" || (current_state === "ready" && support_style === "one_on_one")) {
      return { path: "/work#one-to-one", name: "1:1 Deep Work", reason: "You're ready for the real work. Time to go deep with focused attention." };
    }
    
    // Library for beginners or those exploring/self-directed
    if (current_state === "beginning" || support_style === "self_directed" || readiness === "exploring") {
      return { path: "/library", name: "Free Library", reason: "Start with the foundation. Build your understanding before diving deeper." };
    }
    
    // Default fallback
    return { path: "/library", name: "Free Library", reason: "Begin where you are. The tools will guide you to your next step." };
  };

  if (currentQ >= Q.length && Object.keys(answers).length === Q.length) {
    const rec = getRecommendation();
    return (
      <div className="quiz-result">
        <p className="muted" style={{marginBottom: '1rem'}}>Your true north suggests: {rec.reason}</p>
        <p>Next step: <a className="accent-text" href={rec.path}>{rec.name}</a></p>
      </div>
    );
  }

  const question = Q[currentQ];
  
  return (
    <div className="quiz">
      <p className="h3">{question.q}</p>
      <div className="quiz-row">
        {question.a.map((option) => (
          <button 
            key={option.value} 
            className="btn-secondary" 
            onClick={() => handleAnswer(question.k, option.value)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
