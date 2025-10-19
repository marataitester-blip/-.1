import { GoogleGenAI, Type, Modality } from "@google/genai";
import tarotDeck from "../constants/deck";
import { TarotCard } from "../types";

// The API key is read from the environment variable process.env.API_KEY.
// In this project's setup, it's provided by the execution environment, and we assume it's always available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface QuizResult {
  cardName: string;
  portrait: string;
}

export interface SpreadInterpretation {
  general: string;
  relationships: string;
  finance: string;
  health: string;
}

export const analyzeTextAndPickCard = async (userInput: string, lang: 'en' | 'ru'): Promise<QuizResult> => {
  const model = 'gemini-2.5-flash';
  
  // Fix: Define `cardNames` from the imported `tarotDeck` to be used in the prompt.
  const cardNames = tarotDeck.map(card => card.name.en).join(', ');
  
  const prompt = `
    Analyze the following text from a user. Based on their words, feelings, and the overall narrative, choose the ONE Tarot card that best represents their current state or situation from this list: [${cardNames}].
    
    After choosing the card, write a short, insightful, and supportive psychological portrait for the user in ${lang === 'ru' ? 'Russian' : 'English'}. The portrait should connect their text to the symbolism of the chosen card.
    
    User text: "${userInput}"
    
    Return the result in JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cardName: {
              type: Type.STRING,
              description: "The English name of the chosen Tarot card."
            },
            portrait: {
              type: Type.STRING,
              description: "The psychological portrait of the user."
            }
          },
          required: ["cardName", "portrait"]
        },
      },
    });

    const jsonString = response.text;
    const result: QuizResult = JSON.parse(jsonString);
    
    // Validate that the returned card name is one of the valid names
    const isValidCard = tarotDeck.some(card => card.name.en.toLowerCase() === result.cardName.toLowerCase());
    if (!isValidCard) {
      console.error("Gemini returned an invalid card name:", result.cardName);
      // Fallback to a random card or a default
      return {
          cardName: "The Fool",
          portrait: lang === 'ru' ? "Иногда, когда энергии смешиваются, путь начинается заново. Ваша история полна потенциала." : "Sometimes, when energies are mixed, the journey begins anew. Your story is full of potential."
      };
    }

    return result;

  } catch (error) {
    console.error("Error analyzing text with Gemini:", error);
    throw new Error("Failed to analyze text and pick a card.");
  }
};

export const generateCardImage = async (cardName: string, portrait: string): Promise<string> => {
    const model = 'imagen-4.0-generate-001';

    const prompt = `
        Create a tarot card image in a 'magical realism' style. The card is "${cardName}". 
        The theme is inspired by this psychological portrait: "${portrait}".
        The style should be deep, cosmic, and mystical, with a color palette of deep purples, blues, and accents of warm gold. 
        The image should be symbolic and evocative, not literal.
    `;

    try {
        const response = await ai.models.generateImages({
            model: model,
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image with Imagen:", error);
        throw new Error("Failed to generate card image.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const model = "gemini-2.5-flash-preview-tts";
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Using a voice that sounds dramatic and male, as requested.
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    return base64Audio;

  } catch (error) {
    console.error("Error generating speech with Gemini:", error);
    throw new Error("Failed to generate speech.");
  }
};


export const interpretSpread = async (cards: TarotCard[], spreadName: string, lang: 'en' | 'ru'): Promise<SpreadInterpretation> => {
  const model = 'gemini-2.5-flash';

  const cardDetails = cards.map(card => `${card.name.en}: ${card.longDescription.en}`).join('\n');

  const prompt = `
    You are a wise and insightful Tarot reader. Analyze the following Tarot spread: "${spreadName}".
    The cards drawn are:
    ${cardDetails}

    Based on the combination and interplay of these cards, provide a holistic interpretation. The tone should be supportive and empowering.
    First, give a general summary of the spread's message.
    Then, provide specific advice and insights for three key life areas: relationships, finance/career, and health/well-being.

    IMPORTANT: Each of the four sections (general, relationships, finance, health) must be a concise paragraph, limited to a maximum of five lines each.

    The entire response must be in ${lang === 'ru' ? 'Russian' : 'English'}.
    Return the result in JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            general: {
              type: Type.STRING,
              description: "A holistic, general interpretation of the entire spread, limited to a maximum of five lines."
            },
            relationships: {
              type: Type.STRING,
              description: "Specific advice and insights related to relationships, limited to a maximum of five lines."
            },
            finance: {
              type: Type.STRING,
              description: "Specific advice and insights related to finance and career, limited to a maximum of five lines."
            },
            health: {
              type: Type.STRING,
              description: "Specific advice and insights related to health and well-being, limited to a maximum of five lines."
            }
          },
          required: ["general", "relationships", "finance", "health"]
        },
      },
    });

    const jsonString = response.text;
    const result: SpreadInterpretation = JSON.parse(jsonString);
    return result;

  } catch (error) {
    console.error("Error interpreting spread with Gemini:", error);
    throw new Error("Failed to interpret the spread.");
  }
};