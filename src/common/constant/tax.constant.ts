export const TAX_PREFERENCE_OPTIONS = [
    { key: "TAXABLE", value: "Taxable" },
    { key: "NON_TAXABLE", value: "Non Taxable" },
];

export const TAX_EXEMPTION_REASONS = [
    { key: "EXEMPT_SUPPLY", value: "Exempt Supply" },
    { key: "NIL_RATED", value: "Nil Rated" },
    { key: "NON_GST_SUPPLY", value: "Non-GST Supply" },
    { key: "ZERO_RATED", value: "Zero Rated Export" },
    { key: "OTHER", value: "Other Exemption" },
];

export const TAX_RATE_PERCENTAGE_OPTIONS = [
    { key: "0.0", value: "0.0" },
    { key: "5.0", value: "5.0" },
    { key: "12.0", value: "12.0" },
    { key: "18.0", value: "18.0" },
    { key: "28.0", value: "28.0" },
];

export const UNREGISTERED_GST_TREATMENT = "UNREGISTERED";

export const GST_TREATMENTS_WITHOUT_GSTIN = [
    "UNREGISTERED",
    "OVERSEAS",
    "SEZ",
    "NON_GST_SUPPLY",
];

export const GST_TREATMENT_OPTIONS = [
    {
        key: "REGULAR",
        value: "Registered Business - Regular",
        desc: "Business that is registered under GST",
    },
    {
        key: "COMPOSITION",
        value: "Registered Business - Composition",
        desc: "Business that is registered under the GST Composition Scheme",
    },
    {
        key: "UNREGISTERED",
        value: "Unregistered Business",
        desc: "Business that has not been registered under GST",
    },
    {
        key: "OVERSEAS",
        value: "Overseas",
        desc: "Persons with whom you do import or export of supplies outside India",
    },
    {
        key: "SEZ",
        value: "Special Economic Zone",
        desc: "Business (Unit) that is located in a special Economic Zone (SEZ) of India",
    },
    {
        key: "DEEMED_EXPORT",
        value: "Deemed Export",
        desc: "Supply of to an Export Oriented Unit or against Advanced Authorization",
    },
    {
        key: "NON_GST_SUPPLY",
        value: "Non GST Supply",
        desc: "Supply that is not subject to GST",
    },
];
