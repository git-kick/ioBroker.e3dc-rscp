"use strict";

const Sentry = require("@sentry/node");
// or use es6 import statements
// import * as Sentry from '@sentry/node';

// const Tracing = require("@sentry/tracing");
// or use es6 import statements
// import * as Tracing from '@sentry/tracing';

Sentry.init({
	dsn: "https://cc70dc76ca0d4bc89be51866648d109c@o1065834.ingest.sentry.io/6058026",

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
	op: "test",
	name: "My First Test Transaction",
});

// System dictionary
const fs = require("fs");
// eslint-disable-next-line prefer-const
let systemDictionary = {};
eval(fs.readFileSync("./admin/words.js").toString());

const dayOfWeek = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

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
const rscpEmsCouplingMode = {
	0: "DC",
	1: "DC_MULTIWR",
	2: "AC",
	3: "HYBRID",
	4: "ISLAND",
};
const rscpEmsEmergencyPowerStatus = {
	0: "NOT_POSSIBLE",
	1: "ACTIVE",
	2: "NOT_ACTIVE",
	3: "NOT_AVAILABLE",
	4: "SWITCH_IN_ISLAND_STATE",
};
const rscpEmsIdlePeriodType = {
	0: "IDLE_CHARGE",
	1: "IDLE_DISCHARGE",
};
/* RSCP enumerations for later use:
const rscpEmsSetEmergencyPower = {
	0: "NORMAL_GRID_MODE",
	1: "EMERGENCY_MODE",
	2: "ISLAND_NO_POWER_MODE",
};
const rscpEmsSetPowerMode = {
	0: "NORMAL",
	1: "IDLE",
	2: "ENTLADEN",
	3: "LADEN",
	4: "NETZLADEN",
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
	"RSCP.GENERAL_ERROR": rscpGeneralError,
	"RSCP.AUTHENTICATION": rscpAuthLevel,
	"BAT.GENERAL_ERROR": rscpGeneralError,
	"BAT.TRAINING_MODE": rscpBatTrainingMode,
	"PVI.TYPE": rscpPviType,
	"PVI.SYSTEM_MODE": rscpPviSystemMode,
	"PVI.POWER_MODE": rscpPviPowerMode,
	"EMS.GENERAL_ERROR": rscpGeneralError,
	"EMS.RETURN_CODE": rscpReturnCode,
	"EMS.COUPLING_MODE": rscpEmsCouplingMode,
	"EMS.EMERGENCY_POWER_STATUS": rscpEmsEmergencyPowerStatus,
	"EMS.IDLE_PERIOD_TYPE": rscpEmsIdlePeriodType,
};
// List of all writable states, with Mapping for response value handling.
// type "*" means: apply to all types
const targetStates = {
	"EMS.RES_POWERSAVE_ENABLED": { "*": "EMS.POWERSAVE_ENABLED" },
	"EMS.RES_WEATHER_REGULATED_CHARGE_ENABLED": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_CHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_DISCHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.DISCHARGE_START_POWER": { "Int32": "EMS.DISCHARGE_START_POWER", "Char8": "EMS.RETURN_CODE" },
	"EMS.USER_CHARGE_LIMIT": { "*": "EMS.MAX_CHARGE_POWER" },
	"EMS.USER_DISCHARGE_LIMIT": { "*": "EMS.MAX_DISCHARGE_POWER" },
};
// For each writable state, define how to send a SET to E3/DC
const setTags = {
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
	"EMS.hybridModeSupported",
	"EMS.BATTERY_BEFORE_CAR_MODE",
	"EMS.BATTERY_TO_CAR_MODE",
	"EMS.EXT_SRC_AVAILABLE",
];
// RSCP is sloppy concerning Timestamp - some UInt64 values must be converted:
const castToTimestamp = [
	"BAT.DCB_LAST_MESSAGE_TIMESTAMP",
];
// Adjust algebraic sign: e.g. discharge limit is sometimes positive, sometimes negative
const negateValue = [
	"EMS.USER_DISCHARGE_LIMIT",
];
// Adjust to percent (divide by 100):
const percentValue = [
	"EMS.DERATE_AT_PERCENT_VALUE",
];
// For multiple values within one frame, a subchannel will be generated
const multipleValue = [
	"BAT.DCB_CELL_TEMPERATURE",
	"BAT.DCB_CELL_VOLTAGE",
	"PVI.RELEASE",
];
// Some indexed tags are grouped within a channel
const phaseTags = [
	"AC_POWER",
	"AC_VOLTAGE",
	"AC_CURRENT",
	"AC_APPARENTPOWER",
	"AC_REACTIVEPOWER",
	"AC_ENERGY_ALL",
	"AC_ENERGY_GRID_CONSUMPTION",
];
const stringTags = [
	"DC_POWER",
	"DC_VOLTAGE",
	"DC_CURRENT",
	"DC_STRING_ENERGY_ALL",
];
// Some of the return values we do not want to see as (missing) states:
// "INDEX" and "..._INDEX" tags are automatically treated as subchannels, no need to list them here.
const ignoreTags = [
	"RSCP.UNDEFINED",
	"EMS.UNDEFINED_POWER_SETTING",
	"EMS.SYS_SPEC_INDEX",
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
// Some of the INDEX values are redundant and can be safely ignored:
// Listed here are containers which contain redundant INDEX tags.
const ignoreIndexTags = [
	"AC_MAX_APPARENTPOWER",
	"MIN_TEMPERATURE",
	"MAX_TEMPERATURE",
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

		// For preparing & buffering outbound frames:
		this.frame = null; // buffer for generating frames
		this.openContainer = 0; // start pos of open container when generating frame
		this.queue = []; // outbound message queue

		// For processing inbound frames:
		this.currentContainer = []; // array of (TagName, endPos), for (possibly nested) containers
		this.sysSpecName = ""; // value name recorded for next value tag
		this.idlePeriodType = 0; // recorded for following values
		this.level1; // level below namespace, for INDEX tags
		this.level2; // level below namespace/device, for ..._INDEX tags
		this.level3; // level below namespace/device{/channel}, for multiple values, e.g. DCB_CELL_TEMPERATURE
		this.maxIndex = {}; // observed max. indexes, e.g. BAT.INDEX, DCB_COUNT etc.

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
		// Find out number of BAT units:
		const batProbes = 4;
		this.log.warn(`Probing for BAT units - up to ${batProbes} messages about received ERROR may follow (just ignore them).`);
		this.queueBatProbe(batProbes);
		// Find out number of PVI units and sensors:
		const pviProbes = 3;
		this.log.warn(`Probing for PVI units - up to ${pviProbes} messages about received ERROR may follow (just ignore them).`);
		this.queuePviProbe(pviProbes);

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
			this.initChannel();
		}, 10000);
	}

	clearFrame() { // preset MAGIC and CTRL and reserve space for timestamp and length
		this.frame = Buffer.from([0xE3, 0xDC, 0x00, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
	}

	addTagtoFrame( globalTagName, value = Object(0) ) {
		if( !rscpTagCode[globalTagName] ) {
			this.log.warn(`Unknown tag ${globalTagName} - ignored.`);
		}
		const tagCode = rscpTagCode[globalTagName];
		const typeCode = parseInt( rscpTag[tagCode].DataTypeHex, 16 );
		const buf1 = Buffer.alloc(1);
		const buf2 = Buffer.alloc(2);
		const buf4 = Buffer.alloc(4);
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
		this.addTagtoFrame( "TAG_RSCP_REQ_AUTHENTICATION" );
		this.addTagtoFrame( "TAG_RSCP_AUTHENTICATION_USER", this.config.portal_user );
		this.addTagtoFrame( "TAG_RSCP_AUTHENTICATION_PASSWORD", this.config.portal_password );
		this.pushFrame();
	}

	queueBatProbe( probes ) {
		for( let batIndex = 0; batIndex < probes; batIndex++ ) {
			this.clearFrame();
			this.addTagtoFrame( "TAG_BAT_REQ_DATA" );
			this.addTagtoFrame( "TAG_BAT_INDEX", batIndex );
			this.addTagtoFrame( "TAG_BAT_REQ_ASOC" );
			this.pushFrame();
		}
	}

	queueRequestBatData() {
		for( let batIndex = 0; batIndex <= this.maxIndex["BAT"]; batIndex++ ) {
			this.clearFrame();
			this.addTagtoFrame( "TAG_BAT_REQ_DATA" );
			this.addTagtoFrame( "TAG_BAT_INDEX", batIndex );
			this.addTagtoFrame( "TAG_BAT_REQ_USABLE_CAPACITY" );
			this.addTagtoFrame( "TAG_BAT_REQ_USABLE_REMAINING_CAPACITY" );
			this.addTagtoFrame( "TAG_BAT_REQ_ASOC" );
			this.addTagtoFrame( "TAG_BAT_REQ_RSOC_REAL" );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_BAT_VOLTAGE" );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_CHARGE_CURRENT" );
			this.addTagtoFrame( "TAG_BAT_REQ_EOD_VOLTAGE" );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_DISCHARGE_CURRENT" );
			this.addTagtoFrame( "TAG_BAT_REQ_CHARGE_CYCLES" );
			this.addTagtoFrame( "TAG_BAT_REQ_TERMINAL_VOLTAGE" );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_DCB_CELL_TEMPERATURE" );
			this.addTagtoFrame( "TAG_BAT_REQ_MIN_DCB_CELL_TEMPERATURE" );
			this.addTagtoFrame( "TAG_BAT_REQ_READY_FOR_SHUTDOWN" );
			this.addTagtoFrame( "TAG_BAT_REQ_TRAINING_MODE" );
			this.addTagtoFrame( "TAG_BAT_REQ_FCC" );
			this.addTagtoFrame( "TAG_BAT_REQ_RC" );
			this.addTagtoFrame( "TAG_BAT_REQ_INFO" );
			this.addTagtoFrame( "TAG_BAT_REQ_DCB_COUNT" );
			this.addTagtoFrame( "TAG_BAT_REQ_DEVICE_NAME" );
			this.addTagtoFrame( "TAG_BAT_REQ_DEVICE_STATE" );
			this.addTagtoFrame( "TAG_BAT_REQ_SPECIFICATION" );
			this.addTagtoFrame( "TAG_BAT_REQ_INTERNALS" );
			this.addTagtoFrame( "TAG_BAT_REQ_TOTAL_USE_TIME" );
			this.addTagtoFrame( "TAG_BAT_REQ_TOTAL_DISCHARGE_TIME" );
			for( let dcbIndex=0; dcbIndex <= this.maxIndex[`BAT#${batIndex}.DCB`]; dcbIndex++ ) {
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_ALL_CELL_TEMPERATURES", dcbIndex );
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_ALL_CELL_VOLTAGES", dcbIndex );
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_INFO", dcbIndex );
			}
			this.pushFrame();
		}
	}

	queuePviProbe( probes ) {
		for( let pviIndex = 0; pviIndex < probes; pviIndex++ ) {
			this.clearFrame();
			this.addTagtoFrame( "TAG_PVI_REQ_DATA" );
			this.addTagtoFrame( "TAG_PVI_INDEX", pviIndex );
			this.addTagtoFrame( "TAG_PVI_REQ_AC_MAX_PHASE_COUNT" );
			this.addTagtoFrame( "TAG_PVI_REQ_TEMPERATURE_COUNT" );
			this.addTagtoFrame( "TAG_PVI_REQ_DC_MAX_STRING_COUNT" );
			this.pushFrame();
		}
	}

	queueRequestPviData() {
		for( let pviIndex = 0; pviIndex <= this.maxIndex["PVI"]; pviIndex++ ) {
			this.clearFrame();
			this.addTagtoFrame( "TAG_PVI_REQ_DATA" );
			this.addTagtoFrame( "TAG_PVI_INDEX", pviIndex );
			this.addTagtoFrame( "TAG_PVI_REQ_TEMPERATURE_COUNT" );
			this.addTagtoFrame( "TAG_PVI_REQ_TYPE" );
			this.addTagtoFrame( "TAG_PVI_REQ_SERIAL_NUMBER" );
			this.addTagtoFrame( "TAG_PVI_REQ_VERSION" );
			this.addTagtoFrame( "TAG_PVI_REQ_ON_GRID" );
			this.addTagtoFrame( "TAG_PVI_REQ_STATE" );
			this.addTagtoFrame( "TAG_PVI_REQ_LAST_ERROR" );
			// this.addTagtoFrame( "TAG_PVI_REQ_COS_PHI" ); // always returns data type ERROR
			this.addTagtoFrame( "TAG_PVI_REQ_VOLTAGE_MONITORING" );
			this.addTagtoFrame( "TAG_PVI_REQ_POWER_MODE" );
			this.addTagtoFrame( "TAG_PVI_REQ_SYSTEM_MODE" );
			this.addTagtoFrame( "TAG_PVI_REQ_FREQUENCY_UNDER_OVER" );
			this.addTagtoFrame( "TAG_PVI_REQ_AC_MAX_PHASE_COUNT" );
			this.addTagtoFrame( "TAG_PVI_REQ_MAX_TEMPERATURE" );
			this.addTagtoFrame( "TAG_PVI_REQ_MIN_TEMPERATURE" );
			this.addTagtoFrame( "TAG_PVI_REQ_AC_MAX_APPARENTPOWER" );
			this.addTagtoFrame( "TAG_PVI_REQ_DEVICE_STATE" );
			for( let phaseIndex = 0; phaseIndex <= this.maxIndex[`PVI#${pviIndex}.AC_MAX_PHASE`]; phaseIndex++) {
				for( const tag of phaseTags ) {
					this.addTagtoFrame( `TAG_PVI_REQ_${tag}`, phaseIndex );
				}
			}
			for( let stringIndex = 0; stringIndex <= this.maxIndex[`PVI#${pviIndex}.DC_MAX_STRING`]; stringIndex++) {
				for( const tag of stringTags ) {
					this.addTagtoFrame( `TAG_PVI_REQ_${tag}`, stringIndex );
				}
			}
			for( let tempIndex = 0; tempIndex <= this.maxIndex[`PVI#${pviIndex}.TEMPERATURE`]; tempIndex++) {
				this.addTagtoFrame( "TAG_PVI_REQ_TEMPERATURE", tempIndex );
			}
			this.pushFrame();
		}
	}

	queueRequestEmsData() {
		this.clearFrame();
		this.addTagtoFrame( "TAG_EMS_REQ_GET_SYS_SPECS" );
		this.pushFrame();
		this.clearFrame();
		this.addTagtoFrame( "TAG_EMS_REQ_GET_POWER_SETTINGS" );
		this.addTagtoFrame( "TAG_EMS_REQ_BATTERY_BEFORE_CAR_MODE" );
		this.addTagtoFrame( "TAG_EMS_REQ_BATTERY_TO_CAR_MODE" );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_PV" );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_BAT" );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_HOME" );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_GRID" );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_ADD" );
		this.addTagtoFrame( "TAG_EMS_REQ_BAT_SOC" );
		this.addTagtoFrame( "TAG_EMS_REQ_AUTARKY" );
		this.addTagtoFrame( "TAG_EMS_REQ_SELF_CONSUMPTION" );
		this.addTagtoFrame( "TAG_EMS_REQ_COUPLING_MODE" );
		this.addTagtoFrame( "TAG_EMS_REQ_BALANCED_PHASES" );
		this.addTagtoFrame( "TAG_EMS_REQ_INSTALLED_PEAK_POWER" );
		this.addTagtoFrame( "TAG_EMS_REQ_DERATE_AT_PERCENT_VALUE" );
		this.addTagtoFrame( "TAG_EMS_REQ_DERATE_AT_POWER_VALUE" );
		this.addTagtoFrame( "TAG_EMS_REQ_USED_CHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_USER_CHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_BAT_CHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_DCDC_CHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_USED_DISCHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_USER_DISCHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_BAT_DISCHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_DCDC_DISCHARGE_LIMIT" );
		this.addTagtoFrame( "TAG_EMS_REQ_REMAINING_BAT_CHARGE_POWER" );
		this.addTagtoFrame( "TAG_EMS_REQ_REMAINING_BAT_DISCHARGE_POWER" );
		this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCY_POWER_STATUS" );
		this.addTagtoFrame( "TAG_EMS_REQ_MODE" );
		this.addTagtoFrame( "TAG_EMS_REQ_EXT_SRC_AVAILABLE" );
		// this.addTagtoFrame( "TAG_EMS_REQ_GET_GENERATOR_STATE" ); // always returns ERROR data type
		this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCYPOWER_TEST_STATUS" );
		this.addTagtoFrame( "TAG_EMS_REQ_STORED_ERRORS" );
		// this.addTagtoFrame( "TAG_EMS_REQ_ERROR_BUZZER_ENABLED" ); // always returns ERROR data type
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_WB_ALL" );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_WB_SOLAR" );
		this.addTagtoFrame( "TAG_EMS_REQ_ALIVE" );
		this.addTagtoFrame( "TAG_EMS_REQ_GET_MANUAL_CHARGE" );
		this.addTagtoFrame( "TAG_EMS_REQ_STATUS" );
		this.pushFrame();
		this.clearFrame();
		this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS" );
		this.pushFrame();
	}

	queueRequestEpData() {
		this.clearFrame();
		this.addTagtoFrame( "TAG_EP_REQ_IS_READY_FOR_SWITCH" );
		this.addTagtoFrame( "TAG_EP_REQ_IS_GRID_CONNECTED" );
		this.addTagtoFrame( "TAG_EP_REQ_IS_ISLAND_GRID" );
		this.addTagtoFrame( "TAG_EP_REQ_IS_POSSIBLE" );
		this.addTagtoFrame( "TAG_EP_REQ_IS_INVALID_STATE" );
		this.pushFrame();
	}

	queueValue( global_id, value ) {
		this.log.debug( `queueValue( ${global_id}, ${value} )`);
		const [,,namespace,tagname] = global_id.split(".");
		const id = `${namespace}.${tagname}`;
		if( setTags[id] ) {
			this.clearFrame();
			this.addTagtoFrame( encodeRscpTag(setTags[id]) );
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
		if( !rscpTag[tagCode] ) {
			this.log.warn(`Unknown tag: tagCode=0x${tagCode.toString(16)}, len=${len}, typeCode=0x${typeCode.toString(16)}`);
			return 7+len;
		}
		const nameSpace = rscpTag[tagCode].NameSpace;
		const tagName = rscpTag[tagCode].TagName;
		const typeName = rscpType[typeCode];
		let typeNameNew = typeName; // type name will be changed under certain conditions; see below
		let value;
		switch( typeName  ) {
			case "Container":
				this.currentContainer.push({tag: tagName, end: pos+7+len});
				return 7;
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
				value = Math.round(Number(buffer.readBigUInt64LE(pos+7))/1000); // setState does not accept BigInt, so convert to seconds
				break;
			case "Error":
				// special case: PVI probe with out of range index results in ERROR response - adjust maxIndex
				if( tagCode == rscpTagCode["TAG_PVI_REQ_DATA"] && this.level1 ) {
					const i = Number(this.level1.replace("PVI#",""));
					this.maxIndex["PVI"] = this.maxIndex["PVI"] ? Math.max( this.maxIndex["PVI"], i-1) : i-1;
				} else if( ! ignoreTags.includes(`${nameSpace}.${tagName}`) ) {
					value = buffer.readUInt32LE(pos+7);
					this.log.warn( `Received data type ERROR with value ${value} - tag ${rscpTag[tagCode].GlobalTagName}` );
				}
				return 7+len;
			case "None":
				if( len > 0 ) this.log.warn( `Received data type NONE with data length = ${len} - tagCode 0x${tagCode.toString(16)}` );
				return 7+len;
			default:
				this.log.warn( `Unable to parse data: ${dumpRscpFrame( buffer.slice(pos+7,pos+7+len) )}` );
				value = null;
				return 7+len;
		}
		let tagNameNew = tagName; // tag name will be changed under certain conditions; see below
		if( ignoreTags.includes(`${nameSpace}.${tagName}`) ) {
			this.log.silly(`Ignoring tag: ${nameSpace}.${tagName}`);
		} else if( tagName == "INDEX" ) {
			// Use INDEX for object path, level1-3:
			if( phaseTags.includes(this.currentContainer.slice(-1)[0].tag) ) {
				this.level2 = `Phase#${value}`;
			} else if( stringTags.includes(this.currentContainer.slice(-1)[0].tag) ) {
				this.level2 = `String#${value}`;
			} else if ( this.currentContainer.slice(-1)[0].tag == "TEMPERATURE" ) {
				this.level2 = "";
				this.level3 = value;
			} else if ( this.currentContainer.length == 2 ){
				this.maxIndex[nameSpace] = this.maxIndex[nameSpace] ? Math.max( this.maxIndex[nameSpace], value ) : value;
				this.level1 = `${nameSpace}#${value}`;
				this.level2 = "";
				this.level3 = -1;
			} else if( !ignoreIndexTags.includes(this.currentContainer.slice(-1)[0].tag) ) {
				this.log.warn( `Ignoring unexpected INDEX=${value} in container ${this.currentContainer.slice(-1)[0].tag}` );
			}
		} else if( tagName.endsWith("_INDEX") ) {
			// Use _INDEX for object path level2, e.g. TAG_BAT_DCB_INDEX
			const i = `${nameSpace}.${tagName.replace("_INDEX","")}`;
			this.maxIndex[i] = this.maxIndex[i] ? Math.max( this.maxIndex[i], value) : value;
			this.level2 = `${tagName.replace("_INDEX","")}#${value}`;
			this.level3 = -1;
		} else if( tagName == "SYS_SPEC_NAME" ) {
			// Just record the name for value coming with next tag:
			this.sysSpecName = value;
		} else if( tagName == "IDLE_PERIOD_TYPE" ) {
			// Record the name for values coming with next tags:
			this.idlePeriodType = value;
			this.level1 = this.idlePeriodType ? "IDLE_PERIODS_DISCHARGE" : "IDLE_PERIODS_CHARGE";
		} else if( tagName == "IDLE_PERIOD_DAY" ) {
			this.level2 = `${value.toString().padStart(2,"0")}-${dayOfWeek[value]}`;
		} else {
			// Take note of explicit maximum index for creating complete request frames:
			if( tagName.endsWith("_COUNT") ) {
				this.maxIndex[`${this.level1}.${tagName.replace("_COUNT","")}`] = value - 1;
			}
			// Multiple values within one container are listed in a substructure (level3):
			if( multipleValue.includes(`${nameSpace}.${tagName}`) ) {
				// @ts-ignore
				this.level3++;
			}
			// SYS_SPEC_VALUE_INT - use the name recorded before:
			if( tagName == "SYS_SPEC_VALUE_INT" ) {
				this.level2 = "SYS_SPECS";
				tagNameNew = this.sysSpecName;
				this.sysSpecName = "";
			}
			// Container=(INDEX, VAULE) - use container name for value:
			if( tagName == "VALUE" && this.currentContainer.length > 1 ) {
				tagNameNew  = `${this.currentContainer.slice(-1)[0].tag}`;
			}
			if( tagName == "IDLE_PERIOD_HOUR" ) {
				if( this.currentContainer.slice(-1)[0].tag == "IDLE_PERIOD_START" ) {
					tagNameNew = "START_HOUR";
				} else if( this.currentContainer.slice(-1)[0].tag == "IDLE_PERIOD_END" ) {
					tagNameNew = "END_HOUR";
				}
			}
			if( tagName == "IDLE_PERIOD_MINUTE" ) {
				if( this.currentContainer.slice(-1)[0].tag == "IDLE_PERIOD_START" ) {
					tagNameNew = "START_MINUTE";
				} else if( this.currentContainer.slice(-1)[0].tag == "IDLE_PERIOD_END" ) {
					tagNameNew = "END_MINUTE";
				}
			}
			// Handle mapping between "read" tag names and "write" tag names:
			const i = `${nameSpace}.${tagName}`;
			let targetStateMatch = null;
			if( targetStates[i] ) {
				if( targetStates[i]["*"] ) targetStateMatch = "*";
				if( targetStates[i][typeName] ) targetStateMatch = typeName;
				if( targetStateMatch && targetStates[i][targetStateMatch].targetState == "RETURN_CODE" && value < 0 ) {
					this.log.warn(`SET failed: ${i} = ${value}`);
				}
			}
			if( targetStateMatch ) tagNameNew = targetStates[i][targetStateMatch].split(".")[1];
			// RSCP is sloppy concerning Bool type - cast where neccessary:
			if( castToBoolean.includes(i) && ( typeName == "Char8" || typeName == "UChar8" ) ) {
				value = (value!=0);
				typeNameNew = "Bool";
			}
			// RSCP is sloppy concerning Timestamp type - cast where neccessary:
			if( castToTimestamp.includes(i) && typeName == "UInt64" ) {
				value = Math.round(value/1000); // setState does not accept BigInt, so convert to seconds
				typeNameNew = "Timestamp";
			}
			// Adjust sign where semantically similar values come sometimes positive and sometimes negative:
			if( negateValue.includes(i) ) {
				value = -value;
			}
			// Adjust sto percent value where neccessary:
			if( percentValue.includes(i) ) {
				value = value * 100;
			}
			// Concatenate target object id, inserting device/channel levels into path (if so):
			let id = nameSpace;
			id += (this.level1 != "") ? `.${this.level1}` : "";
			id += (this.level2 != "") ? `.${this.level2}` : "";
			id += `.${tagNameNew}`;
			id += (this.level3 >= 0) ? `.${this.level3.toString().padStart(2,"0")}` : "";
			// Write state to object DB:
			this.log.silly(`setState( "${id}", ${value}, true )`);
			const oKey = `${nameSpace}.${tagNameNew}`;
			const oWrite = oKey in setTags;
			let oRole = "";
			if( typeNameNew == "Bool") {
				oRole = oWrite?"switch":"indicator";
			} else {
				oRole = oWrite?"level":"value";
			}
			const oName = systemDictionary[tagNameNew] ? systemDictionary[tagNameNew][this.language] : "***UNDEFINED_NAME***";
			this.setObjectNotExists( id, {
				type: "state",
				common: {
					name: oName,
					type: rscpTypeMap[typeNameNew],
					role: oRole,
					read: true,
					write: oWrite,
					states: (commonStates[oKey] ? commonStates[oKey] : ""),
				},
				native: {},
			}, () => {
				this.setState( id, value, true );
			});
		}
		return 7+len;
	}

	processFrame( buffer ) {
		this.currentContainer = [{tag: "NO_CONTAINER", end: buffer.length}];
		this.sysSpecName = "";
		this.level1 = ""; // reset "INDEX" tag
		this.level2 = ""; // reset "..._INDEX" tag
		this.level3 = -1; // reset multiple value counter
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
			if( i >= this.currentContainer.slice(-1)[0].end ) {
				this.currentContainer.pop();
				if( this.currentContainer.length == 1 ) {
					this.level1 = "";
					this.level2 = "";
					this.level3 = -1;
				}
			}
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
					this.queueRequestEpData();
					this.queueRequestBatData();
					this.queueRequestPviData();
					this.sendNextFrame();
				}, this.config.polling_interval*1000 );
			} else {
				this.log.error( "Cannot initialize adapter because obj.native.secret is null." );
			}
		});
		// Statically, we define only one device per supported RSCP namespace - rest of the object tree is defined dynamically.
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
		await this.setObjectNotExistsAsync("PVI", {
			type: "device",
			common: {
				name: systemDictionary["PVI"][this.language],
				role: "photovoltaic.inverter",
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
		await this.setObjectNotExistsAsync("EP", {
			type: "device",
			common: {
				name: systemDictionary["EP"][this.language],
				role: "emergency.power",
			},
			native: {},
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("RSCP.AUTHENTICATION");
		for( const s in setTags ) this.subscribeStates(s);
		// You can also add a subscription for multiple states. The following line watches all states starting with 'lights.'
		// this.subscribeStates('lights.*');
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates('*');
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
	const ad = new E3dcRscp();
	setTimeout(() => {
		try {
			ad.sendNextFrame();
		} catch (e) {
			Sentry.captureException(e);
		} finally {
			transaction.finish();
		}
	}, 99);
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
			text.content += `seconds: ${buffer.readBigUInt64LE(pos+7)} - nseconds: ${buffer.readUInt32LE(pos+7+8)} `;
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
// If the integer part is has more digits than <s>, then just round to integer.
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