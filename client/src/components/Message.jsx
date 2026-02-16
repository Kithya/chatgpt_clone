import React, { useEffect } from "react";
import Markdown from "react-markdown";
import Prism from "prismjs";

const Message = ({ message }) => {
  const isUser = message.role === "user";

  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  return (
    <div className={`flex my-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-3xl w-fit rounded-xl px-4 py-1
          bg-[#efefef] dark:bg-[#fafafa]/30
          backdrop-blur-sm
        `}
      >
        {message.isImage ? (
          <img src={message.content} className="w-full max-w-md rounded-lg" />
        ) : (
          <div className="md reset-tw text-sm leading-relaxed text-gray-900 dark:text-white">
            <Markdown>{message.content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
