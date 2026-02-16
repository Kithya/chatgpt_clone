import React, { useContext, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { chats, setSelectedChat, theme, setTheme, user, navigate } =
    useAppContext();
  const [search, setSearch] = useState("");

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-3 dark:bg-linear-to-b from-[#242124]/30 to-[#000000] border-r border-[#1c1c1c]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-10 ${!isMenuOpen && "max-md:-translate-x-full"}`}
    >
      {/* Logo */}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        className="w-full max-w-48"
      />

      {/* New Chat button */}
      <button className="flex justify-start items-center w-full py-2 px-2 mt-10 dark:text-white hover:bg-black/5 rounded-lg group dark:hover:bg-white/10 transition-colors duration-300 ease-in-out cursor-pointer">
        <span className="mr-2 -ml-0.5 text-xl">
          <img src={assets.edit_square} className="w-5 not-dark:invert" />
        </span>
        New Chat
      </button>

      {/* Images */}
      <div
        onClick={() => {
          navigate("/community");
          setIsMenuOpen(false);
        }}
        className="flex items-center justify-start gap-2 py-2 px-2 mt-2 hover:bg-black/5 rounded-lg group dark:hover:bg-white/10 transition-colors duration-300 ease-in-out cursor-pointer"
      >
        <img src={assets.gallery_icon} className="w-4.5 not-dark:invert" />
        <div>
          <p>Image</p>
        </div>
      </div>

      {/* Search */}

      <div className="flex items-center gap-2 p-3 mt-3 border border-gray-400 dark:border-white/40 rounded-md">
        <img src={assets.search_icon} className="w-4 not-dark:invert" />
        <input
          type="text"
          placeholder="Search Chats.."
          className="text-xs placeholder:text-gray-400 outline-none"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </div>

      {/* Chats */}

      {chats.length > 0 && <p className="mt-10 text-sm">Your Chats</p>}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((chat) => (
            <div
              onClick={() => {
                setSelectedChat(chat);
                setIsMenuOpen(false);
                navigate("/");
              }}
              key={chat._id}
              className="py-3 p-4 rounded-lg group hover:bg-black/5 flex justify-between text-[15px] cursor-pointer"
            >
              <div>
                <p className="truncate w-full">
                  {chat.messages.length > 0
                    ? chat.messages[0]?.content.slice(0, 32)
                    : chat.name}
                </p>
              </div>

              <img
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
              />
            </div>
          ))}
      </div>

      {/* Footer Card */}
      <div className="mt-auto pt-4">
        <div className="rounded-xl border border-gray-300/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md p-2 space-y-2 shadow-sm">
          {/* Credits */}
          <div
            onClick={() => {
              navigate("/credits");
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 py-2 px-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <img src={assets.diamond_icon} className="w-4.5 dark:invert" />
            <div className="flex flex-col text-sm">
              <p>Credits: {user?.credits}</p>
              <p className="text-xs text-gray-400">
                Purchase Credits to use more models
              </p>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between gap-2 py-2 px-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
            <div className="flex items-center gap-2 text-sm">
              <img src={assets.theme_icon} className="w-4 not-dark:invert" />
              <p>Dark Mode</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={theme === "dark"}
                onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
              <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-blue-400 transition-all" />
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </label>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300/50 dark:border-white/10 my-1" />

          {/* User */}
          <div className="flex items-center gap-2 py-2 px-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <img src={assets.user_icon} className="w-7 not-dark:invert" />
            <p className="flex-1 text-sm dark:text-primary truncate">
              {user ? user.name : "Guest"}
            </p>
            {user && (
              <img
                src={assets.logout_icon}
                className="h-5 hidden group-hover:block not-dark:invert"
              />
            )}
          </div>
        </div>
      </div>

      <img
        src={assets.close_icon}
        onClick={() => setIsMenuOpen(false)}
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
      />
    </div>
  );
};

export default Sidebar;
