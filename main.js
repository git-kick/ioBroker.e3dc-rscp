"use strict";

// System dictionary
const fs = require("fs");
// eslint-disable-next-line prefer-const
let systemDictionary = {};
eval(fs.readFileSync("./admin/words.js").toString());

// RSCP constants & lookup tables
const rscpTag = require("./lib/RscpTags.json");
const rscpTagCode = {}; // maps string to code
for( const i in rscpTag ) rscpTagCode[rscpTag[i].TagNameGlobal] = i;

const rscpType = {
	0x00: "None",
	0x01: "Bool",
	0x02: "Char8",
	0x03: "UChar8",
	0x04: "Int16",
	0x05: "UInt16",
	0x06: "Int32",
	0x07: "UInt32",
	0x08: "Int64",
	0x09: "UInt64",
	0x0A: "Float32",
	0x0B: "Double64",
	0x0C: "Bitfield",
	0x0D: "CString",
	0x0E: "Container",
	0x0F: "Timestamp",
	0x10: "ByteArray",
	0xFF: "Error"
};
const rscpTypeCode = {};  // maps string to code
for( const i in rscpType ) rscpTypeCode[rscpType[i]] = i;

// Mapping RSCP tag data type to state.common.type
const rscpTypeMap = {
	"None": "undefined",
	"Bool": "boolean",
	"Char8": "number",
	"UChar8": "number",
	"Int16": "number",
	"UInt16": "number",
	"Int32": "number",
	"UInt32": "number",
	"Int64": "number",
	"UInt64": "number",
	"Float32": "number",
	"Double64": "number",
	"Bitfield": "string",
	"CString": "string",
	"Container": "undefined",
	"Timestamp": "number",
	"ByteArray": "string",
	"Error": "number",
};
const rscpReturnCode = {
	"-2": "could not set, try later",
	"-1": "value out of range",
	"0": "success",
	"1": "success, but below recommendation",
};
const rscpGeneralError = {
	1: "NOT_HANDLED",
	2: "ACCESS_DENIED",
	3: "FORMAT",
	4: "AGAIN",
};
const rscpAuthLevel = {
	0: "NO_AUTH",
	10: "USER",
	20: "INSTALLER",
	30: "PARTNER",
	40: "E3DC",
	50: "E3DC_ADMIN",
	60: "E3DC_ROOT",
};
const rscpBatTrainingMode = {
	0: "Not training",
	1: "Training, discharging",
	2: "Training, charging",
};
/* RSCP enumerations for later use:
const rscpPmType = {
	0: "UNDEFINED",
	1: "ROOT",
	2: "ADDITIONAL",
	3: "ADDITIONAL_PRODUCTION",
	4: "ADDITIONAL_CONSUMPTION",
	5: "FARM",
	6: "UNUSED",
	7: "WALLBOX",
	8: "FARM_ADDITIONAL",
};
const rscpPmMode = {
	0: "ACTIVE",
	1: "PASSIVE",
	2: "DIAGNOSE",
	3: "ERROR_ACTIVE",
	4: "ERROR_PASSIVE",
};
const rscpPmActivePhases = {
	1: "PHASE_100",
	2: "PHASE_010",
	3: "PHASE_110",
	4: "PHASE_001",
	5: "PHASE_101",
	6: "PHASE_011",
	7: "PHASE_111",
};
const rscpPviType = {
	1: "SOLU",
	2: "KACO",
	3: "E3DC_E",
};
const rscpPviSystemMode = {
	0: "IDLE",
	1: "NORMAL",
	2: "GRIDCHARGE",
	3: "BACKUPPOWER",
};
const rscpPviPowerMode = {
	0: "OFF",
	1: "ON",
	100: "OFF_FORCE",
	101: "ON_FORCE",
};
const rscpEmsGeneratorState = {
	0x00: "IDLE",
	0x01: "HEATUP",
	0x02: "HEATUPDONE",
	0x03: "STARTING",
	0x04: "STARTINGPAUSE",
	0x05: "RUNNING",
	0x06: "STOPPING",
	0x07: "STOPPED",
	0x10: "RELAISCONTROLMODE",
	0xFF: "NO_GENERATOR",
};
const rscpEmsCouplingMode = {
	0: "DC",
	1: "DC_MULTIWR",
	2: "AC",
	3: "HYBRID",
	4: "ISLAND",
};
const rscpEmsSetPowerMode = {
	0: "NORMAL",
	1: "IDLE",
	2: "ENTLADEN",
	3: "LADEN",
	4: "NETZLADEN",
};
const rscpEmsEmergencyPowerStatus = {
	0: "NOT_POSSIBLE",
	1: "ACTIVE",
	2: "NOT_ACTIVE",
	3: "NOT_AVAILABLE",
	4: "SWITCH_IN_ISLAND_STATE",
};
const rscpEmsSetEmergencyPower = {
	0: "NORMAL_GRID_MODE",
	1: "EMERGENCY_MODE",
	2: "ISLAND_NO_POWER_MODE",
};
const rscpWbMode = {
	0: "NONE",
	128: "LOADING",
	144: "NOT_LOADING",
};
const rscpWbType = {
	1: "E3DC",
	2: "EASYCONNECT",
};
const rscpUmUpdateStatus = {
	0: "IDLE",
	1: "UPDATE_CHECK_RUNNING",
	2: "UPDATING_MODULES_AND_FILES",
	3: "UPDATING_HARDWARE",
};
*/

