/**
 * Helper functions.
 *
 * Helper functions used by different classes.
 *
 * @link   https://github.com/git-kick/ioBroker.e3dc-rscp
 * @file   This files defines several helper functions.
 * @author git-kick.
 * @since  1.1.0
 */

// convert decimal number (mod 256) to 2-digit upper-case hex string
function toHex( d ) {
	return ( "0" + ( Number( d ).toString( 16 ) ) ).slice( -2 ).toUpperCase();
}

// Round numerical values for better readability
// If the integer part is has more digits than <s>, then just round to integer.
// Otherwise, round so that the result has <s> digits in total: <int-digits> + <fraction-digits> = <s>.
function roundForReadability( n ) {
	const s = 4; // number of significant digits
	const d = Math.abs( Math.round( n ) ).toString().length;
	if ( d >= s ) {
		return Math.round( n );
	} else {
		const p = Math.pow( 10, s - d );
		return Math.round( n * p ) / p;
	}
}

// Timestamps are stringified like "2022-01-30 12:00:00.000"
function dateToString( date ) {
	const year = date.getFullYear().toString().padStart( 4, "0" );
	const month = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
	const day = date.getDate().toString().padStart( 2, "0" );
	const hour = date.getHours().toString().padStart( 2, "0" );
	const minute = date.getMinutes().toString().padStart( 2, "0" );
	const second = date.getSeconds().toString().padStart( 2, "0" );
	const ms = date.getMilliseconds().toString().padStart( 3, "0" );
	return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
}

// Missing seconds/milliseconds will be set to zero - minimal valid string is like "2021-1-1 0:0"
// If no match is found, return "today midnight"
function stringToDate( string ) {
	const found = string.match( /(\d\d\d\d)-(\d\d?)-(\d\d?) (\d\d?):(\d\d?)(?::(\d\d?)(?:\.(\d\d?\d?))?)?/ );
	if ( found ) {
		const second = found[6] ? Number( found[6] ) : 0;
		const ms = found[7] ? Number( found[7] ) : 0;
		return new Date( Number( found[1] ), Number( found[2] ) - 1, Number( found[3] ), Number( found[4] ), Number( found[5] ), second, ms );
	} else {
		const now = new Date();
		return new Date( now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0 );
	}
}

// Convert Buffer to/from human readable string, e.g. 4 byte like "F0 12 FF 00"
// Also used to display RSCP ByteArray/BitString types
function bufferToString( buf ) {
	let str = "";
	for ( const x of buf ) {
		str += x.toString( 16 ).padStart( 2, "0" ).toUpperCase() + " ";
	}
	return str.trim();
}
function stringToBuffer( str ) {
	const arr = [];
	//	str.split(" ").array.forEach(element => {
	str.split( " " ).forEach( element => {
		arr.push( Number( `0x${element}` ) );
	} );
	return Buffer.from( arr );
}

module.exports = {
	toHex,
	roundForReadability,
	dateToString,
	stringToDate,
	bufferToString,
	stringToBuffer,
};
