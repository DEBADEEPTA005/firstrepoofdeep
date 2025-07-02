// This script handles currency conversion, number/words input, and output display

// Helper: Convert words to numbers using a basic mapping (for demo; use a library for full features)
function wordsToNumber(words) {
    // Lowercase and replace hyphens
    words = words.toLowerCase().replace(/-/g, ' ');
    const numbers = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
        'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
        'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
        'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
        'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000
    };
    let result = 0, temp = 0;
    words.split(' ').forEach(word => {
        if (numbers[word] < 100) {
            temp += numbers[word] || 0;
        } else {
            temp *= numbers[word];
            if (numbers[word] >= 1000) {
                result += temp;
                temp = 0;
            }
        }
    });
    return result + temp;
}

// Helper: Convert number to words (very basic, for demo)
function numberToWords(num) {
    // For a production project, use a library like "number-to-words"
    if (num === 0) return 'zero';
    const belowTwenty = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    if (num < 20) return belowTwenty[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + belowTwenty[num % 10] : "");
    if (num < 1000) return belowTwenty[Math.floor(num / 100)] + " hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
    if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + " thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
    return num.toString(); // fallback
}

// DOM elements
const form = document.getElementById('converter-form');
const amountInput = document.getElementById('amount-input');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultNumber = document.getElementById('result-number');
const resultWords = document.getElementById('result-words');
const rateInfo = document.getElementById('rate-info');
const errorMessage = document.getElementById('error-message');

// Helper: Detect if input is word or number
function parseAmount(input) {
    // Remove commas and trim
    input = input.replace(/,/g, '').trim();
    // If it's a valid number, return as number
    if (!isNaN(input) && input !== '') {
        return Number(input);
    }
    // Otherwise, try parsing as words
    const num = wordsToNumber(input);
    return num;
}

// Main: Handle form submit
form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorMessage.textContent = '';
    resultNumber.textContent = '—';
    resultWords.textContent = '—';
    rateInfo.textContent = '';

    const rawInput = amountInput.value;
    const amount = parseAmount(rawInput);
    if (!amount || isNaN(amount) || amount <= 0) {
        errorMessage.textContent = 'Please enter a valid amount (number or words).';
        return;
    }

    const from = fromCurrency.value;
    const to = toCurrency.value;

    try {
        // Fetch real-time exchange rate
        const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.result) {
            throw new Error('Conversion failed.');
        }

        resultNumber.textContent = data.result;
        resultWords.textContent = numberToWords(Math.round(data.result));
        rateInfo.textContent = `1 ${from} = ${data.info.rate} ${to} (updated ${new Date(data.date).toLocaleDateString()})`;
    } catch (err) {
        errorMessage.textContent = 'Error fetching conversion rate. Please try again.';
    }
});