// Assign enumerations to states:
const commonStates = {
	"RSCP.GENERAL_ERROR": { "states": rscpGeneralError },
	"RSCP.AUTHENTICATION": { "states": rscpAuthLevel },
	"BAT.GENERAL_ERROR": { "states": rscpGeneralError },
	"BAT.TRAINING_MODE": { "states": rscpBatTrainingMode },
	"EMS.GENERAL_ERROR": { "states": rscpGeneralError },
	"EMS.RETURN_CODE": { "states": rscpReturnCode },
};
// List of all writable states, with Mapping for response value handling.
// type "*" means: apply to all types
const targetState = {
	"EMS.RES_POWERSAVE_ENABLED": { "*": "EMS.POWERSAVE_ENABLED" },
	"EMS.RES_WEATHER_REGULATED_CHARGE_ENABLED": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_CHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_DISCHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.DISCHARGE_START_POWER": { "Int32": "EMS.DISCHARGE_START_POWER", "Char8": "EMS.RETURN_CODE" },
	"EMS.USER_CHARGE_LIMIT": { "*": "EMS.MAX_CHARGE_POWER" },
	"EMS.USER_DISCHARGE_LIMIT": { "*": "EMS.MAX_DISCHARGE_POWER" },
};
// For each writable state, define how to send a SET to E3/DC
const setTag = {
	"EMS.POWERSAVE_ENABLED": "EMS.REQ_SET_POWER_SETTINGS",
	"EMS.WEATHER_REGULATED_CHARGE_ENABLED": "EMS.REQ_SET_POWER_SETTINGS",
	"EMS.MAX_CHARGE_POWER": "EMS.REQ_SET_POWER_SETTINGS",
	"EMS.MAX_DISCHARGE_POWER": "EMS.REQ_SET_POWER_SETTINGS",
	"EMS.DISCHARGE_START_POWER": "EMS.REQ_SET_POWER_SETTINGS",
	"EMS.USER_CHARGE_LIMIT": "EMS.REQ_SET_POWER_SETTINGS",
	"EMS.USER_DISCHARGE_LIMIT": "EMS.REQ_SET_POWER_SETTINGS",
};
// RSCP is sloppy concerning Bool - some Char8 and UChar8 values must be converted:
const castToBoolean = [
	"EMS.POWERSAVE_ENABLED",
	"EMS.RES_POWERSAVE_ENABLED",
	"EMS.WEATHER_REGULATED_CHARGE_ENABLED",
];
// RSCP is sloppy concerning Timestamp - some UInt64 values must be converted:
const castToTimestamp = [
	"BAT.DCB_LAST_MESSAGE_TIMESTAMP",
];
// Adjust algebraic sign: e.g. discharge limit is sometimes positive, sometimes negative
const negateValue = [
	"EMS.USER_DISCHARGE_LIMIT",
];
// For multiple values within one frame, a subchannel will be generated
const multipleValue = [
	"BAT.DCB_CELL_TEMPERATURE",
	"BAT.DCB_CELL_VOLTAGE",
];
// Some of the return values we do not want to see as (missing) states:
// "INDEX" and "..._INDEX" tags are automatically treated as subchannels, no need to list them here.
const discardValue = [
	"RSCP.UNDEFINED",
	"EMS.UNDEFINED_POWER_SETTING",
	"BAT.UNDEFINED",
	"BAT.INTERNAL_CURRENT_AVG30",
	"BAT.INTERNAL_MTV_AVG30",
	"BAT.INTERNAL_MAX_CHARGE_CURRENT",
	"BAT.INTERNAL_MAX_DISCHARGE_CURRENT",
	"BAT.INTERNAL_MAX_CHARGE_CURR_PER_DCB",
	"BAT.INTERNAL_MAX_DISCHARGE_CURR_PER_DCB",
	"BAT.INTERNAL_MAX_CHARGE_CURR_DATA_LOG",
	"BAT.INTERNAL_MAX_DISCHARGE_CURR_DATA_LOG",
];

// Encryption setup for E3/DC RSCP
// NOTE: E3/DC uses 256 bit block-size, which ist _not_ covered by AES standard.
// It seems that Rijndael CBC with 256 bit block-size fits.
const Net = require("net");
const CRC32 = require("crc-32");
// @ts-ignore
const Rijndael = require("rijndael-js");
const BLOCK_SIZE = 32;
const KEY_SIZE = 32;

/*
 * Created with @iobroker/create-adapter v1.31.0
 */
