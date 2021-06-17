/* eslint-disable quotes */
const TYPE_RSCP_NONE = 0x00;
const TYPE_RSCP_BOOL = 0x01;
const TYPE_RSCP_CHAR8 = 0x02;
const TYPE_RSCP_UCHAR8 = 0x03;
const TYPE_RSCP_INT16 = 0x04;
const TYPE_RSCP_UINT16 = 0x05;
const TYPE_RSCP_INT32 = 0x06;
const TYPE_RSCP_UINT32 = 0x07;
const TYPE_RSCP_INT64 = 0x08;
const TYPE_RSCP_UINT64 = 0x09;
const TYPE_RSCP_FLOAT32 = 0x0A;
const TYPE_RSCP_DOUBLE64 = 0x0B;
const TYPE_RSCP_BITFIELD = 0x0C;
const TYPE_RSCP_CSTRING = 0x0D;
const TYPE_RSCP_CONTAINER = 0x0E;
const TYPE_RSCP_TIMESTAMP = 0x0F;
const TYPE_RSCP_BYTEARRAY = 0x10;
const TYPE_RSCP_ERROR = 0xFF;

const CRC32 = require('crc-32');

// Constants from official E3/DC Excel sheet
const rscpTags = require('./RscpTags.json');
const rscpTypes = require('./RscpTypes.json');

