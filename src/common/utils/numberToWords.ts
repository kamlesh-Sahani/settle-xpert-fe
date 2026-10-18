const ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
];

const TENS = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertBelowThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ONES[n];
    if (n < 100) {
        const rem = n % 10;
        return TENS[Math.floor(n / 10)] + (rem ? " " + ONES[rem] : "");
    }
    const rem = n % 100;
    return ONES[Math.floor(n / 100)] + " Hundred" + (rem ? " " + convertBelowThousand(rem) : "");
}

export function numberToWords(amount: number, currency: string = "USD"): string {
    if (isNaN(amount) || amount === 0) {
        return `Zero ${currencyFull(currency)} Only`;
    }

    const absAmount = Math.abs(amount);
    let integerPart = Math.floor(absAmount);
    const decimalPart = Math.round((absAmount - integerPart) * 100);

    const scales = ["", "Thousand", "Million", "Billion"];
    let scaleIndex = 0;
    let words = "";

    while (integerPart > 0) {
        const chunk = integerPart % 1000;
        if (chunk > 0) {
            const chunkWords = convertBelowThousand(chunk);
            const scale = scales[scaleIndex] ? " " + scales[scaleIndex] : "";
            words = chunkWords + scale + (words ? " " + words : "");
        }
        integerPart = Math.floor(integerPart / 1000);
        scaleIndex++;
    }

    let result = words.trim() + " " + currencyFull(currency);

    if (decimalPart > 0) {
        result += " And " + convertBelowThousand(decimalPart) + " Cents";
    }

    return result + " Only";
}

function currencyFull(curr: string): string {
    switch (curr?.toUpperCase()) {
        case "USD":
            return "United States Dollar";
        case "INR":
            return "Indian Rupee";
        case "EUR":
            return "Euro";
        case "GBP":
            return "British Pound";
        default:
            return curr || "Dollar";
    }
}
