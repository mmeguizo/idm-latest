const mongoose = require("mongoose");
const { Schema } = mongoose;

const aiChat = new Schema(
  {
    user: String,
    prompt: String,
    responseAi: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("aiChat", aiChat);

/*
require("dotenv").config(); // Load environment variables from .env file
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiDb = require("../models/ais");

// Store chat history for each user (e.g., in-memory using a Map)
const chatHistories = new Map(); 

module.exports = (router) => {
    router.get("/chat-with-gemini", async (req, res) => {
        try {
            const model = genAI.getGenerativeModel({
                // ... (safetySettings)
            });

            const userId = "test"; // Replace with a way to identify unique users
            let chatHistory = chatHistories.get(userId) || []; // Get user's chat history

            const userMessage = req.query.message || req.body.message;
            if (!userMessage) {
                return res.status(400).json({ error: "Missing message in request" });
            }

            // Add user's message to history
            chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

            // Start or continue chat based on existing history
            const chat = chatHistory.length === 0
                ? model.startChat({ history: chatHistory }) // Start new chat
                : model.continueChat({ chatId: userId, history: chatHistory }); // Continue existing chat
            
            const result = await chat.sendMessage(userMessage);
            const responseText = result.response.text();

            // Add model's response to history
            chatHistory.push({ role: "model", parts: [{ text: responseText }] });
            chatHistories.set(userId, chatHistory); // Update stored history

            let aiSave = aiDb.create({
                user: userId,
                prompt: userMessage, // Save the user's message directly as the prompt
                responseAi: responseText,
            });

            if (aiSave) {
                res.json({ response: responseText });
            }
        } catch (error) {
            // ... (error handling)
        }
    });

    return router;
};


*/
