/**
 * Helper functions.
 *
 * Helper functions used by different classes.
 *
 * @file   This files defines several helper functions.
 * @author git-kick.
 * @since  1.1.0
 */

/**
 * Converts a decimal number (taken mod 256) to a 2-digit, upper-case
 * hexadecimal string.
 *
 * @param   {number} d - Decimal number to convert (values outside 0-255
 *                        are effectively truncated to their last byte).
 * @returns {string} 2-character upper-case hex string, e.g. "0A".
 */
function toHex(d) {
    return `0${Number(d).toString(16)}`.slice(-2).toUpperCase();
}

/**
 * Rounds a numerical value for better readability.
 *
 * If the integer part of `n` already has at least `s` (4) digits, the
 * value is rounded to the nearest integer. Otherwise it is rounded so
 * that the result has `s` significant digits in total:
 * <int-digits> + <fraction-digits> = <s>
 *
 * @param   {number} n - Value to round.
 * @returns {number} Rounded value.
 * @example
 * roundForReadability(3.14159); // 3.142
 * roundForReadability(12345.6); // 12346
 */
function roundForReadability(n) {
    const s = 4; // number of significant digits
    const d = Math.abs(Math.round(n)).toString().length;
    if (d >= s) {
        return Math.round(n);
    }
    const p = Math.pow(10, s - d);
    return Math.round(n * p) / p;
}

/**
 * Converts a number of seconds into a "HH:MM:SS" time-of-day string.
 *
 * @param   {number} secs - Number of seconds (e.g. 7263).
 * @returns {string} Time-of-day string, zero-padded to 2 digits per component, e.g. "02:01:03".
 */
