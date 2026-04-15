// Indian Public Holidays for 2025-2026
// This includes major national holidays observed across India

const holidays = {
  // 2025
  '2025-01-26': { name: 'Republic Day', type: 'national' },
  '2025-03-14': { name: 'Holi', type: 'national' },
  '2025-03-31': { name: 'Eid ul-Fitr', type: 'national' },
  '2025-04-10': { name: 'Mahavir Jayanti', type: 'national' },
  '2025-04-14': { name: 'Ambedkar Jayanti', type: 'national' },
  '2025-04-18': { name: 'Good Friday', type: 'national' },
  '2025-05-01': { name: 'May Day', type: 'national' },
  '2025-06-07': { name: 'Eid ul-Adha', type: 'national' },
  '2025-08-15': { name: 'Independence Day', type: 'national' },
  '2025-08-27': { name: 'Janmashtami', type: 'national' },
  '2025-10-02': { name: 'Gandhi Jayanti', type: 'national' },
  '2025-10-02': { name: 'Dussehra', type: 'national' },
  '2025-10-21': { name: 'Diwali', type: 'national' },
  '2025-11-05': { name: 'Guru Nanak Jayanti', type: 'national' },
  '2025-12-25': { name: 'Christmas', type: 'national' },

  // 2026
  '2026-01-26': { name: 'Republic Day', type: 'national' },
  '2026-03-03': { name: 'Holi', type: 'national' },
  '2026-03-21': { name: 'Eid ul-Fitr', type: 'national' },
  '2026-03-30': { name: 'Mahavir Jayanti', type: 'national' },
  '2026-04-03': { name: 'Good Friday', type: 'national' },
  '2026-04-14': { name: 'Ambedkar Jayanti', type: 'national' },
  '2026-05-01': { name: 'May Day', type: 'national' },
  '2026-05-27': { name: 'Eid ul-Adha', type: 'national' },
  '2026-08-15': { name: 'Independence Day', type: 'national' },
  '2026-08-16': { name: 'Janmashtami', type: 'national' },
  '2026-10-02': { name: 'Gandhi Jayanti', type: 'national' },
  '2026-10-11': { name: 'Dussehra', type: 'national' },
  '2026-11-09': { name: 'Diwali', type: 'national' },
  '2026-11-25': { name: 'Guru Nanak Jayanti', type: 'national' },
  '2026-12-25': { name: 'Christmas', type: 'national' },
};

/**
 * Check if a date is a public holiday
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {object|null} - Holiday object or null
 */
function isHoliday(dateStr) {
  return holidays[dateStr] || null;
}

/**
 * Get all holidays in a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {array} - Array of holiday objects with dates
 */
function getHolidaysInRange(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  return Object.entries(holidays)
    .filter(([date]) => {
      const d = new Date(date + 'T00:00:00');
      return d >= start && d <= end;
    })
    .map(([date, info]) => ({ date, ...info }));
}

/**
 * Get all holidays for a specific year
 * @param {number} year - Year (e.g., 2025)
 * @returns {array} - Array of holiday objects with dates
 */
function getHolidaysByYear(year) {
  return Object.entries(holidays)
    .filter(([date]) => date.startsWith(year.toString()))
    .map(([date, info]) => ({ date, ...info }));
}

module.exports = {
  holidays,
  isHoliday,
  getHolidaysInRange,
  getHolidaysByYear,
};
