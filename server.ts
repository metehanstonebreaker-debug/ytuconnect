import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK safely (using environment variables)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// systemInstruction for YTÜ Assistant
const SYSTEM_INSTRUCTION = `
Sen Yıldız Connect uygulamasının yapay zeka destekli akıllı kampüs asistanısın. Adın Yıldız Asistan.
Yıldız Teknik Üniversitesi (YTÜ) öğrencilerine yardımcı olmak, kampüs hayatı, dersler, kulüpler, ulaşım (Davutpaşa ring saatleri) hakkında bilgi vermek için tasarlandın.

KRİTİK TARZ KURALLARI (KISA, ÖZ VE ESPRİLİ):
1. Cevapların HER ZAMAN çok kısa, öz ve net olmalı. En fazla 2 kısa paragraf veya 3-4 maddelik kısa listeler halinde cevap ver. Asla uzun paragraflar yazma, gereksiz tüm detayları ele.
2. Esprili, eğlenceli ve mizahi bir üniversiteli dili kullan. YTÜ klişelerine (bitmeyen ring sırası, dondurucu Davutpaşa rüzgarı, kritik anlarda çöken USIS, Beşiktaş-Davutpaşa kampüs çekişmeleri) ince espri ve şakalarla dokundur.
3. Samimi ve enerjik ol. YTÜ jargonuna hakim bir "üst dönem" gibi konuş ("orta bahçe", "tarihi hamam", " ring", "USIS").
4. Markdown formatını (kalın yazılar, emojiler) çok ölçülü ve okumayı kolaylaştıracak şekilde kullan.
5. Kullanıcının bölümünü, ilgi alanlarını ve kulüplerini biliyorsan, esprileri ve yanıtları doğrudan bunlara bağla!
6. Türkçe konuş.
`;

// API Route for chatbot interaction
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, preferences } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Mesaj alanı boş olamaz." });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ 
        text: "Merhaba! Ben Yıldız Asistan. Şu anda sistemde **GEMINI_API_KEY** tanımlı olmadığı için demo modunda çalışıyorum. Sizlerle sohbet edebilmem için lütfen sağ üstteki **Ayarlar > Secrets** panelinden Gemini API anahtarınızı girin!\n\n**Kampüs İpucu:** Davutpaşa Ring Seferleri her 10 dakikada bir kalkmaktadır!" 
      });
    }

    // Format history for Google GenAI SDK if any
    // We can use simple generateContent with system instruction and the context of the user's preferences.
    const userContext = preferences 
      ? `\n\n[Kullanıcı Bilgileri: Bölüm: ${preferences.department}, Öğrenci No: ${preferences.studentId || 'Bilinmiyor'}, İlgi Alanları: ${preferences.interestedFields?.join(", ") || 'Yok'}, Kulüpler: ${preferences.interestedClubs?.join(", ") || 'Yok'}]`
      : '';

    // Let's build the chat messages
    const formattedContents = [];
    
    // Add history if any
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    
    // Append the current message with user context
    formattedContents.push({
      role: "user",
      parts: [{ text: message + userContext }]
    });

    // Use gemini-3.5-flash as the standard model for quick chat tasks
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Üzgünüm, şu anda yanıt oluşturamıyorum. Lütfen tekrar dener misiniz?";
    res.json({ text: reply });

  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ 
      error: "Yapay zeka asistanı ile bağlantı kurulurken bir hata oluştu.",
      details: error.message 
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
