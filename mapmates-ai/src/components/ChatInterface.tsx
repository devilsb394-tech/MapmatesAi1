import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";
import VoiceMic from "./VoiceMic";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");
      
      setMessages((prev) => [...prev, data]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `I encountered an error: ${error.message || "Unknown error"}. Please check your Grok API key or model availability.` 
        },
      ]);
      // Restore input if it failed
      setInput(currentInput);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[var(--deep-black)]">
      {/* Header / Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-20 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00f2ff] flex items-center justify-center font-bold text-black text-xs">
            MM
          </div>
          <span className="font-bold tracking-tight text-white uppercase text-sm">Mapmates Ai</span>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 px-4 md:px-0" ref={scrollRef}>
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center pt-20"
              >
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute -inset-4 rounded-full border border-[#00f2ff]/20"
                  />
                  <div className="w-20 h-20 rounded-3xl bg-[#00f2ff]/10 flex items-center justify-center neon-border">
                    <Sparkles className="w-10 h-10 text-[#00f2ff]" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tighter">
                  Mapmates <span className="text-[var(--neon-yellow)] neon-text-yellow">Ai</span>
                </h2>
                <p className="text-white/60 text-lg md:text-xl font-medium">
                  What can I help you <span className="text-[#00f2ff]">discover</span> today?
                </p>
                <p className="mt-8 text-white/30 text-xs font-mono uppercase tracking-[0.2em]">
                  Visionary Intelligence by Faizan Zeeshan
                </p>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-3 max-w-[85%] md:max-w-[75%]",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
                      msg.role === "user" ? "bg-white/10" : "bg-[#00f2ff]/20 neon-border"
                    )}>
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-[#00f2ff]" />
                      )}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user" 
                        ? "bg-white/5 border border-white/10 rounded-tr-none text-white" 
                        : "bg-[#0a0a20] border border-[#00f2ff]/20 rounded-tl-none text-white/90 shadow-[0_0_15px_rgba(0,242,255,0.05)]"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#00f2ff] animate-pulse" />
                </div>
                <div className="flex gap-1.5 p-4 rounded-2xl bg-[#0a0a20] border border-[#00f2ff]/10">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 rounded-full bg-[#00f2ff]"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-[#00f2ff]"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-[#00f2ff]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <div className="glass-morphism rounded-3xl p-2 pl-6 flex items-center gap-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything to Mapmates Ai..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm py-3"
            />
            
            <div className="flex items-center gap-1">
              <VoiceMic isListening={isListening} onClick={toggleListening} />
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-4 rounded-2xl transition-all active:scale-95",
                  input.trim() && !isLoading 
                    ? "bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]"
                    : "bg-white/5 text-white/20"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-[0.3em] font-mono">
            Faizan Zeeshan • Mapmates AI • Lahore PK
          </p>
        </div>
      </div>
    </div>
  );
}
