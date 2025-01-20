import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const conversationContext = `You are a friendly and helpful voice assistant. For your responses:
1. Keep them brief and concise 
2. Use natural, conversational language without any formatting
3. NEVER use asterisks, bullet points, bold text, or any markdown symbols
4. Present information in simple plain text only
5. Use commas and periods to separate points
6. Speak naturally as if having a conversation
7. Don't use any special characters use only plain text


For example, instead of using bullet points or asterisks, say: "Windows has wide hardware compatibility, an extensive software ecosystem, and is easy to use."

For comparisons, say: "Windows offers wide hardware compatibility and an extensive software ecosystem, while Mac provides better security and a more streamlined experience."

Always maintain a conversational tone and avoid any special characters or formatting.`;

let conversationHistory = [];

const getResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Format history for Gemini's expected structure
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 100,
      }
    });

    // Send the message with explicit formatting instructions
    const result = await chat.sendMessage(
      `${prompt}\n\nIMPORTANT: Respond in plain text only. Do not use any asterisks, bullet points, bold text, or special formatting. Use natural sentences with commas and periods.`
    );
    
    const response = result.response.text();
    
    // Update conversation history
    conversationHistory.push({ role: "user", text: prompt });
    conversationHistory.push({ role: "assistant", text: response });
    
    // Keep history manageable
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    return response;
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    throw error;
  }
};

const resetConversation = () => {
  conversationHistory = [];
};

export default {
  getResponse,
  resetConversation
};
