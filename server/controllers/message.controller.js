import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from "axios";
import openai from "../configs/opanai.js";
import imageKit from "../configs/imageKit.js";

// Text-based AI chat message controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.credits < 1) {
      return res.status(400).json({
        success: false,
        message: "You dont have enough credits to use this feature",
      });
    }

    const { chatId, prompt } = req.body;
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

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

    chat.messages.push(reply);

    await chat.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -1 } },
      { new: true, select: "credits" },
    );

    res.json({ success: true, reply, remainingCredits: updatedUser?.credits });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Image-based AI chat message controller
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.credits < 2) {
      return res.status(400).json({
        success: false,
        message: "You dont have enough credits to use this feature",
      });
    }

    const { chatId, prompt, isPublished } = req.body;
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const encodedPrompt = encodeURIComponent(prompt);

    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/gptclone/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary",
    ).toString("base64")}`;

    const uploadResponse = await imageKit.files.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "gptclone",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    chat.messages.push(reply);

    await chat.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -2 } },
      { new: true, select: "credits" },
    );

    res.json({ success: true, reply, remainingCredits: updatedUser?.credits });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
