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
 * Convert numerical value to '0xAB' hex string
 *
 * @param {number} d - decimal number (mod 256)
 * @returns {string} - 2-digit hex number
 */
function toHex(d) {
    return `0${Number(d).toString(16)}`.slice(-2).toUpperCase();
}

/**
 * Round numerical value for better readability.
 * If the integer part is has more digits than <s>, then just round to integer.
 * Otherwise, round so that the result has <s> digits in total: <int-digits> + <fraction-digits> = <s>.
 *
 * @param {number} n - numerical value
 * @returns {number} - numerical value rounded to <s> digits or to integer, resp.
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
 * Convert 7263 seconds => "02:01:03"
 *
 * @param {number} secs - seconds
 * @returns {string} - "hh:mm:ss" string
 */
function secondsToTimeOfDayString(secs) {
    const hrs = Math.floor(secs / 3600);
    secs = secs - hrs * 3600;
    const mins = Math.floor(secs / 60);
    secs = secs - mins * 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Convert "02:01:03" => 7263 sec
 *
 * @param {string} tod - time of day string "hh:mm:ss"
 * @returns {number} - seconds
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
 * Convert 0b11000001 => "167"
 *
 * @param {number} bitmask - bitmask where days of week are set
 * @returns {string} - string with digits for set days of week
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
 * Convert "167" => 0b11000001
 *
 * @param {string} days - string with digits for set days of week
 * @returns {number} - bitmask where days of week are set
 */
function weekdayStringToBitmask(days) {
    let result = 0;
    for (const day of days) {
        result += 2 ** (Number(day) - 1);
    }
    return result;
}

/**
 * Convert 0b000011110000 => "jfmaMJJAsond"
 *
 * @param {number} bitmask - bitmask where months are set
 * @returns {string} - string with upper case letters for set months
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
 * Convert "jfmaMJJAsond" => 0b000011110000"
 *
 * @param {string} months - string with upper case letters for set months
 * @returns {number} - bitmask where months are set
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
 * Timestamps are stringified like "2022-01-30 12:00:00.000"
 *
 * @param {Date} date - date to stringify
 * @returns {string} - date string "yyyy-mm-dd hh:mm:ss.ttt"
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
 * Convert date string into Date.
 * Missing seconds/milliseconds will be set to zero - minimal valid string is like "2021-1-1 0:0"
 * If no match is found, return "today midnight".
 *
 * @param {string} string - date string "yyyy-mm-dd hh:mm:ss.ttt"
 * @returns {Date} - correspondig Date
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
 * Convert Buffer to human readable string, e.g. 4 byte like "F0 12 FF 00"
 * Also used to display RSCP ByteArray/BitString types
 *
 * @param {Buffer} buf - buffer to show
 * @returns {string} - hex string like "F0 12 FF 00"
 */
function bufferToString(buf) {
    let str = '';
    for (const x of buf) {
        str += `${x.toString(16).padStart(2, '0').toUpperCase()} `;
    }
    return str.trim();
}

/**
 * Convert Buffer from human readable string, e.g. 4 byte like "F0 12 FF 00"
 *
 * @param {string} str - hex string like "F0 12 FF 00"
 * @returns {Buffer} - bytes encoded in a Buffer
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
