import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for live SKS menu data
let cachedMenuData: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours cache duration

// HTML cleaner helper for Gemini
function cleanHtmlForAi(html: string): string {
  let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
  clean = clean.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  clean = clean.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  clean = clean.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  clean = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.slice(0, 15000); // Guard token length limit
}

// Live Yemekhane Scraping & AI Parsing Endpoint
app.get("/api/yemekhane", async (req, res) => {
  try {
    const now = Date.now();
    // Use cached data if fresh
    if (cachedMenuData && (now - lastCacheTime < CACHE_TTL)) {
      console.log("Serving Yemekhane menu from cache.");
      return res.json({ success: true, isCached: true, menu: cachedMenuData });
    }

    console.log("Fetching live YTÜ SKS Yemekhane menu...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    let htmlText = "";
    try {
      const sksRes = await fetch("https://sks.yildiz.edu.tr/sks/4/Yemek-Listesi/1", {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      clearTimeout(timeoutId);

      if (sksRes.ok) {
        htmlText = await sksRes.text();
      } else {
        console.warn(`SKS returned status code: ${sksRes.status}`);
      }
    } catch (fetchErr: any) {
      console.warn("Could not fetch live SKS page, will try database/fallback:", fetchErr.message || fetchErr);
    }

    if (!htmlText) {
      return res.json({ 
        success: false, 
        source: "fallback", 
        message: "SKS Resmi sitesine şu an erişilemiyor veya IP engeli mevcut." 
      });
    }

    const cleanedContent = cleanHtmlForAi(htmlText);
    const ai = getAiClient();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({ 
        success: false, 
        source: "fallback", 
        message: "Gemini API anahtarı tanımlı olmadığı için canlı veri çözümlenemedi." 
      });
    }

    const prompt = `
Aşağıda Yıldız Teknik Üniversitesi SKS Yemek Menüsü web sayfasından çekilmiş ham metin bulunmaktadır.
SKS Yemek Menüsü sayfasında genellikle "ÖĞRENCİ YEMEK MENÜSÜ" (Öğrenci Menüsü) ve "PERSONEL YEMEK MENÜSÜ" (Personel/Akademik/İdari Menüsü) şeklinde iki ayrı liste bulunur.
Ayrıca, Öğrenci Yemek Menüsü içerisinde hem ÖĞLE (sabah/öğlen servisi) hem de AKŞAM (akşam servisi) için ayrı veya ortak yemek listeleri bulunabilir.

Sen KESİNLİKLE VE SADECE ÖĞRENCİ yemek menüsünü (öğrenciye sunulan yemekleri) seçeceksin. Personel yemek listesini tamamen göz ardı et! 
Öğrenci menüsünden hem ÖĞLE (Öğlen Yemeği) hem de AKŞAM (Akşam Yemeği) menülerini akıllıca çıkar ve kesinlikle sadece JSON formatında döndür.

Döndüreceğin JSON şeması tam olarak şu formatta olmalıdır:
{
  "YYYY-MM-DD": {
    "dayName": "Günün adı (örn: Pazartesi)",
    "ogle": {
      "soup": "Öğlen çorba adı (örn: Süzme Mercimek Çorbası)",
      "main": "Öğlen ana yemek adı (örn: İzmir Köfte)",
      "side": "Öğlen yardımcı yemek adı (örn: Tereyağlı Pirinç Pilavı)",
      "dessert": "Öğlen tatlı, meyve, yoğurt veya içecek adı (örn: Supangle)",
      "calories": 920,
      "vegetarianAlt": "Öğlen vejetaryen alternatifi (örn: Sebze Sote)"
    },
    "aksam": {
      "soup": "Akşam çorba adı (örn: Ezogelin Çorbası)",
      "main": "Akşam ana yemek adı (örn: Fırın Tas Kebabı)",
      "side": "Akşam yardımcı yemek adı (örn: Sebzeli Bulgur Pilavı)",
      "dessert": "Akşam tatlı, meyve, yoğurt veya içecek adı (örn: Mevsim Salatası)",
      "calories": 890,
      "vegetarianAlt": "Akşam vejetaryen alternatifi (örn: Zeytinyağlı Fasulye)"
    }
  }
}

Kurallar:
1. Kesinlikle sadece ÖĞRENCİ menüsünü baz al. Personel yemeklerini listeye karıştırma.
2. Eğer web sayfasında Öğlen ve Akşam menüleri ayrı belirtilmişse, onları "ogle" ve "aksam" altına ayrı ayrı yerleştir.
3. Eğer web sayfasında Öğlen ve Akşam menüleri tek bir liste olarak verilmişse veya ayrı ayrı belirtilmemişse, aynı menüyü hem "ogle" hem "aksam" nesnelerine kopyala.
4. Tarihleri kesinlikle YYYY-MM-DD formatında (örn: 2026-06-30 veya 2026-07-01) anahtar olarak kullan. Güncel yılı kullan.
5. Yalnızca geçerli bir JSON döndür. JSON bloğunu \`\`\`json ve \`\`\` arasına koy veya doğrudan ham JSON string döndür. Başka açıklama metni ekleme.

SKS Ham İçeriği:
${cleanedContent}
`;

    let aiRes;
    let lastError;
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting Yemekhane parsing with model: ${modelName}`);
        aiRes = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        if (aiRes && aiRes.text) {
          console.log(`Successfully parsed Yemekhane using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Error parsing Yemekhane with model ${modelName}:`, err.message || err);
        lastError = err;
      }
    }

    if (aiRes && aiRes.text) {
      const parsed = JSON.parse(aiRes.text.trim());
      cachedMenuData = parsed;
      lastCacheTime = now;
      console.log("Successfully scraped, parsed and cached SKS Yemekhane menu!");
      return res.json({ success: true, source: "live-sks", menu: parsed });
    }

    throw lastError || new Error("Gemini empty response or all models experiencing high demand");
  } catch (error: any) {
    console.error("Yemekhane SKS API parser error:", error);
    res.status(200).json({ 
      success: false, 
      source: "fallback", 
      error: error.message || "İçerik çözümlenemedi." 
    });
  }
});

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

    // Use gemini-3.5-flash as the standard model with fallback to other models if it fails (e.g. due to high demand)
    let response;
    let lastError;
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting chat generation with model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          console.log(`Successfully generated content using model: ${modelName}`);
          break; // Break loop if we got a successful response
        }
      } catch (err: any) {
        console.error(`Error with model ${modelName}:`, err.message || err);
        lastError = err;
        // Continue to next model
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Hiçbir yapay zeka modeli yanıt vermedi.");
    }

    const reply = response.text;
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
