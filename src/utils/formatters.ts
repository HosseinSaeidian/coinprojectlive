/**
 * Utility functions for Persian number conversion, currency formatting, and dates
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts Persian and Arabic digits to English ASCII digits
 */
export function toEnglishDigits(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return '';
  return String(input).replace(/\d/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
}

/**
 * Formats a number with comma separators using Persian digits
 * Example: 185000000 -> ۱۸۵,۰۰۰,۰۰۰
 */
export function formatNumberWithCommas(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === '') return '۰';
  const parsed = typeof num === 'number' ? num : parseFloat(toEnglishDigits(String(num)));
  if (isNaN(parsed)) return '۰';
  const parts = parsed.toString().split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1] ? `.${parts[1]}` : '';
  return toPersianDigits(integerPart + decimalPart);
}

/**
 * Formats price in Tomans (تومان)
 * Example: 185000000 -> ۱۸۵,۰۰۰,۰۰۰ تومان
 */
export function formatToman(amount: number, withUnit = true): string {
  const formatted = formatNumberWithCommas(amount);
  return withUnit ? `${formatted} تومان` : formatted;
}

/**
 * Formats USD price (for Gold Ounce)
 * Example: 2512.4 -> ۲,۵۱۲.۴ دلار
 */
export function formatUSD(amount: number, withUnit = true): string {
  const formatted = formatNumberWithCommas(amount);
  return withUnit ? `${formatted} دلار` : formatted;
}

/**
 * Formats percentage with Persian digits and direction sign
 * Example: +2.15 -> ۲.۱۵٪+ or -1.4 -> ۱.۴٪-
 */
export function formatPercentage(percentage: number, includeSign = true): string {
  const absVal = Math.abs(percentage).toFixed(2);
  const persianAbs = toPersianDigits(absVal);
  if (!includeSign || percentage === 0) {
    return `${persianAbs}٪`;
  }
  return percentage > 0 ? `+${persianAbs}٪` : `-${persianAbs}٪`;
}

/**
 * Formats change amount in Tomans with sign
 */
export function formatChangeAmount(change: number, unit = 'تومان'): string {
  const absVal = Math.abs(change);
  const formatted = formatNumberWithCommas(absVal);
  const sign = change > 0 ? '+' : change < 0 ? '-' : '';
  return `${sign}${formatted} ${unit}`;
}

/**
 * Returns a realistic formatted Persian date string
 */
export function getPersianDate(): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(now);
  } catch {
    return 'سه‌شنبه ۲۸ مرداد ۱۴۰۵';
  }
}

/**
 * Global update cycle interval: 15 minutes (900 seconds)
 */
export const GLOBAL_CYCLE_MINUTES = 15;
export const GLOBAL_CYCLE_SECONDS = GLOBAL_CYCLE_MINUTES * 60;

/**
 * Returns the number of seconds remaining in the current 15-minute update cycle.
 * For example:
 * 16:00:00 -> 900s (15:00)
 * 16:01:00 -> 840s (14:00)
 * 16:05:00 -> 600s (10:00)
 * 16:12:30 -> 150s (02:30)
 * 16:14:59 -> 1s (00:01)
 * 16:15:00 -> 900s (15:00)
 */
export function getRemainingCycleSeconds(date = new Date()): number {
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const elapsedInCycle = (minutes % GLOBAL_CYCLE_MINUTES) * 60 + seconds;
  const remaining = GLOBAL_CYCLE_SECONDS - elapsedInCycle;
  return remaining <= 0 ? GLOBAL_CYCLE_SECONDS : remaining;
}

/**
 * Formats countdown seconds to MM:SS with Persian digits (e.g. ۱۵:۰۰, ۱۴:۵۹, ۰۰:۰۱, ۰۰:۰۰)
 */
export function formatCountdownMinutes(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.min(GLOBAL_CYCLE_SECONDS, totalSeconds));
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  return toPersianDigits(`${mm}:${ss}`);
}

/**
 * Returns the Date representing the start of the current 15-minute cycle (e.g. 16:00:00, 16:15:00, 16:30:00, 16:45:00)
 */
export function getCurrentCycleStartDate(date = new Date()): Date {
  const cycleStart = new Date(date);
  const minutes = cycleStart.getMinutes();
  const cycleMinute = Math.floor(minutes / GLOBAL_CYCLE_MINUTES) * GLOBAL_CYCLE_MINUTES;
  cycleStart.setMinutes(cycleMinute, 0, 0);
  return cycleStart;
}

/**
 * Returns the formatted Persian time for the start of the current 15-minute cycle (e.g. "۱۶:۰۰:۰۰" or "۱۶:۱۵:۰۰")
 */
export function getCurrentCycleTimeFormatted(date = new Date()): string {
  const cycleStart = getCurrentCycleStartDate(date);
  const h = cycleStart.getHours();
  const m = cycleStart.getMinutes();
  const hh = h < 10 ? `0${h}` : `${h}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return toPersianDigits(`${hh}:${mm}:۰۰`);
}

/**
 * Returns Persian formatted time (e.g. ۱۴:۳۵:۱۰) for a given Date or current time
 */
export function getPersianTime(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  } catch {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const hh = h < 10 ? `0${h}` : `${h}`;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    return toPersianDigits(`${hh}:${mm}:${ss}`);
  }
}

/**
 * Standard Persian status text for pending price and pending updates
 */
export const PENDING_PRICE_TEXT = 'در انتظار قیمت';
export const PENDING_UPDATE_TEXT = 'در انتظار به‌روزرسانی';

/**
 * Formats price or displays pending state
 */
export function formatPriceOrPending(
  amount: number | null | undefined,
  unit: 'تومان' | 'دلار' = 'تومان',
  isAvailable = true
): string {
  if (!isAvailable || amount === null || amount === undefined || amount <= 0 || isNaN(amount)) {
    return PENDING_PRICE_TEXT;
  }
  return unit === 'دلار' ? formatUSD(amount) : formatToman(amount);
}

/**
 * Formats an ISO market update timestamp (e.g. 2026-09-04T10:45:00Z) into Tehran local Persian time: "۱۴:۱۵".
 * Returns "—" for missing, empty, or invalid timestamps.
 * Never throws during render.
 */
export function formatMarketUpdateTime(timestamp: string | null | undefined): string {
  if (!timestamp || typeof timestamp !== 'string' || !timestamp.trim() || timestamp === '—') {
    return '—';
  }

  try {
    const trimmed = timestamp.trim();
    // If already in Persian/English HH:mm format
    if (/^[0-9۰-۹]{1,2}:[0-9۰-۹]{2}(:[0-9۰-۹]{2})?$/.test(trimmed)) {
      const parts = trimmed.split(':');
      return toPersianDigits(`${parts[0]}:${parts[1]}`);
    }

    const date = new Date(trimmed);
    if (isNaN(date.getTime())) {
      return '—';
    }

    const formatter = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  } catch {
    return '—';
  }
}

