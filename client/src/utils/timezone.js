import { format, toZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'Asia/Kolkata'; // IST

export const formatTimeIST = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number'
        ? new Date(timestamp * 1000) // Convert seconds to milliseconds if needed
        : new Date(timestamp);

    // Handle invalid dates
    if (isNaN(date.getTime())) return '';

    const zonedDate = toZonedTime(date, TIMEZONE);
    return format(zonedDate, 'HH:mm:ss zzz', { timeZone: TIMEZONE });
};

export const getCurrentTimeIST = () => {
    const now = new Date();
    const zonedNow = toZonedTime(now, TIMEZONE);
    return format(zonedNow, 'HH:mm:ss zzz', { timeZone: TIMEZONE });
};

// For chart display (e.g. axis labels)
export const formatChartTime = (timestamp) => {
    if (!timestamp) return '';
    // Lightweight charts provides timestamp in seconds
    const date = new Date(timestamp * 1000);
    const zonedDate = toZonedTime(date, TIMEZONE);
    return format(zonedDate, 'dd MMM HH:mm', { timeZone: TIMEZONE });
};

