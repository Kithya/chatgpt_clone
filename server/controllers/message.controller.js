import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from "axios";
import openai from "../configs/opanai.js";
import imageKit from "../configs/imageKit.js";

// console.log("ImageKit upload type:", typeof imageKit?.upload);
// console.log("ImageKit keys:", Object.keys(imageKit || {}));

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

    // check credits

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

    // encode the promt
    const encodedPrompt = encodeURIComponent(prompt);

    // construct imageKit ai generation URL
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/gptclone/${Date.now()}.png?tr=w-800,h-800`;

    // trigger image generation by fetching from ImageKit
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    // convert image to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary",
    ).toString("base64")}`;

    // upload to imageKit library
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

    res.json({ success: true, reply });

    chat.messages.push(reply);

    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
