/**
 * Nepali Date (Bikram Sambat) Conversion Utilities
 * Uses nepali-date-converter for accurate AD ↔ BS conversion.
 */

import NepaliDate from 'nepali-date-converter';

const BS_MONTHS_EN = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

export interface BSDate {
    year: number;
    month: number;
    day: number;
    monthNameEn: string;
    formatted: string;      // e.g. "2082 Falgun 14"
    formattedEn: string;    // same as formatted (English only now)
}

/**
 * Convert an AD Date object to BS date object using accurate lookup tables.
 */
export function adToBs(adDate: Date): BSDate {
    const npDate = new NepaliDate(adDate);
    const bsYear = npDate.getYear();
    const bsMonth = npDate.getMonth() + 1; // 0-indexed → 1-indexed
    const bsDay = npDate.getDate();
    const monthName = BS_MONTHS_EN[bsMonth - 1];
    const formatted = `${bsYear} ${monthName} ${bsDay}`;

    return {
        year: bsYear,
        month: bsMonth,
        day: bsDay,
        monthNameEn: monthName,
        formatted,
        formattedEn: formatted,
    };
}

/**
 * Get today's date as a BS date object.
 */
export function getTodayBs(): BSDate {
    return adToBs(new Date());
}

/**
 * Format an ISO date string to BS display string.
 */
export function formatDateBs(isoDateString: string): string {
    const date = new Date(isoDateString);
    return adToBs(date).formattedEn;
}