const utils = require("@iobroker/adapter-core");
let dataPollingTimer = null;
class E3dcRscp extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "e3dc-rscp",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));

		// For preparing and processing next frame:
		this.frame = null;
		this.openContainer = 0;
		this.index1; // for INDEX tags
		this.index2; // for ..._INDEX tags
		this.index3; // for multiple values, e.g. DCB_CELL_TEMPERATURE

		// Message queue (outbound):
		this.queue = [ ];

		// TCP connection:
		this.tcpConnection = new Net.Socket();
		this.inBuffer = null;
	}

	// Create channel to E3/DC: encapsulating TCP connection, encryption, message queuing
	initChannel( ) {
		this.language = "en";
		// @ts-ignore
		this.getForeignObject("system.config", (err, systemConfig) => {
			if( systemConfig ) this.language = systemConfig.common.language;
		});

		if( ! this.config.portal_user ) this.config.portal_user = "";
		if( ! this.config.portal_password ) this.config.portal_password = "";

		// Encryption required by E3/DC:
		this.aesKey = Buffer.alloc( KEY_SIZE, 0xFF );
		this.encryptionIV = Buffer.alloc( BLOCK_SIZE, 0xFF );
		this.decryptionIV = Buffer.alloc( BLOCK_SIZE, 0xFF );
		if( this.aesKey.write( this.config.rscp_password ) > this.config.rscp_password.length ) this.log.error("ERROR initializing AES-KEY!");
		// log.debug( "encryptionIV: " + this.encryptionIV.toString("hex") );
		// log.debug( "decryptionIV: " + this.decryptionIV.toString("hex") );
		// log.debug( "aesKey:       " + this.aesKey.toString("hex") );
		this.cipher = new Rijndael(this.aesKey, "cbc");

		// Initial authentication frame:
		this.queueAuthentication();

		// TCP connection:
		this.tcpConnection.connect( this.config.e3dc_port, this.config.e3dc_ip, () => {
			this.log.info("Connection to E3/DC is established");
			this.sendNextFrame();
		});

		this.tcpConnection.on("data", (data) => {
			// Use inBuffer to handle TCP fragmentation:
			if( this.inBuffer ) {
				this.inBuffer = Buffer.concat( [this.inBuffer, data] );
			} else {
				this.inBuffer = Buffer.from( data );
			}
			if( this.inBuffer && this.inBuffer.length % 32 == 0 ) {
				const receivedFrame = Buffer.from(this.cipher.decrypt(this.inBuffer, 256, this.decryptionIV));
				this.log.debug("Received response");
				if( rscpTag[receivedFrame.readUInt32LE(18)] ) this.log.silly(rscpTag[receivedFrame.readUInt32LE(18)].TagNameGlobal);
				if( this.decryptionIV ) this.inBuffer.copy( this.decryptionIV, 0, this.inBuffer.length - BLOCK_SIZE ); // last encrypted block will be used as IV for next frame
				this.log.debug( `IN: ${printRscpFrame(receivedFrame)}` );
				this.log.silly( dumpRscpFrame(receivedFrame) );
				this.processFrame(receivedFrame);
				this.sendNextFrame();
				this.inBuffer = null;
			} else {
				this.log.debug(`inBuffer has length ${this.inBuffer.length} which is not a multiple of 256bit - waiting for next chunk...`);
			}
		});

		this.tcpConnection.on("end", () => {
			this.log.warn("Disconnected from E3/DC");
			this.reconnectChannel();
		});

		this.tcpConnection.on("close", () => {
			this.log.warn("E3/DC connection closed");
		});

		this.tcpConnection.on("timeout", () => {
			this.log.info("E3/DC connection timeout");
			this.reconnectChannel();
		});

		this.tcpConnection.on("error", () => {
			this.log.error("E3/DC connection error");
			this.reconnectChannel();
		});
	}

	reconnectChannel() {
		setTimeout(() => {
			this.log.info("Reconnecting to E3/DC ...");
			this.tcpConnection.removeAllListeners();
			//this.tcpConnection.connect( this.config.e3dc_port, this.config.e3dc_ip, () => {
			//	this.log.info("Successfully reconnected to E3/DC");
			//	this.sendNextFrame();
			//});
			//this.tcpConnection = new Net.Socket(); // when reusing socket, E3/DC returns NO_ACCESS
			this.initChannel();
		}, 10000);
	}

	clearFrame() { // preset MAGIC and CTRL and reserve space for timestamp and length
		this.frame = Buffer.from([0xE3, 0xDC, 0x00, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
	}

	addTagtoFrame( tagCode, value ) {
		const typeCode = parseInt( rscpTag[tagCode].DataTypeHex, 16 );
		const buf1 = Buffer.alloc(1);
		const buf2 = Buffer.alloc(2);
		const buf4 = Buffer.alloc(4);
		//const buf6 = Buffer.alloc(6);
		const buf8 = Buffer.alloc(8);
		buf4.writeInt32LE( tagCode );
		this.frame = Buffer.concat( [this.frame, buf4] );
		this.frame = Buffer.concat( [this.frame, Buffer.from([typeCode])] );
		this.frame = Buffer.concat( [this.frame, Buffer.from([0x00, 0x00])] ); // reserve space for Length
		try{
			switch( rscpType[typeCode] ) {
				case "None":
					break;
				case "Container":
					if( this.openContainer > 0 ) {
						this.frame.writeUInt16LE( this.frame.length - this.openContainer - 9, this.openContainer );
					}
					this.openContainer = this.frame.length - 2;
					break;
				case "CString":
				case "Bitfield":
				case "ByteArray":
					this.frame.writeUInt16LE(value.length, this.frame.length - 2);
					this.frame = Buffer.concat( [this.frame, Buffer.from(value)] );
					break;
				case "Char8":
				case "UChar8":
				case "Error":
					this.frame.writeUInt16LE( 1, this.frame.length - 2);
					buf1.writeUInt8( value );
					this.frame = Buffer.concat( [this.frame, buf1] );
					break;
				case "Bool": // bool is encoded as 0/1 byte
					this.frame.writeUInt16LE( 1, this.frame.length - 2);
					buf1.writeUInt8( value?1:0 );
					this.frame = Buffer.concat( [this.frame, buf1] );
					break;
				case "Int16":
					this.frame.writeUInt16LE( 2, this.frame.length - 2 );
					buf2.writeInt16LE( value );
					this.frame = Buffer.concat( [this.frame, buf2] );
					break;
				case "UInt16":
					this.frame.writeUInt16LE( 2, this.frame.length - 2 );
					buf2.writeUInt16LE( value );
					this.frame = Buffer.concat( [this.frame, buf2] );
					break;
				case "Int32":
					this.frame.writeUInt16LE( 4, this.frame.length - 2 );
					buf4.writeInt32LE( value );
					this.frame = Buffer.concat( [this.frame, buf4] );
					break;
				case "UInt32":
					this.frame.writeUInt16LE( 4, this.frame.length - 2 );
					buf4.writeUInt32LE( value );
					this.frame = Buffer.concat( [this.frame, buf4] );
					break;
				case "Int64":
					this.frame.writeUInt16LE( 8, this.frame.length - 2 );
					buf8.writeBigInt64LE( value );
					this.frame = Buffer.concat( [this.frame, buf8] );
					break;
				case "UInt64":
					this.frame.writeUInt16LE( 8, this.frame.length - 2 );
					buf8.writeBigUInt64LE( value );
					this.frame = Buffer.concat( [this.frame, buf8] );
					break;
				case "Float32":
					this.frame.writeUInt16LE( 4, this.frame.length - 2 );
					buf4.writeFloatLE( value );
					this.frame = Buffer.concat( [this.frame, buf4] );
					break;
				case "Double64":
					this.frame.writeUInt16LE( 8, this.frame.length - 2 );
					buf8.writeDoubleLE( value );
					this.frame = Buffer.concat( [this.frame, buf8] );
					break;
				case "Timestamp": // CAUTION: treating value as seconds - setting nanoseconds to zero
					this.frame.writeUInt16LE( 12, this.frame.length - 2 );
					buf8.writeUIntLE( value, 0, 8 );
					this.frame = Buffer.concat( [this.frame, buf8, new Uint8Array([0x00,0x00,0x00,0x00])] );
					break;
				default:
					this.log.warn(`addTagtoFrame does not know how to handle data type ${rscpType[typeCode]}`);
			}
		} catch (e) {
			if( e instanceof TypeError || e instanceof RangeError ) {
				this.log.warn(`addTagtoFrame failed with type ${rscpType[typeCode]}, value ${value} -  ${e}`);
			}
		}
	}

	pushFrame() { // finalize frame, then push it to the queue
		this.frame.writeUIntLE( Math.floor(new Date().getTime()/1000), 4, 6 ); // set timestamp - bytes 7,8 remain zero (which will be wrong after 19.01.2038)
		this.frame.writeUInt16LE( this.frame.length - 18, 16 ); // set total length
		if( this.openContainer > 0 ) {
			this.frame.writeUInt16LE( this.frame.length - this.openContainer - 2, this.openContainer );
			this.openContainer = 0;
		}
		const buf4 = Buffer.alloc(4);
		buf4.writeInt32LE( CRC32.buf(this.frame) );
		this.frame = Buffer.concat( [this.frame, buf4] ); // concat returns a copy of this.frame, which therefore can be reused
		this.queue.push(this.frame);
	}

	queueAuthentication( ) {
		this.clearFrame();
		this.addTagtoFrame( rscpTagCode["TAG_RSCP_REQ_AUTHENTICATION"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_RSCP_AUTHENTICATION_USER"], this.config.portal_user );
		this.addTagtoFrame( rscpTagCode["TAG_RSCP_AUTHENTICATION_PASSWORD"], this.config.portal_password );
		this.pushFrame();
	}

	queueRequestEmsData() {
		this.clearFrame();
		this.addTagtoFrame( rscpTagCode["TAG_EMS_REQ_POWER_PV"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_EMS_REQ_POWER_BAT"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_EMS_REQ_POWER_HOME"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_EMS_REQ_POWER_GRID"], "" );
		this.pushFrame();
		this.clearFrame();
		this.addTagtoFrame( rscpTagCode["TAG_EMS_REQ_GET_POWER_SETTINGS"], "" );
		this.pushFrame();
	}

	queueRequestBatData() {
		this.clearFrame();

		// RSCP doc says: BAT index is always 0 - therefore, no index handling on battery level
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_DATA"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_INDEX"], 0 );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_USABLE_CAPACITY"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_USABLE_REMAINING_CAPACITY"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_ASOC"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_RSOC_REAL"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_MAX_BAT_VOLTAGE"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_MAX_CHARGE_CURRENT"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_EOD_VOLTAGE"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_MAX_DISCHARGE_CURRENT"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_CHARGE_CYCLES"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_TERMINAL_VOLTAGE"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_MAX_DCB_CELL_TEMPERATURE"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_MIN_DCB_CELL_TEMPERATURE"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_READY_FOR_SHUTDOWN"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_TRAINING_MODE"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_FCC"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_RC"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_INFO"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_DCB_COUNT"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_DEVICE_NAME"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_DEVICE_STATE"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_SPECIFICATION"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_INTERNALS"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_TOTAL_USE_TIME"], "" );
		this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_TOTAL_DISCHARGE_TIME"], "" );
		let dcbCount = 1;
		this.getState("BAT.DCB_COUNT", (error,state) => {
			if( !error && state ) {
				dcbCount = Number(state.val);
			}
		});
		for( let dcbIndex=0; dcbIndex <= dcbCount; dcbIndex++ ) {
			this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_DCB_ALL_CELL_TEMPERATURES"], dcbIndex );
			this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_DCB_ALL_CELL_VOLTAGES"], dcbIndex );
			this.addTagtoFrame( rscpTagCode["TAG_BAT_REQ_DCB_INFO"], dcbIndex );
		}
		this.pushFrame();
	}

	queueValue( global_id, value ) {
		this.log.debug( `queueValue( ${global_id}, ${value} )`);
		const [,,namespace,tagname] = global_id.split(".");
		const id = `${namespace}.${tagname}`;
		if( setTag[id] ) {
			this.clearFrame();
			this.addTagtoFrame( encodeRscpTag(setTag[id]), "" );
			this.addTagtoFrame( encodeRscpTag(id), value );
			this.pushFrame();
		} else {
			this.log.debug( `Don't know how to queue ${id}`);
		}
	}

	sendNextFrame() {
		if( this && this.queue[0] ) {
			this.log.debug( `Sending request ${rscpTag[this.queue[0].readUInt32LE(18)].TagNameGlobal}` );
			this.log.debug( `OUT: ${printRscpFrame(this.queue[0])}` );
			this.log.silly( dumpRscpFrame(this.queue[0]) );

			const encryptedFrame = Buffer.from( this.cipher.encrypt( this.queue[0], 256, this.encryptionIV ) );
			// last encrypted block will be used as IV for next frame
			if( this.encryptionIV ) encryptedFrame.copy( this.encryptionIV, 0, encryptedFrame.length - BLOCK_SIZE );

			if( this.tcpConnection && this.tcpConnection.write( encryptedFrame ) ) {
				this.log.debug( `Successfully written data to socket` );
				this.queue.shift();
			} else {
				this.log.error( `Failed writing data to socket` );
			}
		} else {
			this.log.debug( "Message queue is empty");
		}
	}

	processDataToken( buffer, pos ) {
		const tagCode = buffer.readUInt32LE(pos);
		const typeCode = buffer.readUInt8(pos+4);
		const len = buffer.readUInt16LE(pos+5);
		let value;
		if( rscpType[typeCode] == "Container" ) {
			return 7; // just skip container header
		} else if( rscpType[typeCode] == "Error" ) {
			value = buffer.readUInt32LE(pos+7);
			this.log.warn( `Received data type ERROR with value ${rscpGeneralError[value]} - tag ${rscpTag[tagCode].TagName}` );
			return 7+len;
		} else {
			switch( rscpType[typeCode]  ) {
				case "None":
					if( len > 0 ) this.log.warn( `Received data type NONE with data length = ${len} - tagCode 0x${tagCode.toString(16)}` );
					break;
				case "CString":
				case "BitField":
				case "ByteArray":
					value = buffer.toString("utf8",pos+7,pos+7+len);
					break;
				case "Char8":
					value = buffer.readInt8(pos+7);
					break;
				case "UChar8":
					value = buffer.readUInt8(pos+7);
					break;
				case "Bool":
					value = (buffer.readUInt8(pos+7) != 0);
					break;
				case "Int16":
					value = buffer.readInt16LE(pos+7);
					break;
				case "UInt16":
					value = buffer.readUInt16LE(pos+7);
					break;
				case "Int32":
					value = buffer.readInt32LE(pos+7);
					break;
				case "UInt32":
					value = buffer.readUInt32LE(pos+7);
					break;
				case "Int64":
					value = buffer.readBigInt64LE(pos+7).toString(); // setState does not accept BigInt, so use string representation
					break;
				case "UInt64":
					value = buffer.readBigUInt64LE(pos+7).toString(); // setState does not accept BigInt, so use string representation
					break;
				case "Double64":
					value = roundForReadability( buffer.readDoubleLE(pos+7) );
					break;
				case "Float32":
					value = roundForReadability( buffer.readFloatLE(pos+7) );
					break;
				case "Timestamp":
					value = Math.round(buffer.readBigUInt64LE(pos+7)/1000); // setState does not accept BigInt, so convert to seconds
					break;
				default:
					this.log.warn( `Unable to parse data: ${dumpRscpFrame( buffer.slice(pos+7,pos+7+len) )}` );
					value = null;
			}
			if( !rscpTag[tagCode] ) {
				this.log.warn(`Unknown tag: tagCode=0x${tagCode.toString(16)}, len=${len}, typeCode=0x${typeCode.toString(16)}, value=${value}`);
			} else {
				let typeName = rscpType[typeCode];
				let id = `${rscpTag[tagCode].NameSpace}.${rscpTag[tagCode].TagName}`;
				if( rscpTag[tagCode].TagName == "INDEX" ) {
					if( rscpTag[tagCode].NameSpace == "BAT" ) {
						this.index1 = ""; // BAT index is always 0; do not add a channel
					} else {
						this.index1 = `${rscpTag[tagCode].NameSpace}#${value}`;
					}
					this.index2 = "";
					this.index3 = -1;
					return 7+len;
				}
				if( rscpTag[tagCode].TagName.endsWith("_INDEX") ) {
					this.index2 = `${rscpTag[tagCode].TagName.replace("_INDEX","")}#${value}`;
					this.index3 = -1;
					return 7+len;
				}
				if( multipleValue.includes(id) ) {
					// @ts-ignore
					this.index3++;
				}
				let targetStateMatch = null;
				if( targetState[id] ) {
					if( targetState[id]["*"] ) targetStateMatch = "*";
					if( targetState[id][typeName] ) targetStateMatch = typeName;
					if( targetStateMatch && targetState[id][targetStateMatch].targetState == "RETURN_CODE" && value < 0 ) {
						this.log.warn(`SET failed: ${id} = ${value}`);
					}
				}
				if( castToBoolean.includes(id) && ( typeName == "Char8" || typeName == "UChar8" ) ) {
					value = (value!=0);
					typeName = "Bool";
				}
				if( castToTimestamp.includes(id) && typeName == "UInt64" ) {
					value = Math.round(value/1000); // setState does not accept BigInt, so convert to seconds
					typeName = "Timestamp";
				}
				if( negateValue.includes(id) ) value = -value;
				if( discardValue.includes(id) ) {
					this.log.debug(`Ignoring tag: ${id}, value=${value}`);
					return 7+len;
				}
				if( targetStateMatch ) id = targetState[id][targetStateMatch];
				// Insert indexes into id path (if so)
				const arr = id.split(".");
				id = arr[0];
				if( this.index1 != "" ) id += `.${this.index1}`;
				if( this.index2 != "" ) id += `.${this.index2}`;
				id += `.${arr[1]}`;
				// @ts-ignore
				if( this.index3 >= 0 ) id += `.${this.index3.toString().padStart(2,"0")}`;
				// Create state object dynamically (unless already done earlier)
				const oKey = `${rscpTag[tagCode].NameSpace}.${rscpTag[tagCode].TagName}`;
				const oWrite = oKey in setTag;
				let oRole = "";
				if( typeName == "Bool") {
					oRole = oWrite?"switch":"indicator";
				} else {
					oRole = oWrite?"level":"value";
				}
				const oName = systemDictionary[rscpTag[tagCode].TagName] ? systemDictionary[rscpTag[tagCode].TagName][this.language] : "***UNDEFINED***";
				//this.log.silly(`oName=${oName}, oRole=${oRole}, oWrite=${oWrite}`);
				this.setObjectNotExists( id, {
					type: "state",
					common: {
						name: oName,
						type: rscpTypeMap[typeName],
						role: oRole,
						read: true,
						write: oWrite,
						states: (commonStates[oKey] ? commonStates[oKey].states : ""),
					},
					native: {},
				}, () => {
					this.log.silly(`this.setState( "${id}", ${value}, true )`);
					this.setState( id, value, true );
				});
				return 7+len;
			}
		}
	}

	processFrame( buffer ) {
		this.index1 = ""; // reset "INDEX" tag
		this.index2 = ""; // reset "..._INDEX" tag
		this.index3 = -1; // reset multiple value counter
		const magic = buffer.toString("hex",0,2).toUpperCase();
		if( magic != "E3DC" ) {
			this.log.warn(`Received message with invalid MAGIC: >${magic}<`);
		}
		const ctrl = buffer.toString("hex",2,4).toUpperCase();
		let hasCrc = false;
		switch( ctrl ) {
			case "0010":
				hasCrc = false;
				break;
			case "0011":
				hasCrc = true;
				break;
			default:
				this.log.warn(`Received message with invalid CTRL: >${ctrl}<`);
		}
		const dataLength = buffer.readUInt16LE(16);
		let i = this.processDataToken( buffer, 18 );
		while( i < dataLength ) {
			i += this.processDataToken( buffer, 18+i );
		}
		if( buffer.length < 18 + dataLength + (hasCrc ? 4 : 0) ) {
			this.log.warn(`Received message with inconsistent length: ${buffer.length} vs ${18 + dataLength + (hasCrc ? 4 : 0)}`);
			this.log.debug( `IN: ${printRscpFrame(buffer)}` );
			this.log.silly( dumpRscpFrame(buffer) );
		}
		if( hasCrc && (CRC32.buf(buffer.slice(0,18+dataLength)) != buffer.readInt32LE(18+i))  ) {
			this.log.warn(`Received message with invalid CRC-32: 0x${CRC32.buf(buffer.slice(0,18+dataLength)).toString(16)} vs 0x${buffer.readUInt32LE(18+i).toString(16)} - dataLength = ${dataLength}`);
			this.log.silly( dumpRscpFrame(buffer) );
		}
	}

	// ioBroker best practice for password encryption, using key native.secret
	decryptPassword(key="", value="") {
		let result = "";
		for (let i = 0; i < value.length; ++i) {
			result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
		}
		return result;
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.log.debug( `config.*: (${this.config.e3dc_ip}, ${this.config.e3dc_port}, ${this.config.rscp_password}, ${this.config.portal_user}, ${this.config.portal_password}, ${this.config.polling_interval})` );
		// @ts-ignore
		this.getForeignObject("system.config", (err, obj) => {
			if (obj && obj.native && obj.native.secret) {
				this.config.rscp_password = this.decryptPassword(obj.native.secret,this.config.rscp_password);
				this.config.portal_password = this.decryptPassword(obj.native.secret,this.config.portal_password);
				this.initChannel();
				dataPollingTimer = setInterval(() => {
					this.queueRequestEmsData();
					this.queueRequestBatData();
					this.sendNextFrame();
				}, this.config.polling_interval*1000 );
			} else {
				this.log.error( "Cannot initialize adapter because obj.native.secret is null." );
			}
		});

		/*
		For every state in the system there has to be also an object of type state
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		// Statically, we define only one device per supported RSCP namespace - rest of the object tree is defined dynamically.
		/*
		await this.setObjectNotExistsAsync("RSCP", {
			type: "channel",
			common: {
				name: systemDictionary["RSCP"][this.language],
				role: "communication.protocol",
				desc: systemDictionary["RSCP_DESC"][this.language],
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("BAT", {
			type: "channel",
			common: {
				name: systemDictionary["BAT"][this.language],
				role: "electricity.storage",
				desc: systemDictionary["BAT_DESC"][this.language],
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("EMS", {
			type: "channel",
			common: {
				name: systemDictionary["EMS"][this.language],
				role: "energy.management",
				desc: systemDictionary["EMS_DESC"][this.language],
			},
			native: {},
		});
		*/
		await this.setObjectNotExistsAsync("RSCP", {
			type: "device",
			common: {
				name: systemDictionary["RSCP"][this.language],
				role: "communication.protocol",
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("BAT", {
			type: "device",
			common: {
				name: systemDictionary["BAT"][this.language],
				role: "battery.storage",
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("EMS", {
			type: "device",
			common: {
				name: systemDictionary["EMS"][this.language],
				role: "energy.management",
			},
			native: {},
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("RSCP.AUTHENTICATION");
		for( const s in targetState ) this.subscribeStates(s);
		// You can also add a subscription for multiple states. The following line watches all states starting with 'lights.'
		// this.subscribeStates('lights.*');
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates('*');

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)

		// the variable testVariable is set to true as command (ack=false)
		await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged 'ack'
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);
		*/
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			clearInterval(dataPollingTimer);
			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state change
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			if( !state.ack ) {
				this.queueValue( id, state.val );
			} else if( id.endsWith("RSCP.AUTHENTICATION") && state.val == 0 ) {
				this.log.warn( `E3/DC authentication failed`);
			}
		} else {
			// The state was deleted
			this.log.debug(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires 'common.messagebox' property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new E3dcRscp(options);
} else {
	// otherwise start the instance directly
	new E3dcRscp();
}

//
// Helper functions for human-readable display of RSCP frames
//
function dumpRscpFrame( buffer ) {
	const bpb = 8; // bytes per block
	const bpl = 2; // blocks per line
	let line = 0;
	let block = 0;
	let i = 0;
	let b = 0;
	let result = "";
	for( line = 0; line*bpl*bpb < buffer.length; line++ ) {
		// Loop 1: hex
		for( block = 0; block < bpl && (line*bpl+block)*bpb < buffer.length; block++ ) {
			for( i = 0; i < bpb && (line*bpl+block)*bpb+i < buffer.length; i++ ) {
				result += ("0"+buffer.readUInt8((line*bpl+block)*bpb+i).toString(16)).slice(-2).toUpperCase()+" ";
			}
			result += "  ";
		}
		result += " -- ";
		// Loop 2: ASCII
		for( block = 0; block < bpl && (line*bpl+block)*bpb < buffer.length; block++ ) {
			for( i = 0; i < bpb && (line*bpl+block)*bpb+i < buffer.length; i++ ) {
				b = buffer.readUInt8((line*bpl+block)*bpb+i);
				if( b < 32 || b > 126 ) { b = 46; }
				result += String.fromCharCode(b);
			}
		}
		result += "\r\n";
	}
	return result;
}

function parseRscpToken ( buffer, pos, text ) {
	if( buffer.length < pos+7 ) {
		text.content += " - invalid tag, buffer is too short.";
		return buffer.length;
	}
	const tagCode = buffer.readUInt32LE(pos);
	const typeCode = buffer.readUInt8(pos+4);
	const typeName = rscpType[typeCode];
	const len = buffer.readUInt16LE(pos+5);
	if( !rscpTag[tagCode] || buffer.length < pos+7+len ) {
		text.content += ` - invalid tag: 0x${tagCode.toString(16).toUpperCase().padStart(2,"0")}`;
		return buffer.length;
	}
	text.content += `${rscpTag[tagCode].TagNameGlobal} - type: 0x${typeCode.toString(16).toUpperCase().padStart(2,"0")} - ${rscpType[typeCode]} - length: ${len} `;
	switch( typeName ) {
		case "None":
			if( len > 0 ) text.content += `CAUTION: length of data is ${len} `;
			return 7+len;
		case "Container":
			text.content += "<Container content follows...> ";
			return 7; // length of container header, not content
		case "CString":
		case "Bitfield":
		case "ByteArray":
			text.content += `value: ${buffer.toString("utf8",pos+7,pos+7+len)} `;
			return 7+len;
		case "Char8":
		case "UChar8":
		case "Bool":
			if( buffer.readUInt8(pos+7) > 31 && buffer.readUInt8(pos+7) < 127 && (typeName == "Char8" || typeName == "UChar8")  ) {
				text.content += `value: ${buffer.toString("utf8",pos+7,pos+8)} `;
			} else {
				text.content += `value: 0x${buffer.readUInt8(pos+7).toString(16).toUpperCase().padStart(2,"0")} `;
			}
			return 7+len;
		case "Int16":
			text.content += `value: ${buffer.readInt16LE(pos+7)} `;
			return 7+len;
		case "UInt16":
			text.content += `value: ${buffer.readUInt16LE(pos+7)} `;
			return 7+len;
		case "Int32":
			text.content += `value: ${buffer.readInt32LE(pos+7)} `;
			return 7+len;
		case "UInt32":
			text.content += `value: ${buffer.readUInt32LE(pos+7)} `;
			return 7+len;
		case "Int64":
			text.content += `value: ${buffer.readBigInt64LE(pos+7)} `;
			return 7+len;
		case "UInt64":
			text.content += `value: ${buffer.readBigUInt64LE(pos+7)} `;
			return 7+len;
		case "Error":
			text.content += `value: ${buffer.readUInt32LE(pos+7)} `;
			return 7+len;
		case "Double64":
			text.content += `value: ${buffer.readDoubleLE(pos+7)} `;
			return 7+len;
		case "Float32":
			text.content += `value: ${buffer.readFloatLE(pos+7)} `;
			return 7+len;
		case "Timestamp":
			text.content += `seconds: ${buffer.readUInt64LE(pos+7)} - nseconds: ${buffer.readUInt32LE(pos+7+8)} `;
			return 7+len;
		default:
			if( len > 0 ) text.content += `${dumpRscpFrame(buffer.slice(pos+7,pos+7+len))} `;
			return 7+len;
	}
}

function printRscpFrame( buffer ) {
	const result = { content: "" };
	const magic = buffer.toString("hex",0,2).toUpperCase();
	if( magic == "E3DC" ) {
		result.content += `magic: >${magic}< is OK `;
	} else {
		result.content += `magic: >${magic}< is WRONG `;
	}
	const ctrl = buffer.toString("hex",2,4).toUpperCase();
	switch( ctrl ) {
		case "0010":
			result.content += ` - ctrl: >${ctrl}< is OK - Version 1, no CRC `;
			break;
		case "0011":
			result.content += ` - ctrl: >${ctrl}< is OK - Version 1, with CRC `;
			break;
		default:
			result.content += ` - ctrl: >${ctrl}< is WRONG `;
	}
	result.content += ` - seconds: ${buffer.readUIntLE(4,6)} - nseconds: ${buffer.readUInt32LE(12)} - length: ${buffer.readUInt16LE(16)}\r\n`;
	let i = parseRscpToken( buffer, 18, result );
	while( i < buffer.readUInt16LE(16) ) {
		if( buffer.length >= 18+i+7 ) {
			result.content += "\r\n";
			i += parseRscpToken( buffer, 18+i, result );
		} else break;
	}
	if( buffer.length == 18+i+4 ) {
		result.content += "\r\nCRC32";
	} else {
		result.content += "\r\nno CRC32";
	}
	return result.content;
}

// Find numerical RSCP tag code for a given string. Accepts
// (1) full global tag, e.g. TAG_EMS_MAX_CHARGE_POWER
// (2) global tag without TAG_ prefix, e.g. EMS_MAX_CHARGE_POWER
// (3) object id, e.g. EMS.MAX_CHARGE_POWER
// returns null if no match.
function encodeRscpTag( name ) {
	if( name.indexOf("TAG_") != 0 ) name = `TAG_${name}`;
	name = name.replace(".","_");
	return rscpTagCode[name];
}

// Round numerical values for better readability
// If the integer part is has more digits than <s>, then round to integer.
// Otherwise, round so that the result has <s> digits in total: <int-digits> + <fraction-digits> = <s>.
function roundForReadability( n ) {
	const s = 4; // number of significant digits
	const d = Math.abs(Math.round(n)).toString().length;
	if( d >= s ) {
		return Math.round(n);
	} else {
		const p = Math.pow(10,s-d);
		return Math.round(n*p)/p;
	}
}