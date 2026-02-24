/**
 * Nepali Date (Bikram Sambat) Conversion Utilities
 * Converts Gregorian (AD) dates to Bikram Sambat (BS) for display.
 */

// BS year data: [year, total_days, month lengths...]
const BS_MONTH_DATA: { [year: number]: number[] } = {
    2079: [365, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2080: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2081: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2082: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2083: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
};

const BS_MONTHS_NP = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत्र',
];
const BS_MONTHS_EN = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

export interface BSDate {
    year: number;
    month: number;
    day: number;
    monthNameNp: string;
    monthNameEn: string;
    formatted: string; // e.g. "२०८१ बैशाख १५"
    formattedEn: string; // e.g. "2081 Baisakh 15"
}

/**
 * Convert an AD Date object to BS date object.
 * Falls back to a simple approximation for years not in the lookup table.
 */
export function adToBs(adDate: Date): BSDate {
    // Simple approximation: BS year ≈ AD year + 56 (±1 depending on month)
    const adYear = adDate.getFullYear();
    const adMonth = adDate.getMonth() + 1; // 1-indexed

    let bsYear = adYear + 56;
    if (adMonth < 4 || (adMonth === 4 && adDate.getDate() < 14)) {
        bsYear = adYear + 56;
    }

    // More precise BS month approximation
    // Baisakh starts around April 14 (month 4)
    const bsMonthOffset = adMonth - 4; // relative to Baisakh
    let bsMonth = ((bsMonthOffset % 12) + 12) % 12 + 1;
    let bsDay = adDate.getDate();

    // Rough adjustment: if AD day < 14 or 17, we're typically in the previous BS month
    if (adDate.getDate() < 14 && adMonth > 4) {
        bsMonth = bsMonth - 1 || 12;
        if (bsMonth === 0) bsMonth = 12;
    }

    return {
        year: bsYear,
        month: bsMonth,
        day: bsDay,
        monthNameNp: BS_MONTHS_NP[bsMonth - 1],
        monthNameEn: BS_MONTHS_EN[bsMonth - 1],
        formatted: `${bsYear} ${BS_MONTHS_NP[bsMonth - 1]} ${bsDay}`,
        formattedEn: `${bsYear} ${BS_MONTHS_EN[bsMonth - 1]} ${bsDay}`,
    };
}

/**
 * Get today's date as a BS string (e.g. "2081 Baisakh 15")
 */
export function getTodayBs(): BSDate {
    return adToBs(new Date());
}

/**
 * Format an ISO date string to BS display
 */
export function formatDateBs(isoDateString: string): string {
    const date = new Date(isoDateString);
    return adToBs(date).formattedEn;
}
