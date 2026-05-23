import { JON_KNOWLEDGE } from "./jon-knowledge.mjs";

const SYSTEM_PROMPT = `
You are a conversational version of Jon Searle for his portfolio website.
Answer in first person as Jon, but do not claim to be the human Jon.
Be concise, specific, warm, and commercially aware.
Return plain text only. Do not use Markdown, headings, asterisks, numbered lists, or long bullet lists.
Keep most answers brief: one short paragraph, 2 to 3 sentences, under 65 words, unless the user asks for more detail.
Ground answers in this known profile:
- Jon Searle is a Designer and Product Manager with 20+ years of experience.
- He has created digital experiences for brands including Apple, BBC, and Samsung.
- He specialises in AI-enabled design, rapid prototyping, digital innovation, user research, design strategy, visual design, and branding.
- He is open to senior design roles.
If asked for unknown details, say what you can answer from the available profile and invite a more specific question.
`;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getDemoReply(question) {
  const normalizedQuestion = question.toLowerCase();

  if (normalizedQuestion.includes("experience")) {
    return "The chat interface is running in demo mode until an OpenAI API key is added. I am a designer and product leader with 20+ years of experience creating digital experiences for brands including Apple, BBC and Samsung, with a current focus on AI-enabled design, rapid prototyping and digital innovation.";
  }

  if (normalizedQuestion.includes("approach") || normalizedQuestion.includes("design")) {
    return "The chat interface is running in demo mode until an OpenAI API key is added. My approach blends behavioural insight, product strategy and rapid prototyping, so ideas become tangible quickly and can be tested against real user and business needs.";
  }

  return "The chat interface is running in demo mode until an OpenAI API key is added. You can ask about my product design experience, AI prototyping, research process, design leadership, brand systems or senior design roles.";
}

function extractOutputText(responseBody) {
  if (typeof responseBody.output_text === "string") {
    return responseBody.output_text.trim();
  }

  if (!Array.isArray(responseBody.output)) {
    return "";
  }

  return responseBody.output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}

function cleanReply(reply) {
  return reply
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages
    .filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    )
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 1600),
    }));
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  let payload;

  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON payload" });
  }

  const messages = normalizeMessages(payload.messages);
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? "";

  if (!messages.length || !lastUserMessage) {
    return jsonResponse(400, { error: "A user message is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonResponse(200, {
      reply: getDemoReply(lastUserMessage),
      mode: "demo",
    });
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: `${SYSTEM_PROMPT}\n\n${JON_KNOWLEDGE}`,
        input: messages,
        max_output_tokens: 220,
      }),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      return jsonResponse(response.status, {
        error:
          responseBody.error?.message ??
          "OpenAI could not generate a reply for this message.",
      });
    }

    const reply = cleanReply(extractOutputText(responseBody));

    return jsonResponse(200, {
      reply:
        reply ||
        "I could not produce a reply for that. Try asking the question another way.",
      model,
    });
  } catch {
    return jsonResponse(502, {
      error: "The interview assistant is temporarily unavailable.",
    });
  }
};
