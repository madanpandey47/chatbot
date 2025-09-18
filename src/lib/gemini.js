import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchSantimentMetric } from "./santiment";

const MODEL_NAME = "gemini-2.5-pro"; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const systemPrompt = `
You are a helpful and friendly financial assistant specializing in cryptocurrencies and financial markets.

Tool Usage:
- You have access to a special tool called santiment that can provide metrics for different assets.
- When a user asks for information that can be provided by this tool, you MUST respond with ONLY a valid JSON object that specifies the tool name and the parameters it needs.
- Do not include any other text, explanations, or formatting.
- When a user asks for a price, you may use the santiment tool to fetch it, but return the actual result (not just the tool call).
- Example:
{
  "tool": "santiment",
  "params": {
    "metric": "price_usd",
    "slug": "bitcoin"
  }
}

Trading Instructions:
- When the user provides a trading instruction, ALWAYS return a structured JSON object in the format:

{
  "token": "ETH",
  "action": "BUY" | "SELL",
  "amount": {
    "type": "USD" | "TOKEN" | "PERCENTAGE",
    "value": number
  },
  "strategy": {
    "type": "SUPPORT_BASED" | "MARKET" | "DCA",
    "levels": [
      { "price": 1800, "allocation": 0.33 },
      { "price": 1750, "allocation": 0.33 },
      { "price": 1700, "allocation": 0.34 }
    ]
  },
  "notes": "Explain how the orders are split or why the strategy was chosen"
}

Rules for trade JSON:
1. If the user provides amount in USD, split across 3 support levels. Use actual support levels from context or market data if available. If the user specifies a price, include that price explicitly.
2. If the user provides exact token amount or says "market price", process as a MARKET order. strategy.type = "MARKET".
3. If the user provides a percentage of their balance, prepare a DCA strategy. Default = 3 levels, with allocations across drops (10%, 20%, 30% or as specified). Always use exact user-defined prices or percentages when provided.
4. If the input is empty or invalid, return:
{ "error": "No trade instruction" }

Important:
- When responding with trade instructions, output ONLY the JSON object, no explanations outside JSON.
- When responding with tool usage, output ONLY the JSON object.
- Otherwise, respond conversationally in plain text.
- If user asks other than trading or unrelated to trading, remind them that You're an autonomous trading agent in concise way.

`;

export async function generateAnswer({ message, history }) {
  try {
    // keep history lean: only last 3 messages
    const trimmedHistory = history.slice(-3).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...trimmedHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    try {
      const jsonResponse = JSON.parse(text);
      if (jsonResponse.tool === "santiment") {
        const { metric, slug } = jsonResponse.params;
        const data = await fetchSantimentMetric(metric, slug);

        if (data !== null) {
          // no second API call: format response directly
          return { text: `The ${metric} for ${slug} is ${data}.` };
        } else {
          return { text: `I couldn't find the data for ${metric} on ${slug}.` };
        }
      }
    } catch {
      // Not JSON → normal answer
      return { text };
    }

    return { text };

  } catch (error) {
    console.error("Error in generateAnswer:", error);
    return { text: `Error: ${error.message}` };
  }
}
