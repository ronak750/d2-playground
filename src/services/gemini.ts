import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert at creating D2 diagrams. 
Your task is to generate D2 script based on the user's request.
D2 is a declarative language for turning text into diagrams.

Rules:
1. ONLY return the D2 script. Do not include any explanations, markdown code blocks (like \`\`\`d2 or \`\`\`), or preamble.
2. If an existing script is provided, update it according to the user's new instructions while maintaining the existing structure where possible.
3. Use clear labels and appropriate shapes (e.g., person, cloud, cylinder for database, etc.).
4. Focus on clarity and professional layout.

Example D2 syntax:
User: {
  shape: person
}
Cloud: {
  API Server: {
    shape: circle
  }
}
User -> Cloud.API Server: Request
`;

export async function generateD2Script(prompt: string, existingScript?: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let fullPrompt = SYSTEM_PROMPT;
  if (existingScript) {
    fullPrompt += "\n\nExisting D2 script:\n" + existingScript + "\n\nUpdate this script based on: " + prompt;
  } else {
    fullPrompt += "\n\nGenerate a new D2 script based on: " + prompt;
  }

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  let text = response.text().trim();
  
  // Clean up any markdown code blocks if the model ignored the system prompt rule
  text = text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
  
  return text;
}
