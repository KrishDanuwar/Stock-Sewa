export function numberToWords(num: number): string {
    if (isNaN(num)) return 'Zero Rupees Only';

    const absNum = Math.abs(num);
    if (absNum === 0) return 'Zero Rupees Only';
    if (absNum.toString().length > 12) return 'Amount Too Large';

    const rupees = Math.floor(absNum);
    const paisa = Math.round((absNum - rupees) * 100);

    let result = '';

    if (rupees > 0) {
        result = convertWholeNumber(rupees) + ' Rupees';
    }

    if (paisa > 0) {
        if (result) result += ' and ';
        result += convertWholeNumber(paisa) + ' Paisa';
    }

    if (!result) return 'Zero Rupees Only';

    return result + ' Only';
}

function convertWholeNumber(n: number): string {
    if (n === 0) return 'Zero';

    const units = ['', 'Thousand', 'Million', 'Billion'];
    let words = '';

    const parts: number[] = [];
    let temp = Math.floor(n);
    while (temp > 0) {
        parts.push(temp % 1000);
        temp = Math.floor(temp / 1000);
    }

    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 0) continue;
        const partWords = convertSubHundred(parts[i]);
        words = partWords + (units[i] ? ' ' + units[i] : '') + (words ? ' ' + words : '');
    }

    return words.trim();
}

function convertSubHundred(n: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    let res = '';
    if (n >= 100) {
        res += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
    }

    if (n >= 20) {
        res += tens[Math.floor(n / 10)];
        if (n % 10 > 0) res += '-' + ones[n % 10];
    } else if (n > 0) {
        res += ones[n];
    }

    return res.trim();
}
