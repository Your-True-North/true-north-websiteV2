import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const AskTrueChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [questionCount, setQuestionCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('trueNorthQuestionCount') || '0');
    }
    return 0;
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initialMessage = {
    type: 'bot',
    content: "This is True North's guidance system - trained on my philosophy and approach to transformation. These aren't AI responses - they come from my language, my work, my years of guiding people through their deepest challenges.\n\nWhat's really on your mind?",
    timestamp: new Date()
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([initialMessage]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const getOffTopicResponse = () => {
    const responses = [
      "You're wasting your own time with that question. I'm here to talk about transformation, healing, and finding your authentic path. What's really going on underneath?",
      "That's not what I'm here for. I deal with the inner work - the stuff that actually matters. What's eating at you that you're not willing to look at?",
      "Wrong guide for that question. I'm about spiritual transformation and healing. What's the real question you're avoiding asking?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getInappropriateResponse = (type) => {
    const responses = {
      sexual: "Stop wasting both our time. This isn't that kind of conversation.",
      rude: "Your attitude tells me everything I need to know about where you're at. Come back when you're serious about change.",
      joke: "I'm not here for entertainment. Either ask a real question or move on."
    };
    return responses[type];
  };

  const getLimitReachedResponse = () => {
    const responses = [
      "That's your three questions. I've given you what I can through a screen, but real transformation happens in relationship.\n\nIf you want to go deeper, reach out on Instagram. Otherwise, sit with what came up and do the inner work.",
      
      "Three questions done. You've got what you need to start - now the work begins. Real change happens when you stop consuming and start doing.\n\nNeed more? Find me on Instagram. Otherwise, go integrate what came up.",
      
      "That's it - your three are up. I've pointed you in the right direction, but I can't do the pushups for you, my friend.\n\nReady for more? Instagram is where to find me. Otherwise, take what resonated and act on it.",
      
      "Three questions complete. You've got enough to work with - the question is, will you actually work with it?\n\nWant deeper guidance? Instagram. Want transformation? Do the work that came up in this conversation."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const callOpenAI = async (userMessage) => {
    try {
      const response = await fetch('/api/ask-true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          questionNumber: questionCount + 1
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return "Something went wrong. The real work happens in relationship anyway - reach out on Instagram if you need to go deeper.";
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let botResponse;
      
      if (questionCount >= 3) {
        botResponse = {
          type: 'bot',
          content: getLimitReachedResponse(),
          timestamp: new Date(),
          isLimit: true
        };
      } else {
        const lowerMessage = currentInput.toLowerCase();
        const sexualKeywords = ['sex', 'sexual', 'porn', 'nude', 'naked', 'horny'];
        const rudeKeywords = ['fuck you', 'asshole', 'piece of shit', 'go fuck', 'stupid', 'idiot'];
        const jokeKeywords = ['joke', 'funny', 'haha', 'lol', 'meme', 'kidding'];

        if (sexualKeywords.some(keyword => lowerMessage.includes(keyword))) {
          botResponse = {
            type: 'bot',
            content: getInappropriateResponse('sexual'),
            timestamp: new Date()
          };
        } else if (rudeKeywords.some(keyword => lowerMessage.includes(keyword))) {
          botResponse = {
            type: 'bot',
            content: getInappropriateResponse('rude'),
            timestamp: new Date()
          };
        } else if (jokeKeywords.some(keyword => lowerMessage.includes(keyword))) {
          botResponse = {
            type: 'bot',
            content: getInappropriateResponse('joke'),
            timestamp: new Date()
          };
        } else {
          const relevantKeywords = [
            'anger', 'fear', 'purpose', 'healing', 'trauma', 'relationship', 'spirituality', 
            'transformation', 'authentic', 'inner work', 'shadow', 'masculine', 'energy', 
            'pain', 'hurt', 'love', 'god', 'divine', 'soul', 'anxiety', 'scared', 'meaning', 
            'calling', 'depression', 'stressed', 'lost', 'empty', 'stuck', 'confused', 
            'breathwork', 'meditation', 'mindfulness', 'growth', 'change', 'heal', 'help'
          ];
          
          const isRelevant = relevantKeywords.some(keyword => 
            lowerMessage.includes(keyword)
          );

          if (isRelevant) {
            const aiResponse = await callOpenAI(currentInput);
            botResponse = {
              type: 'bot',
              content: aiResponse,
              timestamp: new Date()
            };
          } else {
            botResponse = {
              type: 'bot',
              content: getOffTopicResponse(),
              timestamp: new Date()
            };
          }
        }
        
        setQuestionCount(prev => {
          const newCount = prev + 1;
          if (typeof window !== 'undefined') {
            localStorage.setItem('trueNorthQuestionCount', newCount.toString());
          }
          return newCount;
        });
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "Something went wrong. The real work happens in relationship anyway - reach out on Instagram if you need to go deeper.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        style={{ fontFamily: 'inherit' }}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-black border border-white rounded-lg shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div>
              <h3 className="text-white font-semibold">Ask True</h3>
              <p className="text-gray-400 text-sm">
                {questionCount < 3 ? `${3 - questionCount} questions left` : 'Session complete'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.type === 'user' 
                    ? 'ml-8 text-right' 
                    : 'mr-8 text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-full ${
                    message.type === 'user'
                      ? 'bg-white text-black'
                      : message.isLimit
                        ? 'bg-gray-700 text-white border border-gray-500'
                        : 'bg-gray-800 text-white'
                  }`}
                  style={{ borderRadius: '6px' }}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-8 text-left">
                <div className="inline-block p-3 rounded-lg bg-gray-800 text-white">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {questionCount < 3 && (
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What's really on your mind?"
                  className="flex-1 bg-gray-800 text-white p-2 rounded resize-none h-10 text-sm"
                  style={{ borderRadius: '6px' }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-white text-black p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                  style={{ borderRadius: '6px' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AskTrueChat;