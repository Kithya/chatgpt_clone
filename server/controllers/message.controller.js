// Text-based AI chat message controller

import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ _id: chatId, userId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };
    res.json({ success: true, reply });

    chat.messages.push(reply);

    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Image-based AI chat message controller
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // check credits
    if (req.user.credits < 2) {
      return res.status(400).json({
        success: false,
        message: "You dont have enough credits to use this feature",
      });
    }

    const { chatId, prompt, isPublished } = req.body;

    // find chat
    const chat = await Chat.findOne({ _id: chatId, userId });

    // add message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    
  } catch (error) {}
};
