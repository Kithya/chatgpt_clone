import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

const ChatBox = () => {
  const { selectedChat, user, axios, token, setUser } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished] = useState(false);

  const bottomRef = useRef(null);
  const isNewChat = messages.length === 0;

  const onSubmit = async (e) => {
    try {
      e.preventDefault();

      if (loading) return;
      if (!user) return toast.error("Please login to continue");
      if (!selectedChat?._id) {
        return toast.error("Please create or select a chat first");
      }

      setLoading(true);

      const promptCopy = prompt;
      setPrompt("");

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: promptCopy,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt: promptCopy,
          isPublished,
        },
        { headers: { Authorization: token } },
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);

        if (typeof data.remainingCredits === "number") {
          setUser((prev) => (prev ? { ...prev, credits: data.remainingCredits } : prev));
        } else if (mode === "image") {
          setUser((prev) => ({ ...prev, credits: prev.credits - 2 }));
        } else {
          setUser((prev) => ({ ...prev, credits: prev.credits - 1 }));
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderPromptBox = (centered = false) => (
    <div className={centered ? "w-full max-w-3xl" : "py-2 px-4 md:px-8"}>
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-[#1c1c1c]/30 border border-gray-400 dark:border-[#80609F]/30 rounded-full w-full max-w-3xl p-3 pl-4 mx-auto flex gap-3 items-center shadow-sm"
      >
        <select
          className="text-sm pl-3 pr-2 outline-none"
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          disabled={loading}
        >
          <option value="text" className="dark:bg-black">
            Text
          </option>
          <option value="image" className="dark:bg-black">
            Image
          </option>
        </select>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 w-full text-sm outline-none"
          required
          disabled={loading}
        />
        <button type="submit" className="cursor-pointer" disabled={loading}>
          <img src={loading ? assets.stop_icon : assets.send_icon} className="w-8" />
        </button>
      </form>
      <p className="text-sm text-center mt-3 text-gray-500">
        ChatGPT can make mistakes. Check important info.
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen">
      {isNewChat ? (
        <div className="flex-1 flex items-center justify-center px-4 md:px-8">
          <div className="w-full max-w-4xl flex flex-col items-center gap-6">
            <p className="text-4xl sm:text-5xl text-center text-black dark:text-white">
              What can I help with?
            </p>
            {renderPromptBox(true)}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-scroll px-4 md:px-8">
            <div className="mx-auto w-full max-w-4xl py-6">
              {messages.map((message, index) => (
                <Message key={index} message={message} />
              ))}

              {loading && (
                <div className="loader flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white"></div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
          {renderPromptBox()}
        </>
      )}
    </div>
  );
};

export default ChatBox;
