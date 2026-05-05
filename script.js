async function loadData() {
  const address = document.getElementById("wallet").value.trim();
  const result = document.getElementById("result");
  const summaryBox = document.getElementById("summary");
  const insightBox = document.getElementById("insight");

  // ❗ VALIDASI
  if (!address || !address.startsWith("0x")) {
    result.innerHTML = "❌ Enter valid wallet address";
    return;
  }

  result.innerHTML = "⏳ Loading...";
  summaryBox.innerHTML = "";
  insightBox.innerHTML = "";

  const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.result || data.result.length === 0) {
      result.innerHTML = "⚠️ No transactions found";
      return;
    }

    // 🔧 HELPER
    const shortAddr = (addr) =>
      addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "N/A";

    const formatETH = (value) =>
      (value / 1e18).toFixed(4);

    // 🔍 ANALYSIS
    let total = data.result.length;
    let incoming = 0;
    let outgoing = 0;

    data.result.forEach(tx => {
      if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
        incoming++;
      } else {
        outgoing++;
      }
    });

    // 📊 SUMMARY
    summaryBox.innerHTML = `
      <h3>📊 Wallet Summary</h3>
      <p><b>Total TX:</b> ${total}</p>
      <p><b>Incoming:</b> ${incoming}</p>
      <p><b>Outgoing:</b> ${outgoing}</p>
    `;

    // 🤖 AI ANALYSIS
    insightBox.innerHTML = "🤖 Running AI analysis...";

    const aiResult = await getAIInsight({ total, incoming, outgoing });

    // 🎨 COLOR BASED ON RISK
    const riskColor = getRiskColor(aiResult);

    insightBox.innerHTML = `
      <h3>🤖 AI Analysis</h3>
      <pre style="color:${riskColor}">${aiResult}</pre>
    `;

    // 📜 TRANSACTIONS
    result.innerHTML = "";

    data.result.slice(0, 10).forEach(tx => {
      result.innerHTML += `
        <div class="tx">
          <p><b>Hash:</b> ${tx.hash.slice(0, 10)}...</p>
          <p><b>From:</b> ${shortAddr(tx.from)}</p>
          <p><b>To:</b> ${shortAddr(tx.to)}</p>
          <p class="glow"><b>Value:</b> ${formatETH(tx.value)} ETH</p>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    result.innerHTML = "❌ Error loading data";
  }
}


// 🤖 AI ENGINE
async function getAIInsight(summary) {
  const apiKey = "PASTE_API_KEY_KAMU";

  const prompt = `
You are an expert onchain analyst AI.

Analyze this wallet:

Total transactions: ${summary.total}
Incoming: ${summary.incoming}
Outgoing: ${summary.outgoing}

Return:

Insight: (1 short sentence)
Type: (Trader / Holder / Bot / Normal)
Risk: (Low / Medium / High)
Score: (0-100)
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No AI insight";

  } catch (err) {
    return "AI unavailable";
  }
}


// 🎨 RISK COLOR
function getRiskColor(text) {
  if (!text) return "white";

  const t = text.toLowerCase();

  if (t.includes("high")) return "red";
  if (t.includes("medium")) return "orange";
  if (t.includes("low")) return "lightgreen";

  return "white";
}