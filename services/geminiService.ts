
import { GoogleGenAI, Type } from "@google/genai";
import { DesignSystem, VisualConcept, Color, TypographySuggestion } from "../types";

// Helper to create client instance
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const designSchema = {
  type: Type.OBJECT,
  properties: {
    themeName: { type: Type.STRING, description: "A catchy name for this design theme" },
    vibeDescription: { type: Type.STRING, description: "A short, evocative description of the aesthetic" },
    visualConcepts: {
      type: Type.ARRAY,
      description: "Generate the requested number of distinct visual concepts.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prompt: { type: Type.STRING, description: "A highly detailed prompt for generating a high-fidelity UI mockup." }
        },
        required: ["title", "description", "prompt"]
      }
    },
    colors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING },
          name: { type: Type.STRING },
          usage: { type: Type.STRING },
        },
        required: ["hex", "name", "usage"],
      },
    },
    typography: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          family: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Serif', 'Sans-serif', 'Display', 'Monospace', 'Handwriting'] },
          usage: { type: Type.STRING, enum: ['Heading', 'Body', 'Accent'] },
          description: { type: Type.STRING },
        },
        required: ["family", "type", "usage", "description"],
      },
    },
    layoutTips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
  },
  required: ["themeName", "vibeDescription", "visualConcepts", "colors", "typography", "layoutTips"],
};

export const generateDesignSystem = async (
  userPrompt: string, 
  attachment?: { mimeType: string; data: string },
  sketchImage?: string,
  baseTheme?: { colors: Color[], typography: TypographySuggestion[] }
): Promise<DesignSystem> => {
  const ai = getAIClient();
  
  let instructions = "You are a master UI/UX designer. Create a professional design system.";
  
  if (baseTheme) {
    instructions += `
      STRICT REQUIREMENT: You MUST reuse the following visual identity exactly. 
      COLORS: ${JSON.stringify(baseTheme.colors)}
      TYPOGRAPHY: ${JSON.stringify(baseTheme.typography)}
      Do not invent new hex codes or font families. Adapt the layout and visual concepts to the new prompt using this identity.
    `;
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

  if (!response.text) throw new Error("EMPTY_RESPONSE");
  return JSON.parse(response.text) as DesignSystem;
};

export const generateConceptImages = async (concepts: VisualConcept[]): Promise<string[]> => {
  const ai = getAIClient();
  const imagePromises = concepts.map(async (concept) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional UI design: ${concept.title}. ${concept.prompt}. Clean, minimalist design mockup.` }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9" },
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  });

  const results = await Promise.all(imagePromises);
  return results.filter((url): url is string => url !== null);
};

export const editConceptImage = async (base64Url: string, editPrompt: string): Promise<string | null> => {
  const ai = getAIClient();
  
  // Extract base64 data and mime type
  const match = base64Url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const data = match[2];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType, data } },
        { text: `Edit this UI mockup based on this request: ${editPrompt}. Maintain consistent branding.` }
      ],
    },
    config: {
      imageConfig: { aspectRatio: "16:9" },
    },
  });

  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};
