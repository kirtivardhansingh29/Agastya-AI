import * as aiRiskService from '../services/aiRiskService.js';
import { chatWithArun } from '../services/arunChatService.js';

export async function analyzeMineHandler(req, res) {
  try {
    const { mineId } = req.body || {};
    if (!mineId) {
      return res.status(400).json({
        success: false,
        error: { message: "Field 'mineId' is required in JSON request body" }
      });
    }

    const result = await aiRiskService.analyzeMineRisk(mineId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in analyzeMineHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to generate AI mine risk analysis" }
    });
  }
}

/**
 * POST /api/arun/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }, ...] }
 * Conversational endpoint for Arun, the Agastya AI coal-mining assistant.
 */
export async function arunChatHandler(req, res) {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Field 'messages' (non-empty array) is required in JSON request body" }
      });
    }

    const reply = await chatWithArun(messages);
    res.json({
      success: true,
      data: { reply }
    });
  } catch (error) {
    console.error("Error in arunChatHandler:", error.message);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Arun failed to respond" }
    });
  }
}
