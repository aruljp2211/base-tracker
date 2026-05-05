async function loadData() {
  const address = document.getElementById("wallet").value.trim();
  const result = document.getElementById("result");
  const summaryBox = document.getElementById("summary");
  const insightBox = document.getElementById("insight");

  if (!address) {
    result.innerHTML = "Please enter a wallet address";
    return;
  }

  result.innerHTML = "Loading...";
  summaryBox.innerHTML = "";
  insightBox.innerHTML = "";

  const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // ❗ VALIDASI DATA
    if (!data.result || data.result.length === 0) {
      result.innerHTML = "No transactions found";
      return;
    }

    result.innerHTML = "";

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

    // 🤖 INSIGHT
    let insight = "";
    if (total > 100) {
      insight = "Very high activity wallet 🚀🔥";
    } else if (total > 50) {
      insight = "High activity wallet 🚀";
    } else if (outgoing > incoming) {
      insight = "Likely active sender 💸";
    } else if (incoming > outgoing) {
      insight = "Receiving wallet 📥";
    } else {
      insight = "Normal usage wallet 👛";
    }

    // 📊 SUMMARY UI
    summaryBox.innerHTML = `
      <h3>📊 Wallet Summary</h3>
      <p><b>Total TX:</b> ${total}</p>
      <p><b>Incoming:</b> ${incoming}</p>
      <p><b>Outgoing:</b> ${outgoing}</p>
    `;

    // 🤖 INSIGHT UI
    insightBox.innerHTML = `
      <h3>🤖 AI Insight</h3>
      <p>${insight}</p>
    `;

    // 🧠 HELPER: SHORT ADDRESS
    function shortAddr(addr) {
      return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "N/A";
    }

    // 📜 TRANSACTION LIST
    data.result.slice(0, 10).forEach(tx => {
      const valueEth = (tx.value / 1e18).toFixed(4);

      result.innerHTML += `
        <div class="tx">
          <p><b>Hash:</b> ${tx.hash.slice(0, 12)}...</p>
          <p><b>From:</b> ${shortAddr(tx.from)}</p>
          <p><b>To:</b> ${shortAddr(tx.to)}</p>
          <p><b>Value:</b> ${valueEth} ETH</p>
        </div>
      `;
    });

  } catch (err) {
    result.innerHTML = "Error loading data ❌";
    console.error(err);
  }
}