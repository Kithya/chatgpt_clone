import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const Community = () => {
  const { axios, user, token, setUser, selectedChat, setSelectedChat } = useAppContext();
  const [activeTab, setActiveTab] = useState("image");
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  const fetchCommunityFeed = async () => {
    try {
      setLoading(true);

      const [imagesResponse, textsResponse] = await Promise.all([
        axios.get("/api/user/published-images"),
        axios.get("/api/user/published-texts"),
      ]);

      setImages(imagesResponse?.data?.image || []);
      setTexts(textsResponse?.data?.text || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load community feed");
    } finally {
      setLoading(false);
    }
  };

  const ensureChatForGeneration = async () => {
    if (selectedChat?._id) {
      return selectedChat._id;
    }

    await axios.get("/api/chat/create", {
      headers: { Authorization: token },
    });

    const { data } = await axios.get("/api/chat/get", {
      headers: { Authorization: token },
    });

    const chat = data?.chats?.[0];
    if (!chat?._id) {
      throw new Error("Unable to create chat");
    }

    setSelectedChat(chat);
    return chat._id;
  };

  const onGenerateImage = async (e) => {
    try {
      e.preventDefault();

      if (generating) return;

      const promptText = prompt.trim();
      if (!promptText) return;

      if (!user) {
        return toast.error("Please login to continue");
      }

      setGenerating(true);
      setPrompt("");

      const chatId = await ensureChatForGeneration();

      const { data } = await axios.post(
        "/api/message/image",
        {
          chatId,
          prompt: promptText,
          isPublished: true,
        },
        { headers: { Authorization: token } },
      );

      if (!data.success) {
        toast.error(data.message);
        setPrompt(promptText);
        return;
      }

      if (typeof data.remainingCredits === "number") {
        setUser((prev) => (prev ? { ...prev, credits: data.remainingCredits } : prev));
      } else {
        setUser((prev) => (prev ? { ...prev, credits: prev.credits - 2 } : prev));
      }

      if (data.reply?.content) {
        setImages((prev) => [
          {
            imageUrl: data.reply.content,
            userName: user.name,
            timestamp: data.reply.timestamp || Date.now(),
          },
          ...prev,
        ]);
      }

      toast.success("Image generated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchCommunityFeed();
  }, []);

  const activeCount = useMemo(() => {
    return activeTab === "image" ? images.length : texts.length;
  }, [activeTab, images.length, texts.length]);

  if (loading) return <Loading />;

  return (
    <div className="p-6 pt-12 xl:px-12 2xl:px-20 w-full mx-auto h-full overflow-y-scroll">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Community
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Generate images and browse published image/text generations
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-gray-300 dark:border-white/20 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              activeTab === "image"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-700 dark:text-gray-200"
            }`}
          >
            Image Generation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              activeTab === "text"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-700 dark:text-gray-200"
            }`}
          >
            Text Generation
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        {activeCount} {activeTab === "image" ? "image" : "text"} posts
      </p>

      {activeTab === "image" ? (
        <>
          <div className="mb-6 rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 p-4 md:p-5">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
              Create an image
            </p>
            <form onSubmit={onGenerateImage} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="flex-1 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent px-4 py-2.5 text-sm outline-none"
                disabled={generating}
                required
              />
              <button
                type="submit"
                disabled={generating}
                className="rounded-xl bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 text-sm disabled:opacity-60"
              >
                {generating ? "Generating..." : "Generate"}
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Images generated here are published to community. Cost: 2 credits.
            </p>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              {images.map((image, index) => (
                <div
                  key={`${image.imageUrl}-${index}`}
                  className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-white/15 shadow-sm"
                >
                  <img
                    src={image.imageUrl}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <p className="absolute bottom-0 right-0 text-xs bg-black/55 text-white px-3 py-1 rounded-tl-xl">
                    {image.userName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
              No published images yet.
            </div>
          )}
        </>
      ) : texts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {texts.map((item, index) => (
            <div
              key={`${item.timestamp}-${index}`}
              className="rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 p-4"
            >
              <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
                {item.text.length > 280 ? `${item.text.slice(0, 280)}...` : item.text}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Generated by {item.userName}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
          No published text generations yet.
        </div>
      )}
    </div>
  );
};

export default Community;
