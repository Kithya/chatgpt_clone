import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";

const ChatBox = () => {
  const { selectedChat, theme } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const bottomRef = useRef(null);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    // <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
    //   {/* chat message */}
    //   <div className="flex-1 mb-5 overflow-y-scroll">
    //     {messages.length === 0 && (
    //       <div className="h-full flex flex-col items-center justify-center gap-3">
    //         <p className="mt-5 text-4xl sm:text-5xl text-center text-black dark:text-white">
    //           What can I help with?
    //         </p>
    //       </div>
    //     )}

    //     {messages.map((message, index) => (
    //       <Message key={index} message={message}/>
    //     ))}
    //   </div>

    //   {/* Prompt input box */}
    //   <form action=""></form>
    // </div>
    <div className="flex-1 flex flex-col h-screen">
      {/* Message area */}
      <div className="flex-1 overflow-y-scroll px-4 md:px-8">
        <div className="mx-auto w-full max-w-4xl py-6">
          {messages.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <p className="text-4xl sm:text-5xl text-center text-black dark:text-white">
                What can I help with?
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <Message key={index} message={message} />
            ))
          )}

          {/* {loading && <Loader />} */}
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
      <div className="py-2 px-4 md:px-8">
        <form
          onSubmit={onSubmit}
          className="bg-white dark:bg-[#1c1c1c]/30 border border-gray-400 dark:border-[#80609F]/30 rounded-full w-full max-w-3xl p-3 pl-4 mx-auto flex gap-3 items-center shadow-sm"
        >
          <select
            className="text-sm pl-3 pr-2 outline-none"
            onChange={(e) => setMode(e.target.value)}
            value={mode}
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
          />
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
          />
        </form>
        <p className="text-sm text-center mt-3 text-gray-500">ChatGPT can make mistakes. Check important info.</p>
      </div>
    </div>
  );
};

export default ChatBox;
