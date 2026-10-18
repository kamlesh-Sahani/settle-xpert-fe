export interface CurrencyOption {
    key: string;
    value: string;
    symbol: string;
    name: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
    { key: "INR", value: "₹ INR", symbol: "₹", name: "Indian Rupee" },
    { key: "USD", value: "$ USD", symbol: "$", name: "US Dollar" },
    { key: "EUR", value: "€ EUR", symbol: "€", name: "Euro" },
    { key: "GBP", value: "£ GBP", symbol: "£", name: "British Pound" },
    { key: "AED", value: "AED", symbol: "AED", name: "UAE Dirham" },
    { key: "AUD", value: "A$ AUD", symbol: "A$", name: "Australian Dollar" },
    { key: "CAD", value: "C$ CAD", symbol: "C$", name: "Canadian Dollar" },
    { key: "SGD", value: "S$ SGD", symbol: "S$", name: "Singapore Dollar" },
];

export const CURRENCY_CODE_OPTIONS = CURRENCY_OPTIONS.map((c) => ({
    key: c.key,
    value: c.key,
    label: c.value,
}));

export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOLS: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED",
    AUD: "A$",
    CAD: "C$",
    SGD: "S$",
};
