import Chat from "../models/Chat.js";

// API controller for creating chat
export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const chatData = {
      userId,
      userName: req.user.name,
      name: "New Chat",
      messages: [],
    };

    await Chat.create(chatData);

    return res.json({ success: true, message: "Chat created" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API controller for getting all chats
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    return res.json({ success: true, chats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API controller for deleting chat
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.body;

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });

    return res.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
