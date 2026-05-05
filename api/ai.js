export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { total, incoming, outgoing } = req.body;

  const prompt = `
You are an expert onchain analyst AI.

Analyze this wallet:

Total transactions: ${total}
Incoming: ${incoming}
Outgoing: ${outgoing}

Return:

Insight: (1 short sentence)
Type: (Trader / Holder / Bot / Normal)
Risk: (Low / Medium / High)
Score: (0-100)
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    res.status(200).json({
      result: data.choices?.[0]?.message?.content || "No insight"
    });

  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
}