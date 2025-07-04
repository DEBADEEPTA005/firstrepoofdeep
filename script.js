const currencySelect = document.getElementById("currency-select");
const amountInput = document.getElementById("inr-amount");
const resultBox = document.getElementById("result");

async function getExchangeRate(toCurrency) {
  const res = await fetch(`https://api.exchangerate.host/latest?base=INR&symbols=${toCurrency}`);
  const data = await res.json();
  return data.rates[toCurrency];
}

document.getElementById("converter-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  let rawInput = amountInput.value.trim();
  if (!rawInput) {
    resultBox.textContent = "Please enter a value.";
    return;
  }

  // Convert words to number
  try {
    if (isNaN(rawInput)) {
      rawInput = wordsToNumbers(rawInput);
    }
  } catch (err) {
    resultBox.textContent = "Invalid number or format.";
    return;
  }

  const amount = parseFloat(rawInput);
  if (!amount || amount <= 0) {
    resultBox.textContent = "Enter a valid positive amount.";
    return;
  }

  const toCurrency = currencySelect.value;
  const rate = await getExchangeRate(toCurrency);
  if (!rate) {
    resultBox.textContent = `Rate for ${toCurrency} not available.`;
    return;
  }

  const converted = amount * rate;

  const amountWords = numWords(amount);
  const resultWords = numWords(converted);

  resultBox.innerHTML = `
    <strong>INR:</strong> ₹${amount.toLocaleString()} <em>(${amountWords})</em><br/>
    <strong>${toCurrency}:</strong> ${converted.toLocaleString(undefined, {maximumFractionDigits: 6})} <em>(${resultWords})</em>
  `;
});