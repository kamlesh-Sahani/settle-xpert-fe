export interface MeasurementTypeOption {
    key: string;
    value: string;
    code: string;
}

export const MEASUREMENT_TYPE_OPTIONS: MeasurementTypeOption[] = [
    { key: "PIECES", value: "Pieces (PCS)", code: "PCS" },
    { key: "UNITS", value: "Units (UNT)", code: "UNT" },
    { key: "HOURS", value: "Hours (HRS)", code: "HRS" },
    { key: "DAYS", value: "Days (DAYS)", code: "DAYS" },
    { key: "MONTHS", value: "Months (MON)", code: "MON" },
    { key: "BOXES", value: "Boxes (BOX)", code: "BOX" },
    { key: "KILOGRAMS", value: "Kilograms (KGS)", code: "KGS" },
    { key: "METERS", value: "Meters (MTR)", code: "MTR" },
    { key: "SETS", value: "Sets (SET)", code: "SET" },
    { key: "LITERS", value: "Liters (LTR)", code: "LTR" },
    { key: "PACKS", value: "Packs (PAC)", code: "PAC" },
];
