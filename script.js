async function loadData() {
  const address = document.getElementById("wallet").value;
  const result = document.getElementById("result");

  result.innerHTML = "Loading...";

  const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    result.innerHTML = "";

    data.result.slice(0, 10).forEach(tx => {
      result.innerHTML += `
        <div class="tx">
          <p>Hash: ${tx.hash}</p>
          <p>From: ${tx.from}</p>
          <p>To: ${tx.to}</p>
          <p>Value: ${tx.value}</p>
        </div>
      `;
    });

  } catch (err) {
    result.innerHTML = "Error loading data";
  }
}