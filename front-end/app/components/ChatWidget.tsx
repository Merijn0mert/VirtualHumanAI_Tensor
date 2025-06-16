"use client";

import { useRef, useState, useEffect } from "react";

const emojis = ["😊", "🙂", "😐", "😕", "😢"];

const COLOR_MAP: Record<string, string> = {
  g: "#DE2B37",
  m: "#50C4EE",
  z: "#6F47D1",
  k: "#FFC823",
  c: "#FF7A1A",
  j: "#00D16B",
  d: "#001F3F",
};

type MessageType = "user" | "agent";
interface Message {
  type: MessageType;
  content: string;
  isHTML?: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "agent",
      content: "Hi there i am here to help you 👋",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [gradientColors, setGradientColors] = useState<string[]>([
    COLOR_MAP.d,
    COLOR_MAP.d,
    COLOR_MAP.d,
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const extractColorCode = (text: string): string | null => {
    const match = text.match(/\[([gmzkcjd])\]/i);
    if (match && COLOR_MAP[match[1].toLowerCase()]) {
      return COLOR_MAP[match[1].toLowerCase()];
    }
    return null;
  };

  useEffect(() => {
    const lastBotMessage = [...messages].reverse().find((m) => m.type === "agent");
    if (!lastBotMessage) return;

    const color = extractColorCode(lastBotMessage.content);
    if (color) {
      setGradientColors((prevColors) => {
        if (prevColors[prevColors.length - 1] === color) return prevColors;
        const newColors = [...prevColors, color];
        if (newColors.length > 3) newColors.shift();
        return newColors;
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { type: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputValue,
          history: [...messages, userMessage].map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const color = extractColorCode(data.reply.colorCode)
      if (color) {
      setGradientColors((prevColors) => {
        if (prevColors[prevColors.length - 1] === color) return prevColors;
        const newColors = [...prevColors, color];
        if (newColors.length > 3) newColors.shift();
        return newColors;
      });
    }
      const replyContent =
        typeof data.reply === "string" ? data.reply : data.reply.message;
      const articleData =
        typeof data.reply === "object" && data.reply.article ? data.reply.article : null;

      let combinedContent = replyContent;

      if (articleData) {
        combinedContent += `\n\n📄 <a href="${articleData.link}" target="_blank" class="underline text-blue-300">${articleData.title}</a>`;
      }

      const aiMessage: Message = {
        type: "agent",
        content: combinedContent,
        isHTML: !!articleData,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI fetch failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          content: "Er ging iets mis. Probeer het later opnieuw.",
        },
      ]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        sendAudioToAPI(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 5000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const sendAudioToAPI = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice-message.webm");

    try {
      const res = await fetch("/api/speech_to_text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      const transcript = data.transcript;
      const userMessage: Message = { type: "user", content: transcript };
      setMessages((prev) => [...prev, userMessage]);

      const currentHistory = messages.concat(userMessage).map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: transcript,
          history: currentHistory,
        }),
      });

      const chatData = await chatRes.json();

      let combinedContent = chatData.reply.message;

      if (chatData.article) {
        combinedContent += `\n\n📄 <a href="${chatData.article.link}" target="_blank" class="underline text-blue-300">${chatData.article.title}</a>`;
      }

      const aiMessage: Message = {
        type: "agent",
        content: combinedContent,
        isHTML: !!chatData.article,
      };

      setMessages((prev) => [...prev, aiMessage]);

      const playAudioFromApi = async (text: string) => {
        try {
          const res = await fetch("/api/text_to_speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) throw new Error("TTS API error");
          const audioBlob = await res.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
          audio.onended = () => URL.revokeObjectURL(audioUrl);
        } catch (err) {
          console.error("Failed to play audio:", err);
        }
      };

      await playAudioFromApi(chatData.reply.message);
    } catch (error) {
      console.error("Speech API failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          content: "Er ging iets mis. Probeer het later opnieuw.",
        },
      ]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-navy-900 rounded-full flex items-center justify-center shadow-lg hover:bg-navy-800 transition-colors"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    );
  }

  const gradientStyle = {
    background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
  };

  return (
    <div className="fixed bottom-6 right-6 w-[350px] bg-navy-900 rounded-lg shadow-xl">
      <div className="flex items-center justify-between p-4 rounded-t-lg " style={gradientStyle}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-navy-700 rounded-full"></div>
          <div>
            <h3 className="text-white font-medium">Janick</h3>
            <p className="text-xs text-white">De stap AI agent</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="h-[400px] overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-navy-700 text-white"
              }`}
            >
              {message.isHTML ? (
                <span dangerouslySetInnerHTML={{ __html: message.content }} />
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 justify-center">
          {emojis.map((emoji, index) => (
            <button key={index} className="w-8 h-8 flex items-center justify-center hover:bg-navy-700 rounded-full">
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-navy-700">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-navy-700 text-white rounded-full py-2 px-4 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={startRecording}
              disabled={isRecording}
              className={`p-1 rounded-full transition-colors ${
                isRecording ? "text-red-500 bg-red-100" : "text-gray-400 hover:text-green-400"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button type="submit" className="p-1 text-blue-500 hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
