import { GoogleGenAI, Type } from "@google/genai";

// Schema giữ nguyên như cũ của bạn
const designSchema = {
  type: Type.OBJECT,
  properties: {
    themeName: { type: Type.STRING },
    vibeDescription: { type: Type.STRING },
    visualConcepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prompt: { type: Type.STRING }
        },
        required: ["title", "description", "prompt"]
      }
    },
    colors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, usage: { type: Type.STRING } },
        required: ["hex", "name", "usage"],
      },
    },
    typography: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          family: { type: Type.STRING },
          type: { type: Type.STRING },
          usage: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["family", "type", "usage", "description"],
      },
    },
    layoutTips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
        required: ["title", "description"],
      },
    },
  },
  required: ["themeName", "vibeDescription", "visualConcepts", "colors", "typography", "layoutTips"],
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // API Key được cấu hình ẩn trên Vercel
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { userPrompt, attachment, sketchImage, baseTheme } = req.body;

    let instructions = "You are a master UI/UX designer. Create a professional design system.";
    if (baseTheme) {
      instructions += `STRICT REQUIREMENT: You MUST reuse the following visual identity exactly. COLORS: ${JSON.stringify(baseTheme.colors)} TYPOGRAPHY: ${JSON.stringify(baseTheme.typography)}`;
    }

    const parts: any[] = [{ text: `Generate design for: ${userPrompt}` }];
    if (attachment) parts.push({ inlineData: attachment });
    if (sketchImage) {
      const base64Data = sketchImage.includes(',') ? sketchImage.split(',')[1] : sketchImage;
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: designSchema,
        systemInstruction: instructions,
      },
    });

    res.status(200).json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
}