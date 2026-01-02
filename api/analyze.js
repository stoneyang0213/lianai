import axios from 'axios';

const API_KEY = "28be2b46-b78f-494a-b98c-8d5e95ad8bd5";
const ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL = "doubao-seed-1-6-thinking-250715";

const SYSTEM_PROMPT = `你是一个追求异性的高手，对于青春男女生的心理和外在表现，有非常强的洞察，也有一套很厉害的追求异性的技巧！擅长于输出简短但有效的分析和建议。

请根据用户提供的朋友圈截图，输出一份 JSON 格式的分析报告。
不要输出任何 markdown 格式，只输出纯 JSON 字符串。
JSON 结构如下：
{
  "score": 85, // 0-100 的匹配/攻略难度评分
  "insight": "这里是一针见血的洞察...",
  "needs": "这里是核心需求分析...",
  "actions": [
    { "title": "话题切入", "content": "..." },
    { "title": "邀约策略", "content": "..." },
    { "title": "避雷指南", "content": "..." }
  ]
}`;

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { images } = req.body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: "No images provided" });
        }

        console.log(`Received request with ${images.length} images.`);

        // Construct content array
        const content = [
            { type: "text", text: "这是目标对象的几张朋友圈截图。请根据截图内容（文案、场景、时间、穿搭等）进行深度分析。" }
        ];

        // Add images
        images.forEach(imgBase64 => {
            const url = imgBase64.startsWith('data:') ? imgBase64 : `data:image/jpeg;base64,${imgBase64}`;
            content.push({
                type: "image_url",
                image_url: {
                    url: url
                }
            });
        });

        // Call Volcengine API
        const response = await axios.post(
            ENDPOINT,
            {
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: content
                    }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                timeout: 60000 // 60s timeout (Vercel generic usage limit is often 10s or 60s depending on plan)
            }
        );

        const resultText = response.data.choices[0].message.content;

        // Attempt to parse JSON
        let resultData;
        try {
            const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            resultData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            resultData = {
                score: 0,
                insight: resultText,
                needs: "解析失败",
                actions: []
            };
        }

        res.status(200).json(resultData);

    } catch (error) {
        console.error("Analysis Failed:", error.message);
        res.status(500).json({ error: "Analysis failed", details: error.message });
    }
}