class RscpFrame {
	constructor() {
		// Preset Magic and CTRL and reserve space for Timestamp and Length
		this.buffer = Buffer.from([0xE3, 0xDC, 0x00, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
		this.openContainer = 0;
	}
	appendData( tag, value ) {
		const type = parseInt( rscpTags[tag].DataTypeHex, 16 );
		const buf2 = Buffer.alloc(2);
		const buf4 = Buffer.alloc(4);
		const buf6 = Buffer.alloc(6);
		const buf8 = Buffer.alloc(8);
		buf4.writeInt32LE( tag );
		this.buffer = Buffer.concat( [this.buffer, buf4] );
		this.buffer = Buffer.concat( [this.buffer, Buffer.from([type])] );
		this.buffer = Buffer.concat( [this.buffer, Buffer.from([0x00, 0x00])] ); // reserve space for Length
		switch( type ) {
			case TYPE_RSCP_NONE:
				break;
			case TYPE_RSCP_CONTAINER:
				if( this.openContainer > 0 ) {
					this.buffer.writeUInt16LE( this.buffer.length - this.openContainer - 9, this.openContainer );
				}
				this.openContainer = this.buffer.length - 2;
				break;
			case TYPE_RSCP_ERROR:
			case TYPE_RSCP_CSTRING:
			case TYPE_RSCP_BOOL:
			case TYPE_RSCP_CHAR8:
			case TYPE_RSCP_UCHAR8:
			case TYPE_RSCP_BITFIELD:
			case TYPE_RSCP_BYTEARRAY:
				this.buffer.writeUInt16LE(value.length, this.buffer.length - 2);
				this.buffer = Buffer.concat( [this.buffer, Buffer.from(value)] );
				break;
			case TYPE_RSCP_INT16:
				this.buffer.writeUInt16LE( 2, this.buffer.length - 2 );
				buf2.writeInt16LE( value );
				this.buffer = Buffer.concat( [this.buffer, buf2] );
				break;
			case TYPE_RSCP_UINT16:
				this.buffer.writeUInt16LE( 2, this.buffer.length - 2 );
				buf2.writeUInt16LE( value );
				this.buffer = Buffer.concat( [this.buffer, buf2] );
				break;
			case TYPE_RSCP_INT32:
				this.buffer.writeUInt16LE( 4, this.buffer.length - 2 );
				buf4.writeInt32LE( value );
				this.buffer = Buffer.concat( [this.buffer, buf4] );
				break;
			case TYPE_RSCP_UINT32:
				this.buffer.writeUInt16LE( 4, this.buffer.length - 2 );
				buf4.writeUInt32LE( value );
				this.buffer = Buffer.concat( [this.buffer, buf4] );
				break;
			case TYPE_RSCP_INT64:
				this.buffer.writeUInt16LE( 8, this.buffer.length - 2 );
				buf8.writeBigInt64LE( value );
				this.buffer = Buffer.concat( [this.buffer, buf8] );
				break;
			case TYPE_RSCP_UINT64:
				this.buffer.writeUInt16LE( 8, this.buffer.length - 2 );
				buf8.writeBigUInt64LE( value );
				this.buffer = Buffer.concat( [this.buffer, buf8] );
				break;
			case TYPE_RSCP_FLOAT32:
				this.buffer.writeUInt16LE( 4, this.buffer.length - 2 );
				buf4.writeFloatLE( value );
				this.buffer = Buffer.concat( [this.buffer, buf4] );
				break;
			case TYPE_RSCP_DOUBLE64:
				this.buffer.writeUInt16LE( 8, this.buffer.length - 2 );
				buf8.writeDoubleLE( value );
				this.buffer = Buffer.concat( [this.buffer, buf8] );
				break;
			case TYPE_RSCP_TIMESTAMP: // CAUTION: treating value as seconds - setting nanoseconds to zero
				this.buffer.writeUInt16LE( 10, this.buffer.length - 2 );
				buf6.writeUIntLE( value, 0, 6 );
				this.buffer = Buffer.concat( [this.buffer, buf6, new Uint8Array([0x00,0x00,0x00,0x00])] );
				break;
			default:
				console.log( "CAUTION: appendData does not handle data type " + rscpTypes[type]);
		}
	}
	finalize() {
		this.buffer.writeUIntLE( Math.floor(new Date().getTime()/1000), 4, 6 ); // set timestamp - bytes 7,8 remain zero (which will be incorrect after 19.01.2038)
		this.buffer.writeUInt16LE( this.buffer.length - 18, 16 ); // set total length
		if( this.openContainer > 0 ) {
			this.buffer.writeUInt16LE( this.buffer.length - this.openContainer - 2, this.openContainer );
			this.openContainer = 0;
		}
		const buf4 = Buffer.alloc(4);
		buf4.writeInt32LE( CRC32.buf(this.buffer) );
		this.buffer = Buffer.concat( [this.buffer, buf4] );
		return this.buffer;
	}
}
exports.RscpFrame = RscpFrame;

// Pretty print one RSCP frame
function display( f ) {
	function displayData ( f, pos ) {
		const tag = f.readUInt32LE(pos);
		const type = f.readUInt8(pos+4);
		const len = f.readUInt16LE(pos+5);
		console.log( "TAG: " + rscpTags[tag].TagHex + "-" + rscpTags[tag].TagNameGlobal + " - DATA TYPE: " + "0x" + type.toString(16).toUpperCase().padStart(2,"0") + "-" + rscpTypes[type] + " - DATA LENGTH: " + len );
		switch( type ) {
			case TYPE_RSCP_NONE:
				console.log( "DATA TYPE 'none'" );
				if( len > 0 ) console.log( "CAUTION: length of data is " + len );
				return 7+len;
			case TYPE_RSCP_CONTAINER:
				console.log( "<Container content follows...>" );
				return 7; // length of container header, not content
			case TYPE_RSCP_CSTRING:
				console.log( "DATA VALUE: " + f.toString('utf8',pos+7,pos+7+len) );
				return 7+len;
			case TYPE_RSCP_CHAR8:
			case TYPE_RSCP_UCHAR8:
			case TYPE_RSCP_BOOL:
				if( f.readUInt8(pos+7) > 31 && f.readUInt8(pos+7) < 127 && (type == TYPE_RSCP_CHAR8 || type == TYPE_RSCP_UCHAR8)  ) {
					console.log( "DATA VALUE: " + f.toString('utf8',pos+7,pos+8) );
				} else {
					console.log( "DATA VALUE: 0x" + f.readUInt8(pos+7).toString(16).toUpperCase().padStart(2,"0") );
				}
				return 7+len;
			case TYPE_RSCP_INT16:
				console.log( "DATA VALUE: " + f.readInt16LE(pos+7) );
				return 7+len;
			case TYPE_RSCP_UINT16:
				console.log( "DATA VALUE: " + f.readUInt16LE(pos+7) );
				return 7+len;
			case TYPE_RSCP_INT32:
				console.log( "DATA VALUE: " + f.readInt32LE(pos+7) );
				return 7+len;
			case TYPE_RSCP_UINT32:
				console.log( "DATA VALUE: " + f.readUInt32LE(pos+7) );
				return 7+len;
			case TYPE_RSCP_INT64:
				console.log( "DATA VALUE: " + f.readBigInt64LE(pos+7) );
				return 7+len;
			case TYPE_RSCP_UINT64:
				console.log( "DATA VALUE: " + f.readBigUInt64LE(pos+7) );
				return 7+len;
			case TYPE_RSCP_ERROR:
				console.log( "DATA VALUE: " + f.readUInt32LE(pos+7) );
				return 7+len;
			case TYPE_RSCP_DOUBLE64:
				console.log( "DATA VALUE: " + f.readDoubleLE(pos+7) );
				return 7+len;
			case TYPE_RSCP_FLOAT32:
				console.log( "DATA VALUE: " + f.readFloatLE(pos+7) );
				return 7+len;
			case TYPE_RSCP_TIMESTAMP:
				console.log( "SECONDS: "+f.readUIntLE(pos+7,6)+" - NSECONDS: "+f.readUInt32LE(pos+7+6) );
				return 7+len;
			default:
				if( len > 0 ) dump( f.slice(pos+7,pos+7+len) );
				return 7+len;
		}
	}
	const magic = f.toString('hex',0,2).toUpperCase();
	if( magic == 'E3DC' ) {
		console.log( "MAGIC: >" + magic + "< is OK");
	} else {
		console.log( "MAGIC: >" + magic + "< is WRONG");
	}
	const ctrl = f.toString('hex',2,4).toUpperCase();
	switch( ctrl ) {
		case '0010':
			console.log( "CTRL: >" + ctrl + "< is OK - Version 1, no CRC");
			break;
		case '0011':
			console.log( "CTRL: >" + ctrl + "< is OK - Version 1, with CRC");
			break;
		default:
			console.log( "CTRL: >" + ctrl + "< is WRONG");
	}
	console.log( "SECONDS: "+f.readUIntLE(4,6)+" - NSECONDS: "+f.readUInt32LE(12)+" - LENGTH: "+f.readUInt16LE(16) );
	let i = displayData( f, 18 );
	while( i < f.readUInt16LE(16) ) {
		i += displayData( f, 18+i );
	}
}
exports.display = display;

// Hex dump of a buffer with ASCII (where printable)
function dump( f ) {
	const bpb = 8; // bytes per block
	const bpl = 4; // blocks per line
	let line = 0;
	let block = 0;
	let i = 0;
	let b = 0;
	for( line = 0; line*bpl*bpb < f.length; line++ ) {
		process.stdout.write( "\n" );
		// Loop 1: hex
		for( block = 0; block < bpl && (line*bpl+block)*bpb < f.length; block++ ) {
			for( i = 0; i < bpb && (line*bpl+block)*bpb+i < f.length; i++ ) {
				process.stdout.write(("0"+f.readUInt8((line*bpl+block)*bpb+i).toString(16)).slice(-2).toUpperCase()+" ");
			}
			process.stdout.write( "  " );
		}
		process.stdout.write( "\n" );
		// Loop 2: ASCII
		for( block = 0; block < bpl && (line*bpl+block)*bpb < f.length; block++ ) {
			for( i = 0; i < bpb && (line*bpl+block)*bpb+i < f.length; i++ ) {
				b = f.readUInt8((line*bpl+block)*bpb+i);
				if( b < 32 || b > 126 ) { b = 32; }
				process.stdout.write(" "+String.fromCharCode(b)+" ");
			}
			process.stdout.write( "  " );
		}
	}
	process.stdout.write( "\n" );
}
exports.dump = dump;
