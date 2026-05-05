// 🔑 CONFIG (WAJIB ISI)
const BASESCAN_API_KEY = "XH98XIQ5NYNWG7Y91JCKFD4TUYTTH4143W";

// 🚀 MAIN FUNCTION
async function loadData() {
  const address = document.getElementById("wallet").value.trim();
  const result = document.getElementById("result");
  const summaryBox = document.getElementById("summary");
  const insightBox = document.getElementById("insight");

  // ❗ VALIDASI
  if (!address || !address.startsWith("0x") || address.length < 10) {
    result.innerHTML = "❌ Please enter a valid wallet address";
    return;
  }

  // 🔄 RESET UI
  result.innerHTML = "⏳ Loading transactions...";
  summaryBox.innerHTML = "";
  insightBox.innerHTML = "🤖 Preparing AI analysis...";

  const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${BASESCAN_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // ❗ HANDLE ERROR BASESCAN
    if (!data || data.status === "0") {
      result.innerHTML = "⚠️ Failed to fetch data (check API key)";
      insightBox.innerHTML = "";
      return;
    }

    if (!data.result || data.result.length === 0) {
      result.innerHTML = "⚠️ No transactions found";
      insightBox.innerHTML = "";
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
    insightBox.innerHTML = "🤖 Analyzing wallet with AI...";

    const aiText = await getAIInsight({
      total,
      incoming,
      outgoing
    });

    const riskColor = getRiskColor(aiText);

    insightBox.innerHTML = `
      <h3>🤖 AI Analysis</h3>
      <pre style="color:${riskColor}">${aiText}</pre>
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
    insightBox.innerHTML = "⚠️ AI unavailable";
  }
}


// 🤖 AI FUNCTION (SAFE BACKEND)
async function getAIInsight(summary) {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(summary)
    });

    if (!res.ok) {
      return "⚠️ AI request failed";
    }

    const data = await res.json();

    if (!data.result) {
      return "⚠️ No AI insight returned";
    }

    return data.result;

  } catch (err) {
    console.error("AI error:", err);
    return "❌ AI unavailable";
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