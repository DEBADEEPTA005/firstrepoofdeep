// 🔗 DOM Elements
const amountInput = document.getElementById("amount-input");
const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");

const resultNumber = document.getElementById("result-number");
const resultWords = document.getElementById("result-words");
const rateInfo = document.getElementById("rate-info");
const errorMessage = document.getElementById("error-message");

// 🔧 Populate currency dropdowns dynamically
const supportedCurrencies = ["INR", "USD", "GBP", "CNY", "CHF", "JPY"];

const currencyLabels = {
  INR: "🇮🇳 INR – Indian Rupee",
  USD: "🇺🇸 USD – US Dollar",
  GBP: "🇬🇧 GBP – British Pound",
  CNY: "🇨🇳 CNY – Chinese Yuan",
  CHF: "🇨🇭 CHF – Swiss Franc",
  JPY: "🇯🇵 JPY – Japanese Yen"
};

function populateCurrencyDropdowns() {
  // Clear existing options (in case function runs more than once)
  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";

  supportedCurrencies.forEach(code => {
    const option1 = document.createElement("option");
    option1.value = code;
    option1.textContent = currencyLabels[code];
    fromCurrency.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = code;
    option2.textContent = currencyLabels[code];
    toCurrency.appendChild(option2);
  });

  fromCurrency.value = "USD";
  toCurrency.value = "INR";
}

populateCurrencyDropdowns();

const currencyBar = document.getElementById("currency-bar");
const baseCurrencySelector = document.getElementById("base-currency-selector");
const displayCurrencies = ["INR", "USD", "GBP", "CNY", "CHF", "JPY"];
let lastRates = {};

function getFlag(code) { 
  const flags = {
    INR: "🇮🇳",
    USD: "🇺🇸",
    GBP: "🇬🇧",
    CNY: "🇨🇳",
    CHF: "🇨🇭",
    JPY: "🇯🇵"
  };
  return flags[code] || "🏳️"; 
}

function formatSymbol(code) { 
  const symbols = {
    INR: "₹",
    USD: "$",
    GBP: "£",
    CNY: "¥",
    CHF: "₣",
    JPY: "¥"
  };
  return symbols[code] || code; 
}

