import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const ai = getAiClient();
    // Using gemini-3-pro-preview as requested for complex tasks
    const model = 'gemini-3-pro-preview';

    const chat = ai.chats.create({
      model: model,
      history: history, // Note: @google/genai history format might differ slightly, usually strictly content objects.
      config: {
        systemInstruction: "Sen ASLAN AVM'nin yardımsever, Türkçe konuşan yapay zeka asistanısın. Mağaza yönetimi, stok takibi ve genel muhasebe konularında uzmansın. Cevapların kısa, net ve profesyonel olmalı.",
      },
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Bir hata oluştu, cevap alınamadı.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Üzgünüm, şu anda hizmet veremiyorum. Lütfen API anahtarınızı kontrol edin.";
  }
};

export const analyzeImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    // Using gemini-3-pro-preview as requested for image analysis
    const model = 'gemini-3-pro-preview';

    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/png';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt || "Bu görseli analiz et ve perakende/stok yönetimi açısından ne içerdiğini Türkçe olarak açıkla.",
          },
        ],
      },
    });

    return response.text || "Görsel analiz edilemedi.";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "Görsel analizi sırasında bir hata oluştu.";
  }
};
