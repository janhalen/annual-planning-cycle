// Function to get month names in a specified locale
export function getMonthNames(locale) {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2025, i, 1); // Year 2025 is arbitrary, only month matters
      months.push(formatter.format(date));
    }
    return months;
  }