async function updateTopBar(base = "INR") {
  try {
    console.log("Attempting to fetch currency data for base:", base);
    const url = `https://api.frankfurter.app/latest?from=${base}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Currency data received:", data);
    const newRates = data.rates;

    // Clear the currency bar
    currencyBar.innerHTML = "";

    displayCurrencies.forEach(code => {
      // Flag emoji
      const flag = getFlag(code);
      const symbol = formatSymbol(code);

      // Base currency display
      if (code === base) {
        currencyBar.innerHTML += `
          <div class="currency-item">
            <div class="currency-flag">${flag}</div>
            <div class="currency-value">${code}: ${symbol}1.00</div>
            <div class="currency-change">(Base)</div>
          </div>`;
        return;
      }

      const newRate = newRates[code];
      if (!newRate) return;

      const oldRate = lastRates[code] || newRate;
      const diffPercent = ((newRate - oldRate) / oldRate) * 100;
      const sign = diffPercent > 0 ? "+" : "";
      const color = diffPercent > 0 ? "limegreen" : "red";

      currencyBar.innerHTML += `
        <div class="currency-item">
          <div class="currency-flag">${flag}</div>
          <div class="currency-value">${code}: ${symbol}${newRate.toFixed(4)}</div>
          <div class="currency-change" style="color: ${color}">${sign}${diffPercent.toFixed(2)}%</div>
        </div>`;
    });

    lastRates = newRates;
    
    // Reinitialize scroll functionality after updating content
    initializeScrollFunctionality();
  } catch (e) {
    console.error("Error loading currency rates:", e);
    // Fallback: Display static currency data with flags
    currencyBar.innerHTML = "";
    displayCurrencies.forEach(code => {
      const flag = getFlag(code);
      const symbol = formatSymbol(code);
      
      if (code === base) {
        currencyBar.innerHTML += `
          <div class="currency-item">
            <div class="currency-flag">${flag}</div>
            <div class="currency-value">${code}: ${symbol}1.00</div>
            <div class="currency-change">(Base)</div>
          </div>`;
      } else {
        // Static fallback rates
        const fallbackRates = {
          INR: { USD: 0.012, GBP: 0.0096, CNY: 0.083, CHF: 0.011, JPY: 1.81 },
          USD: { INR: 83.5, GBP: 0.79, CNY: 7.24, CHF: 0.88, JPY: 150.2 }
        };
        
        const rate = fallbackRates[base]?.[code] || 1.0;
        currencyBar.innerHTML += `
          <div class="currency-item">
            <div class="currency-flag">${flag}</div>
            <div class="currency-value">${code}: ${symbol}${rate.toFixed(4)}</div>
            <div class="currency-change">0.00%</div>
          </div>`;
      }
    });
    
    initializeScrollFunctionality();
  }
}

baseCurrencySelector.addEventListener("change", () => {
  updateTopBar(baseCurrencySelector.value);
});

updateTopBar(); // Initial call
setInterval(() => updateTopBar(baseCurrencySelector.value), 60000); // Every 60 seconds

// 🎯 SCROLLING FUNCTIONALITY - ADD THIS SECTION
function initializeScrollFunctionality() {
  const currencyInfo = document.querySelector('.currency-info');
  if (!currencyInfo) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  // Remove existing event listeners to prevent duplicates
  currencyInfo.replaceWith(currencyInfo.cloneNode(true));
  const newCurrencyInfo = document.querySelector('.currency-info');

  // Mouse drag scrolling for desktop
  newCurrencyInfo.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - newCurrencyInfo.offsetLeft;
    scrollLeft = newCurrencyInfo.scrollLeft;
    newCurrencyInfo.style.cursor = 'grabbing';
  });

  newCurrencyInfo.addEventListener('mouseleave', () => {
    isDown = false;
    newCurrencyInfo.style.cursor = 'grab';
  });

  newCurrencyInfo.addEventListener('mouseup', () => {
    isDown = false;
    newCurrencyInfo.style.cursor = 'grab';
  });

  newCurrencyInfo.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - newCurrencyInfo.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    newCurrencyInfo.scrollLeft = scrollLeft - walk;
  });

  // Wheel scrolling for desktop
  newCurrencyInfo.addEventListener('wheel', (e) => {
    e.preventDefault();
    newCurrencyInfo.scrollLeft += e.deltaY;
  });

  // Create seamless loop effect
  const items = newCurrencyInfo.querySelectorAll('.currency-item');
  if (items.length === 0) return;

  // Clone items for seamless loop
  items.forEach(item => {
    const clone = item.cloneNode(true);
    newCurrencyInfo.appendChild(clone);
  });

  // Monitor scroll position for loop
  newCurrencyInfo.addEventListener('scroll', () => {
    const scrollWidth = newCurrencyInfo.scrollWidth;
    const clientWidth = newCurrencyInfo.clientWidth;
    const scrollLeft = newCurrencyInfo.scrollLeft;
    
    // Calculate the width of original items
    const originalWidth = (scrollWidth - clientWidth) / 2;
    
    // If scrolled to the end, jump to beginning
    if (scrollLeft >= originalWidth) {
      newCurrencyInfo.scrollLeft = 0;
    }
    
    // If scrolled to the beginning (negative), jump to end
    if (scrollLeft <= 0) {
      newCurrencyInfo.scrollLeft = originalWidth - 1;
    }
  });

  // Auto-scroll functionality
  let autoScrollInterval;
  
  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      newCurrencyInfo.scrollLeft += 1;
    }, 30);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  // Start auto-scroll and pause on hover
  startAutoScroll();
  
  newCurrencyInfo.addEventListener('mouseenter', stopAutoScroll);
  newCurrencyInfo.addEventListener('mouseleave', startAutoScroll);
  
  // Also pause on touch for mobile
  newCurrencyInfo.addEventListener('touchstart', stopAutoScroll);
  newCurrencyInfo.addEventListener('touchend', () => {
    setTimeout(startAutoScroll, 2000); // Resume after 2 seconds
  });
}

// Initialize scroll functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for the currency bar to be populated
  setTimeout(initializeScrollFunctionality, 1000);
});

// 🧠 Helper: Convert words to number
function wordsToNumber(words) {
  if (!words || typeof words !== "string") return NaN;

  words = words.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
  const decimalSplit = words.split(/ point | dot /); // Support "point" or "dot"

  const wholePart = decimalSplit[0];
  const decimalPart = decimalSplit[1] || "";

  const map = {
    zero: 0, one: 1, two: 2, three: 3, four: 4,
    five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13,
    fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
    forty: 40, fifty: 50, sixty: 60, seventy: 70,
    eighty: 80, ninety: 90,
    hundred: 100, thousand: 1_000, lakh: 1_00_000, crore: 1_00_00_000, arab: 1_00_00_00_000,
    thousands: 1_000, lakhs: 1_00_000, crores: 1_00_00_000, arabs: 1_00_00_00_000
  };

  const wordsArray = wholePart.split(" ");
  let total = 0, temp = 0;

  for (let word of wordsArray) {
    let num = map[word];
    if (num === undefined) continue;

    if (num < 100) {
      temp += num;
    } else {
      temp = (temp || 1) * num;
      if (num >= 1000) {
        total += temp;
        temp = 0;
      }
    }
  }
  total += temp;

  // Handle decimals
  if (decimalPart) {
    const decimalWords = decimalPart.trim().split(" ");
    let decimalStr = "";
    for (let word of decimalWords) {
      if (map[word] !== undefined && map[word] < 10) {
        decimalStr += map[word];
      }
    }
    if (decimalStr) {
      total += parseFloat("0." + decimalStr);
    }
  }

  return total;
}

// 🧠 Helper: Convert number to international words
function numberToWordsInternational(num) {
  if (isNaN(num)) return "";

  const [integerPart, decimalPart] = num.toString().split(".");

  const belowTwenty = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const scales = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"];

  function convertChunk(n) {
    if (n === 0) return "";
    if (n < 20) return belowTwenty[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + belowTwenty[n % 10] : "");
    return belowTwenty[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + convertChunk(n % 100) : "");
  }

  let numInt = parseInt(integerPart, 10);
  const parts = [];
  let scaleIndex = 0;

  while (numInt > 0) {
    const chunk = numInt % 1000;
    if (chunk > 0) {
      const chunkWords = convertChunk(chunk);
      parts.unshift(chunkWords + (scales[scaleIndex] ? " " + scales[scaleIndex] : ""));
    }
    numInt = Math.floor(numInt / 1000);
    scaleIndex++;
  }

  let final = parts.join(" ").trim();

  // Handle decimal part
  if (decimalPart) {
    const decimals = decimalPart.split("").map(d => belowTwenty[parseInt(d)]).join(" ");
    final += " point " + decimals;
  }

  return final.trim();
}

// 🧠 Helper: Convert number to Indian words
function numberToWordsIndian(num) {
  if (isNaN(num)) return "";

  const [integerPart, decimalPart] = num.toString().split(".");

  const belowTwenty = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function convertBelow100(n) {
    if (n < 20) return belowTwenty[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + belowTwenty[n % 10] : "");
  }

  function convertBelow1000(n) {
    if (n < 100) return convertBelow100(n);
    return belowTwenty[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + convertBelow100(n % 100) : "");
  }

  let numInt = parseInt(integerPart, 10);
  const parts = [];

  const arab = Math.floor(numInt / 1000000000);
  if (arab) parts.push(convertBelow1000(arab) + " arab");
  numInt %= 1000000000;

  const crore = Math.floor(numInt / 10000000);
  if (crore) parts.push(convertBelow1000(crore) + " crore");
  numInt %= 10000000;

  const lakh = Math.floor(numInt / 100000);
  if (lakh) parts.push(convertBelow1000(lakh) + " lakh");
  numInt %= 100000;

  const thousand = Math.floor(numInt / 1000);
  if (thousand) parts.push(convertBelow1000(thousand) + " thousand");
  numInt %= 1000;

  if (numInt) parts.push(convertBelow1000(numInt));

  let final = parts.join(" ").trim();

  // Handle decimal part
  if (decimalPart) {
    const decimals = decimalPart.split("").map(d => belowTwenty[parseInt(d)]).join(" ");
    final += " point " + decimals;
  }

  return final.trim();
}

// 📊 Fetch Exchange Rate
async function fetchExchangeRate(from) {
  const url = `https://api.frankfurter.app/latest?amount=1&from=${from}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data || !data.rates) throw new Error("Rate data unavailable");
  return { rates: data.rates, date: data.date };
}

// 🔍 Parse Amount Input (supports both numbers and words)
function parseAmount(input) {
  input = input.replace(/,/g, "").trim();
  if (!isNaN(input) && input !== "") return Number(input);
  return wordsToNumber(input);
}

// 🚀 Form Submission Handler
document.getElementById("converter-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  errorMessage.textContent = "";
  resultNumber.textContent = "—";
  resultWords.textContent = "—";
  rateInfo.textContent = "";

  const rawInput = amountInput.value;
  const amount = parseAmount(rawInput);

  if (!amount || isNaN(amount) || amount <= 0) {
    errorMessage.textContent = "Please enter a valid amount (e.g., '100 trillion').";
    return;
  }

  const from = fromCurrency.value;
  const to = toCurrency.value;

  try {
    const { rates, date } = await fetchExchangeRate(from);
    const rate = rates[to];
    if (!rate) throw new Error("Invalid currency pair");

    const converted = amount * rate;
    resultNumber.textContent = converted.toLocaleString(undefined, { maximumFractionDigits: 6 });

    const convertedRounded = Math.round(converted);
    let intlWords = "(too large to convert)";
    let indianWords = "(too large to convert)";

    try { intlWords = numberToWordsInternational(convertedRounded); } catch (e) {}
    try { indianWords = numberToWordsIndian(convertedRounded); } catch (e) {}

    resultWords.innerHTML =
      `<b>International:</b> ${intlWords}<br><b>Indian:</b> ${indianWords}`;

    rateInfo.textContent = `1 ${from} = ${rate} ${to} (as of ${new Date(date).toLocaleDateString()})`;

  } catch (err) {
    resultNumber.textContent = "—";
    resultWords.textContent = "—";
    rateInfo.textContent = "";
    errorMessage.textContent = "Error fetching conversion rate. Please try again.";
  }
});