function secondsToTimeOfDayString(secs) {
    const hrs = Math.floor(secs / 3600);
    secs = secs - hrs * 3600;
    const mins = Math.floor(secs / 60);
    secs = secs - mins * 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Converts a "HH:MM:SS" time-of-day string into a number of seconds.
 *
 * Missing parts default to 0; hours, minutes and seconds may each be given with 1 or 2 digits.
 *
 * @param   {string} tod - Time-of-day string, e.g. "02:01:03".
 * @returns {number} Total number of seconds, e.g. 7263.
 */
function timeOfDayStringToSeconds(tod) {
    const parts = tod.split(':');
    const len = parts.length;
    let result = 0;
    if (len > 0) {
        result = 3600 * Number(parts[0]);
        if (len > 1) {
            result += 60 * Number(parts[1]);
            if (len > 2) {
                result += Number(parts[2]);
            }
        }
    }
    return result;
}

/**
 * Converts a weekday bitmask into a string of weekday digits.
 *
 * @param   {number} bitmask - Bitmask with one bit set per active weekday (bit 0 = Monday, ..., bit 6 = Sunday).
 * @returns {string} Concatenated weekday digits ("1" = Monday ... "7" = Sunday), e.g. 0b11000001 => "167".
 */
function bitmaskToWeekdayString(bitmask) {
    const days = ['1', '2', '3', '4', '5', '6', '7']; // Monday = "1", Tuesday = "2", etc.
    const result = [];
    for (let i = 0; i < days.length; i++) {
        if (bitmask & (1 << i)) {
            result.push(days[i]);
        }
    }
    return result.join('');
}

/**
 * Converts a string of weekday digits into a weekday bitmask.
 *
 * @param   {string} days - Weekday digits ("1" = Monday ... "7" = Sunday), e.g. "167".
 * @returns {number} Bitmask with one bit set per weekday contained in `days` (bit 0 = Monday, ..., bit 6 = Sunday).
 */
function weekdayStringToBitmask(days) {
    let result = 0;
    for (const day of days) {
        result += 2 ** (Number(day) - 1);
    }
    return result;
}

/**
 * Converts a 12-bit month bitmask into a month-initials string.
 *
 * Bit 0 = January, bit 1 = February, ..., bit 11 = December. Months that
 * are set in the bitmask are represented by their upper-case initial,
 * months that are not set by their lower-case initial.
 *
 * @param   {number} bitmask - Bitmask with one bit set per active month;
 *                   must be < 4096, i.e. use at most 12 lower bits.
 * @returns {string} 12-character month-initials string;
 *                   e.g. 0b000011110000 => "jfmaMJJAsond";
 *                   returns an empty string if `bitmask` is out of range.
 */
function bitmaskToMonthString(bitmask) {
    if (bitmask < 4096) {
        const months = ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'];
        const result = [];
        for (let i = 0; i < months.length; i++) {
            if (bitmask & (1 << i)) {
                result.push(months[i].toUpperCase());
            } else {
                result.push(months[i]);
            }
        }
        return result.join('');
    }
    return '';
}

/**
 * Converts a month-initials string into a 12-bit month bitmask.
 *
 * Only valid if `months` matches "jfmamjjasond" case-insensitively;
 * upper-case letters mark active months.
 *
 * @param   {string} months - 12-character month-initials string, e.g. "jfmaMJJAsond".
 * @returns {number} Bitmask with one bit set per active month;
 *                  (bit 0 = January, ..., bit 11 = December);
 *                  returns 0 if `months` does not match the expected pattern.
 */
function monthStringToBitmask(months) {
    let result = 0;
    if (months.toUpperCase() == 'JFMAMJJASOND') {
        for (let i = 0; i < months.length; i++) {
            const m = months[i];
            if (m >= 'A' && m <= 'Z') {
                result += 2 ** i;
            }
        }
    }
    return result;
}

/**
 * Formats a Date object as a "YYYY-MM-DD HH:MM:SS.mmm" timestamp string.
 *
 * @param   {Date}   date - Date object to format.
 * @returns {string} Formatted timestamp, e.g. "2022-01-30 12:00:00.000".
 */
function dateToString(date) {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
}

/**
 * Parses a timestamp string of the form "YYYY-M-D H:M[:S[.mmm]]" into a Date object.
 *
 * Seconds and milliseconds are optional and default to 0 when missing,
 * so the minimal valid string is like "2021-1-1 0:0". If `string` does
 * not match the expected pattern, today's midnight is returned instead.
 *
 * @param   {string} string - Timestamp string to parse, e.g. "2022-01-30 12:00:00.000".
 * @returns {Date} Parsed Date object, or today at 00:00:00.000 if `string` could not be parsed.
 */
function stringToDate(string) {
    const found = string.match(/(\d\d\d\d)-(\d\d?)-(\d\d?) (\d\d?):(\d\d?)(?::(\d\d?)(?:\.(\d\d?\d?))?)?/);
    if (found) {
        const second = found[6] ? Number(found[6]) : 0;
        const ms = found[7] ? Number(found[7]) : 0;
        return new Date(
            Number(found[1]),
            Number(found[2]) - 1,
            Number(found[3]),
            Number(found[4]),
            Number(found[5]),
            second,
            ms,
        );
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Converts a Buffer into a human-readable, space-separated hex string.
 *
 * Also used to display RSCP ByteArray/BitString values.
 *
 * @param   {Buffer} buf - Buffer to convert.
 * @returns {string} Space-separated, upper-case hex bytes, e.g. for a 4-byte buffer "F0 12 FF 00".
 */
function bufferToString(buf) {
    let str = '';
    for (const x of buf) {
        str += `${x.toString(16).padStart(2, '0').toUpperCase()} `;
    }
    return str.trim();
}

/**
 * Converts a space-separated hex string into a Buffer.
 *
 * @param   {string} str - Space-separated, upper-case hex bytes, e.g. "F0 12 FF 00".
 * @returns {Buffer} Converted Buffer.
 */
function stringToBuffer(str) {
    const arr = [];
    //	str.split(" ").array.forEach(element => {
    str.split(' ').forEach(element => {
        arr.push(Number(`0x${element}`));
    });
    return Buffer.from(arr);
}

module.exports = {
    toHex,
    roundForReadability,
    secondsToTimeOfDayString,
    timeOfDayStringToSeconds,
    bitmaskToWeekdayString,
    weekdayStringToBitmask,
    bitmaskToMonthString,
    monthStringToBitmask,
    dateToString,
    stringToDate,
    bufferToString,
    stringToBuffer,
};
