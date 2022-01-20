/* eslint-disable no-unused-vars */
"use strict";

// System dictionary
const fs = require("fs");
const path = require("path");
// eslint-disable-next-line prefer-const
let systemDictionary = {};
eval(fs.readFileSync(path.join(__dirname,"/admin/words.js")).toString());

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
const rscpTag = require(path.join(__dirname,"/lib/RscpTags.json"));
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
	"Timestamp": "string",
	"ByteArray": "string",
	"Error": "number",
};
const rscpReturnCode = {
	"-2": "could not set, try later",
	"-1": "value out of range",
	"0": "success",
	"1": "success, but below recommendation",
};
const rscpError = {
	1: "RSCP_ERR_NOT_HANDLED",
	2: "RSCP_ERR_ACCESS_DENIED",
	3: "RSCP_ERR_FORMAT",
	4: "RSCP_ERR_AGAIN",
	5: "RSCP_ERR_OUT_OF_BOUNDS",
	6: "RSCP_ERR_NOT_AVAILABLE",
	7: "RSCP_ERR_UNKNOWN_TAG",
	8: "RSCP_ERR_ALREADY_IN_USE",
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
const rscpEmsMode = {
	0: "IDLE",
	1: "DISCHARGE",
	2: "CHARGE",
};
const rscpEmsSetPowerMode = {
	0: "NORMAL",
	1: "IDLE",
	2: "DISCHARGE",
	3: "CHARGE",
	4: "GRID_CHARGE",
};
const rscpWbMode = {
	0: "NONE",
	128: "LOADING",
	144: "NOT_LOADING",
};
const rscpActivePhases = {
	0: "PHASE_000",
	1: "PHASE_001",
	2: "PHASE_010",
	3: "PHASE_011",
	4: "PHASE_100",
	5: "PHASE_101",
	6: "PHASE_110",
	7: "PHASE_111",
};
/* RSCP enumerations for later use:
const rscpReturnCodes = {
	0: "OK",
	-1: "ERR_INVALID_INPUT",
	-2: "ERR_NO_MEMORY",
	-3: "ERR_INVALID_MAGIC",
	-4: "ERR_PROT_VERSION_MISMATCH",
	-5: "ERR_INVALID_FRAME_LENGTH",
	-6: "ERR_INVALID_CRC",
	-7: "ERR_DATA_LIMIT_EXCEEDED",
}
const rscpEmsSetEmergencyPower = {
	0: "NORMAL_GRID_MODE",
	1: "EMERGENCY_MODE",
	2: "ISLAND_NO_POWER_MODE",
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
const rscpUmUpdateStatus = {
	0: "IDLE",
	1: "UPDATE_CHECK_RUNNING",
	2: "UPDATING_MODULES_AND_FILES",
	3: "UPDATING_HARDWARE",
};
const rscpWbType = {
	1: "E3DC",
	2: "EASYCONNECT",
};
*/


// Assign enumerations to states:
const mapIdToCommonStates = {
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
	"EMS.MODE": rscpEmsMode,
	"EMS.BALANCED_PHASES": rscpActivePhases,
	"PM.ACTIVE_PHASES": rscpActivePhases,
	"WB.MODE": rscpWbMode,
};
// List of writable states, with Mapping for response value handling.
// Key is returned_tag; value is (type_pattern: target_state)
// type "*" means: apply to all types
const mapReceivedIdToState = {
	"EMS.RES_POWERSAVE_ENABLED": { "*": "EMS.POWERSAVE_ENABLED" },
	"EMS.RES_WEATHER_REGULATED_CHARGE_ENABLED": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_CHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_DISCHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.DISCHARGE_START_POWER": { "Int32": "EMS.DISCHARGE_START_POWER", "Char8": "EMS.RETURN_CODE" },
	"EMS.USER_CHARGE_LIMIT": { "*": "EMS.MAX_CHARGE_POWER" },
	"EMS.USER_DISCHARGE_LIMIT": { "*": "EMS.MAX_DISCHARGE_POWER" },
};
// List of all writable states
// For standard cases, define how to send a SET to E3/DC
// key is state id without path (i.e. only namespace + tag)
// value is [container_tag, setter_tag]; may be [] empty for cases with special handling
const mapChangedIdToSetTags = {
	"EMS.MAX_CHARGE_POWER": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_MAX_CHARGE_POWER"],
	"EMS.MAX_DISCHARGE_POWER": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_MAX_DISCHARGE_POWER"],
	"EMS.DISCHARGE_START_POWER": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_DISCHARGE_START_POWER"],
	"EMS.POWERSAVE_ENABLED": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_POWERSAVE_ENABLED"],
	"EMS.POWER_LIMITS_USED": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_POWER_LIMITS_USED"],
	"EMS.WEATHER_REGULATED_CHARGE_ENABLED": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_WEATHER_REGULATED_CHARGE_ENABLED"],
	"EMS.SET_POWER_MODE": [],
	"EMS.SET_POWER_VALUE": [],
	"EMS.IDLE_PERIOD_ACTIVE": [],
	"EMS.START_HOUR": [],
	"EMS.START_MINUTE": [],
	"EMS.END_HOUR": [],
	"EMS.END_MINUTE": [],
};
// RSCP is sloppy concerning Bool - some Char8 and UChar8 values must be converted:
const castToBooleanIds = [
	"EMS.POWERSAVE_ENABLED",
	"EMS.RES_POWERSAVE_ENABLED",
	"EMS.WEATHER_REGULATED_CHARGE_ENABLED",
	"EMS.hybridModeSupported",
	"EMS.BATTERY_BEFORE_CAR_MODE",
	"EMS.BATTERY_TO_CAR_MODE",
	"EMS.EXT_SRC_AVAILABLE",
];
// RSCP is sloppy concerning Timestamp - some UInt64 values must be converted:
const castToTimestampIds = [
	"BAT.DCB_LAST_MESSAGE_TIMESTAMP",
	"EMS.ERROR_TIMESTAMP",
	"EMS.EPTEST_NEXT_TESTSTART",
];
// Adjust algebraic sign: e.g. discharge limit is sometimes positive, sometimes negative
const negateValueIds = [
	"EMS.USER_DISCHARGE_LIMIT",
];
// Adjust to percent (divide by 100):
const percentValueIds = [
	"EMS.DERATE_AT_PERCENT_VALUE",
];
// For multiple values within one frame, a subchannel will be generated
const multipleValueIds = [
	"BAT.DCB_CELL_TEMPERATURE",
	"BAT.DCB_CELL_VOLTAGE",
	"PVI.RELEASE",
];
// Some indexed tags are grouped within a channel
const phaseIds = [
	"PVI.AC_POWER",
	"PVI.AC_VOLTAGE",
	"PVI.AC_CURRENT",
	"PVI.AC_APPARENTPOWER",
	"PVI.AC_REACTIVEPOWER",
	"PVI.AC_ENERGY_ALL",
	"PVI.AC_ENERGY_GRID_CONSUMPTION",
];
const stringIds = [
	"PVI.DC_POWER",
	"PVI.DC_VOLTAGE",
	"PVI.DC_CURRENT",
	"PVI.DC_STRING_ENERGY_ALL",
];
// Some of the return values we do not want to see as (missing) states:
// "INDEX" and "..._INDEX" tags are automatically treated as subchannels, no need to list them here.
const ignoreIds = [
	"RSCP.UNDEFINED",
	"EMS.UNDEFINED_POWER_SETTING",
	"EMS.MANUAL_CHARGE_START_COUNTER", // invalid Int64 value
	"EMS.MANUAL_CHARGE_LASTSTART", // invalid Timestamp value
	"EMS.SYS_SPEC_INDEX",
	"EMS.SET_IDLE_PERIODS",
	"BAT.UNDEFINED",
	"BAT.INTERNAL_CURRENT_AVG30",
	"BAT.INTERNAL_MTV_AVG30",
	"BAT.INTERNAL_MAX_CHARGE_CURRENT",
	"BAT.INTERNAL_MAX_DISCHARGE_CURRENT",
	"BAT.INTERNAL_MAX_CHARGE_CURR_PER_DCB",
	"BAT.INTERNAL_MAX_DISCHARGE_CURR_PER_DCB",
	"BAT.INTERNAL_MAX_CHARGE_CURR_DATA_LOG",
	"BAT.INTERNAL_MAX_DISCHARGE_CURR_DATA_LOG",
	"WB.EXTERN_DATA_LEN",
];
// Some of the INDEX values are redundant and can be safely ignored:
// Listed here are containers which contain redundant INDEX tags.
const ignoreIndexIds = [
	"PVI.AC_MAX_APPARENTPOWER",
	"PVI.MIN_TEMPERATURE",
	"PVI.MAX_TEMPERATURE",
	"WB.EXTERN_DATA_SUN",
	"WB.EXTERN_DATA_NET",
	"WB.EXTERN_DATA_ALL",
	"WB.EXTERN_DATA_ALG",
	"WB.EXTERN_RSP_PARAM_1",
	"WB.EXTERN_RSP_PARAM_2",
];
// For SYS_SPECs, names and values are transmitted over Interface, i.e. they are not in rscpTags[]
// Therefore we list the SYS_SPEC units here:
const sysSpecUnits = {
	"hybridModeSupported": "",
	"installedBatteryCapacity": "Wh",
	"maxAcPower": "W",
	"maxBatChargePower": "W",
	"maxBatDischargPower": "W",
	"maxChargePower": "W",
	"maxDischargePower": "W",
	"maxFbcChargePower": "W",
	"maxFbcDischargePower": "W",
	"maxPvPower": "W",
	"maxStartChargePower": "W",
	"maxStartDischargePower": "W",
	"minStartChargePower": "W",
	"minStartDischargePower": "W",
	"recommendedMinChargeLimit": "W",
	"recommendedMinDischargeLimit": "W",
	"startChargeDefault": "W",
	"startDischargeDefault": "W",
};

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
const { resourceLimits, threadId } = require("worker_threads");
const { type } = require("os");
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
		this.frame = null;
		this.queue = [];

		// For keeping observed max. indexes, e.g. BAT.INDEX, DCB_COUNT etc.:
		this.maxIndex = {}; // {path}

		// For probing device count (upper bounds):
		this.batProbes = 4;
		this.pviProbes = 3;

		// For triggering the polling and setting requests:
		this.dataPollingTimerS = null;
		this.dataPollingTimerM = null;
		this.dataPollingTimerL = null;
		this.setPowerTimer = null;
		this.sendTupleTimeout = {}; // every tuple for grouped sending gets it's own timeout, e.g. "DB.HISTORY_DATA_DAY" or "EMS.IDLE_PERIODS_CHARGE.00-Monday"
		this.probingTimeout = []; // for an initial series of probing requests

		// For efficient access to polling intervals:
		this.pollingInterval = []; // [tagCode]

		// TCP connection:
		this.tcpConnection = new Net.Socket();
		this.inBuffer = null;
		this.reconnectTimeout = null;
	}

	// Create channel to E3/DC: encapsulating TCP connection, encryption, message queuing
	initChannel( ) {
		if( ! this.config.portal_user ) this.config.portal_user = "";
		if( ! this.config.portal_password ) this.config.portal_password = "";

		this.aesKey = Buffer.alloc( KEY_SIZE, 0xFF );
		this.encryptionIV = Buffer.alloc( BLOCK_SIZE, 0xFF );
		this.decryptionIV = Buffer.alloc( BLOCK_SIZE, 0xFF );
		if( this.aesKey.write( this.config.rscp_password ) > this.config.rscp_password.length ) this.log.error("ERROR initializing AES-KEY!");
		this.cipher = new Rijndael(this.aesKey, "cbc");

		this.queueRscpAuthentication();

		this.setState( "info.connection", false, true );
		this.tcpConnection.connect( this.config.e3dc_port, this.config.e3dc_ip, () => {
			this.setState( "info.connection", true, true );
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
				this.log.silly("Received response");
				if( rscpTag[receivedFrame.readUInt32LE(18)] ) this.log.silly(rscpTag[receivedFrame.readUInt32LE(18)].TagNameGlobal);
				if( this.decryptionIV ) this.inBuffer.copy( this.decryptionIV, 0, this.inBuffer.length - BLOCK_SIZE ); // last encrypted block will be used as IV for next frame
				this.log.silly( `IN: ${printRscpFrame(receivedFrame)}` );
				// this.log.silly( dumpRscpFrame(receivedFrame) );
				this.processFrame(receivedFrame);
				this.sendNextFrame();
				this.inBuffer = null;
			} else {
				this.log.silly(`inBuffer has length ${this.inBuffer.length} which is not a multiple of 256bit - waiting for next chunk...`);
			}
		});

		this.tcpConnection.on("end", () => {
			this.setState( "info.connection", false, true );
			this.log.warn("Disconnected from E3/DC");
			this.reconnectChannel();
		});

		this.tcpConnection.on("close", () => {
			this.setState( "info.connection", false, true );
			this.log.warn("E3/DC connection closed");
		});

		this.tcpConnection.on("timeout", () => {
			this.setState( "info.connection", false, true );
			this.log.info("E3/DC connection timeout");
			this.reconnectChannel();
		});

		this.tcpConnection.on("error", () => {
			this.setState( "info.connection", false, true );
			this.log.error("E3/DC connection error");
			this.reconnectChannel();
		});
	}

	reconnectChannel() {
		if( !this.reconnectTimeout ) {
			this.reconnectTimeout = setTimeout(() => {
				this.log.info("Reconnecting to E3/DC ...");
				this.tcpConnection.removeAllListeners();
				this.initChannel();
			}, 10000);
		}
	}

	clearFrame() { // preset MAGIC and CTRL and reserve space for timestamp and length
		this.frame = Buffer.from([0xE3, 0xDC, 0x00, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
	}

	// Add one tag to the frame under preparation
	// Not for Container tags, see startContainer
	addTagtoFrame( tag, sml = "", value = Object(0) ) {
		if( !rscpTagCode[tag] ) {
			this.log.warn(`Unknown tag ${tag} with value ${value} - cannot add to frame.`);
			return;
		}
		const tagCode = rscpTagCode[tag];
		if( this.pollingInterval[tagCode] == "" && tag.contains("_REQ_") ) {
			this.log.warn(`${tag} has no assigned polling interval  - assuming 'M' - assignment should be added to io-package.json`);
			this.pollingInterval[tagCode] == "M";
		}
		if( sml == "" || this.pollingInterval[tagCode] == sml ) {
			const typeCode = parseInt( rscpTag[tagCode].DataTypeHex, 16 );
			const buf1 = Buffer.alloc(1);
			const buf2 = Buffer.alloc(2);
			const buf4 = Buffer.alloc(4);
			const buf8 = Buffer.alloc(8);
			buf4.writeInt32LE( tagCode );
			this.frame = Buffer.concat( [this.frame, buf4] );
			this.frame = Buffer.concat( [this.frame, Buffer.from([typeCode])] );
			this.frame = Buffer.concat( [this.frame, Buffer.from([0x00, 0x00])] ); // reserve space for Length
			switch( rscpType[typeCode] ) {
				case "None":
					break;
				case "Container":
					this.log.warn(`Container-tag ${tag} passed to addTagToFrame - cannot add tag to frame.`);
					return;
				case "CString":
					this.frame.writeUInt16LE( value.length, this.frame.length - 2);
					this.frame = Buffer.concat( [this.frame, Buffer.from(value)] );
					break;
				case "Bitfield":
				case "ByteArray":
					this.frame.writeUInt16LE( stringToBuffer( value ).length, this.frame.length - 2);
					this.frame = Buffer.concat( [this.frame, stringToBuffer( value )] );
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
				case "Timestamp": // NOTE: treating value as seconds - setting nanoseconds to zero
					this.frame.writeUInt16LE( 12, this.frame.length - 2 );
					buf8.writeBigUInt64LE( BigInt(value?Math.round(value):0) );
					this.frame = Buffer.concat( [this.frame, buf8, new Uint8Array([0x00,0x00,0x00,0x00])] );
					break;
				default:
					this.log.warn(`addTagtoFrame does not know how to handle data type ${rscpType[typeCode]}`);
			}
			return 0;
		}
	}

	// Add a Container tag to frame under preparation
	// Returns position of Container length within frame for use in endContainer
	startContainer( tag, sml = "" ) {
		if( !rscpTagCode[tag] ) {
			this.log.warn(`Unknown container tag ${tag} - cannot start container.`);
			return 0;
		}
		const tagCode = rscpTagCode[tag];
		if( sml == "" || this.pollingInterval[tagCode] == "" || this.pollingInterval[tagCode] == sml ) {
			const typeCode = parseInt( rscpTag[tagCode].DataTypeHex, 16 );
			if( rscpType[typeCode] != "Container") {
				this.log.warn(`Non-container tag ${tag} passed to startContainer - cannot start container.`);
				return 0;
			}
			const buf4 = Buffer.alloc(4);
			buf4.writeInt32LE( tagCode );
			this.frame = Buffer.concat( [this.frame, buf4] );
			this.frame = Buffer.concat( [this.frame, Buffer.from([typeCode])] );
			this.frame = Buffer.concat( [this.frame, Buffer.from([0x00, 0x00])] ); // reserve space for Length
			return this.frame.length - 2;
		} else {
			return 0;
		}
	}

	endContainer( pos ) {
		this.frame.writeUInt16LE( this.frame.length - pos - 2, pos );
	}

	// Finalize frame, then push it to the queue
	// If pos > 0, then endContainer is inclusive
	pushFrame( pos=0 ) {
		if( this.frame.length > 18 ) {
			this.frame.writeUIntLE( Math.floor(new Date().getTime()/1000), 4, 6 ); // set timestamp - bytes 7,8 remain zero (which will be wrong after 19.01.2038)
			this.frame.writeUInt16LE( this.frame.length - 18, 16 ); // set total length
			if( pos > 0 ) this.endContainer(pos);
			const buf4 = Buffer.alloc(4);
			buf4.writeInt32LE( CRC32.buf(this.frame) );
			this.frame = Buffer.concat( [this.frame, buf4] ); // concat returns a copy of this.frame, which therefore can be reused
			this.queue.push(this.frame);
		}
	}

	queueRscpAuthentication( ) {
		this.clearFrame();
		const pos = this.startContainer( "TAG_RSCP_REQ_AUTHENTICATION" );
		this.addTagtoFrame( "TAG_RSCP_AUTHENTICATION_USER", "", this.config.portal_user );
		this.addTagtoFrame( "TAG_RSCP_AUTHENTICATION_PASSWORD", "", this.config.portal_password );
		this.pushFrame( pos );
	}

	queueBatProbe( probes ) {
		for( let i = 0; i < probes; i++ ) {
			this.clearFrame();
			const pos = this.startContainer( "TAG_BAT_REQ_DATA" );
			this.addTagtoFrame( "TAG_BAT_INDEX", "", i );
			this.addTagtoFrame( "TAG_BAT_REQ_ASOC" );
			this.pushFrame( pos );
		}
	}

	queueBatRequestData( sml ) {
		for( let i = 0; i <= this.maxIndex["BAT"]; i++ ) {
			this.clearFrame();
			const pos = this.startContainer( "TAG_BAT_REQ_DATA" );
			this.addTagtoFrame( "TAG_BAT_INDEX", "", i );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_BAT_VOLTAGE", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_INFO", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_ASOC", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_RSOC_REAL", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_TERMINAL_VOLTAGE", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_DCB_CELL_TEMPERATURE", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_MIN_DCB_CELL_TEMPERATURE", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_READY_FOR_SHUTDOWN", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_TRAINING_MODE", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_DEVICE_STATE", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_TOTAL_USE_TIME", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_TOTAL_DISCHARGE_TIME", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_USABLE_CAPACITY", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_USABLE_REMAINING_CAPACITY", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_CHARGE_CURRENT", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_EOD_VOLTAGE", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_MAX_DISCHARGE_CURRENT", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_CHARGE_CYCLES", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_FCC", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_RC", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_DCB_COUNT", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_DEVICE_NAME", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_SPECIFICATION", sml );
			this.addTagtoFrame( "TAG_BAT_REQ_INTERNALS", sml );
			for( let j=0; j <= this.maxIndex[`BAT_${i}.DCB`]; j++ ) {
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_ALL_CELL_TEMPERATURES", sml, j );
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_ALL_CELL_VOLTAGES", sml, j );
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_INFO", sml, j );
			}
			this.pushFrame( pos );
		}
	}

	queuePviProbe( probes ) {
		for( let pviIndex = 0; pviIndex < probes; pviIndex++ ) {
			this.clearFrame();
			const pos = this.startContainer( "TAG_PVI_REQ_DATA" );
			this.addTagtoFrame( "TAG_PVI_INDEX", "", pviIndex );
			this.addTagtoFrame( "TAG_PVI_REQ_AC_MAX_PHASE_COUNT" );
			this.addTagtoFrame( "TAG_PVI_REQ_TEMPERATURE_COUNT" );
			this.addTagtoFrame( "TAG_PVI_REQ_DC_MAX_STRING_COUNT" );
			this.pushFrame( pos );
		}
	}

	queuePviRequestData( sml ) {
		for( let i = 0; i <= this.maxIndex["PVI"]; i++ ) {
			this.clearFrame();
			const pos = this.startContainer( "TAG_PVI_REQ_DATA" );
			this.addTagtoFrame( "TAG_PVI_INDEX", "", i );
			this.addTagtoFrame( "TAG_PVI_REQ_TEMPERATURE_COUNT", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_TYPE", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_SERIAL_NUMBER", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_VERSION", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_ON_GRID", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_STATE", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_LAST_ERROR", sml  );
			// this.addTagtoFrame( "TAG_PVI_REQ_COS_PHI", sml ); // always returns data type ERROR
			this.addTagtoFrame( "TAG_PVI_REQ_VOLTAGE_MONITORING", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_POWER_MODE", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_SYSTEM_MODE", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_FREQUENCY_UNDER_OVER", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_AC_MAX_PHASE_COUNT", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_MAX_TEMPERATURE", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_MIN_TEMPERATURE", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_AC_MAX_APPARENTPOWER", sml  );
			this.addTagtoFrame( "TAG_PVI_REQ_DEVICE_STATE", sml  );
			for( let j = 0; j <= this.maxIndex[`PVI_${i}.AC_MAX_PHASE`]; j++) {
				for( const id of phaseIds ) {
					this.addTagtoFrame( `TAG_PVI_REQ_${id.split(".")[1]}`, sml, j );
				}
			}
			for( let j = 0; j <= this.maxIndex[`PVI_${i}.DC_MAX_STRING`]; j++) {
				for( const id of stringIds ) {
					this.addTagtoFrame( `TAG_PVI_REQ_${id.split(".")[1]}`, sml, j );
				}
			}
			for( let j = 0; j <= this.maxIndex[`PVI_${i}.TEMPERATURE`]; j++) {
				this.addTagtoFrame( "TAG_PVI_REQ_TEMPERATURE", sml, j );
			}
			this.pushFrame( pos );
		}
	}

	queueEmsRequestData( sml ) {
		this.clearFrame();
		this.addTagtoFrame( "TAG_EMS_REQ_GET_POWER_SETTINGS", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_BATTERY_BEFORE_CAR_MODE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_BATTERY_TO_CAR_MODE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_PV", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_BAT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_HOME", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_GRID", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_ADD", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_BAT_SOC", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_AUTARKY", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_SELF_CONSUMPTION", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_MODE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_WB_ALL", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_POWER_WB_SOLAR", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_ALIVE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_GET_MANUAL_CHARGE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_STATUS", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_COUPLING_MODE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_BALANCED_PHASES", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_USED_CHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_USER_CHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_BAT_CHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DCDC_CHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_USED_DISCHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_USER_DISCHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_BAT_DISCHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DCDC_DISCHARGE_LIMIT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_REMAINING_BAT_CHARGE_POWER", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_REMAINING_BAT_DISCHARGE_POWER", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCY_POWER_STATUS", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCYPOWER_TEST_STATUS", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_STORED_ERRORS", sml );
		// this.addTagtoFrame( "TAG_EMS_REQ_GET_GENERATOR_STATE", sml ); // always returns ERROR data type
		// this.addTagtoFrame( "TAG_EMS_REQ_ERROR_BUZZER_ENABLED", sml ); // always returns ERROR data type
		this.addTagtoFrame( "TAG_EMS_REQ_INSTALLED_PEAK_POWER", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DERATE_AT_PERCENT_VALUE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DERATE_AT_POWER_VALUE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_EXT_SRC_AVAILABLE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_GET_SYS_SPECS", sml );
		this.pushFrame();
	}

	queueEmsSetPower( mode, value ) {
		this.log.debug( `queueEmsSetPower( ${mode}, ${value} )`);
		this.clearFrame();
		const pos = this.startContainer( "TAG_EMS_REQ_SET_POWER" );
		this.addTagtoFrame( "TAG_EMS_REQ_SET_POWER_MODE", "", mode );
		this.addTagtoFrame( "TAG_EMS_REQ_SET_POWER_VALUE", "", value );
		this.pushFrame( pos );
		this.clearFrame();
		this.addTagtoFrame( "TAG_EMS_REQ_MODE" ); // separately update MODE because SET_POWER response contains VALUE, but not MODE
		this.pushFrame();
		// Acknowledge SET_POWER_*
		this.setState( "EMS.SET_POWER_MODE", mode, true );
		this.setState( "EMS.SET_POWER_VALUE", value, true );
		// E3/DC requires regular SET_POWER repetition, otherwise it will fall back to NORMAL mode:
		if( mode > 0 && !this.setPowerTimer ) {
			this.setPowerTimer = setInterval(() => {
				this.getState( "EMS.SET_POWER_VALUE", (err, vObj) => {
					this.getState( "EMS.SET_POWER_MODE", (err, mObj) => {
						this.queueEmsSetPower( mObj ? mObj.val : 0, vObj ? vObj.val : 0 );
					});
				});
			}, this.config.setpower_interval*1000 );
		} else if( mode == 0 && this.setPowerTimer ) { // clear timer when mode is set to NORMAL
			clearInterval(this.setPowerTimer);
			this.setPowerTimer = null; // nullify to enable "is timer running" check
		}
	}

	queueEpRequestData( sml ) {
		this.clearFrame();
		this.addTagtoFrame( "TAG_EP_REQ_IS_READY_FOR_SWITCH", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_GRID_CONNECTED", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_ISLAND_GRID", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_POSSIBLE", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_INVALID_STATE", sml );
		this.pushFrame();
	}

	queueWbRequestData( sml ) {
		this.clearFrame();
		this.addTagtoFrame( "TAG_WB_REQ_CONNECTED_DEVICES", sml );
		for( let i = 0; i <= this.maxIndex["WB"]; i++ ) {
			const pos = this.startContainer( "TAG_WB_REQ_DATA" );
			this.addTagtoFrame( "TAG_WB_INDEX", "", i );
			this.addTagtoFrame( "TAG_WB_REQ_STATUS", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_ERROR_CODE", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_MODE", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DEVICE_ID", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DEVICE_NAME", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DEVICE_STATE", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_APP_SOFTWARE", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_BOOTLOADER_SOFTWARE", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_HW_VERSION", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_FLASH_VERSION", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_ENERGY_ALL", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_ENERGY_SOLAR", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_SOC", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_POWER_L1", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_POWER_L2", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_POWER_L3", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_ACTIVE_PHASES", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_MODE", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_ENERGY_L1", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_ENERGY_L2", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_ENERGY_L3", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_DEVICE_ID", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_ERROR_CODE", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_FIRMWARE_VERSION", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PM_MAX_PHASE_POWER", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DIAG_INFOS", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DIAG_WARNINGS", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DIAG_ERRORS", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DIAG_TEMP_1", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_DIAG_TEMP_2", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_SUN", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_NET", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_ALL", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_ALG", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PARAM_1", sml  );
			this.addTagtoFrame( "TAG_WB_REQ_PARAM_2", sml  );
			this.endContainer(pos);
		}
		this.pushFrame();
	}

	// Only used for interface exploration:
	queueDbRequestData( sml ) {
		this.clearFrame();
		const pos = this.startContainer( "TAG_DB_REQ_HISTORY_DATA_DAY" );
		this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_START", "", 1639609200 );
		this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_INTERVAL", "", 1800 );
		this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_SPAN", "", 86400);
		this.endContainer(pos);
		this.pushFrame();
	}

	queueSetValue( globalId, value ) {
		this.log.info( `queueSetValue( ${globalId}, ${value} )`);
		const id = globalId.match("^[^.]+[.][^.]+[.](.*)")[1];
		if( mapChangedIdToSetTags[id] && mapChangedIdToSetTags[id].length == 2 ) {
			this.clearFrame();
			const pos = this.startContainer( mapChangedIdToSetTags[id][0] );
			this.addTagtoFrame( mapChangedIdToSetTags[id][1], "", value );
			this.pushFrame( pos );
		} else {
			this.log.warn( `Don't know how to queue ${id}`);
		}
	}

	queueSetIdlePeriod( globalId ) {
		this.log.info( `queueSetIdlePeriod( ${globalId} )`);
		const el = globalId.split(".");
		if( el.length == 6 ) {
			const prefix = el.slice(2,5).join("."); // e.g. "EMS.IDLE_PERIODS_CHARGE.00-Monday"
			const type = (el[3].endsWith("_CHARGE")) ? 0 : 1;
			const day = Number(el[4].split("-")[0]);
			if( this.sendTupleTimeout[prefix] ) {
				clearTimeout(this.sendTupleTimeout[prefix]);
			}
			this.sendTupleTimeout[prefix] = setTimeout(() => {
				this.getState( `${prefix}.IDLE_PERIOD_ACTIVE`, (err, active) => {
					this.getState( `${prefix}.START_HOUR`, (err, startHour) => {
						this.getState( `${prefix}.START_MINUTE`, (err, startMinute) => {
							this.getState( `${prefix}.END_HOUR`, (err, endHour) => {
								this.getState( `${prefix}.END_MINUTE`, (err, endMinute) => {
									this.sendTupleTimeout[prefix] = null;
									this.clearFrame();
									const c1 = this.startContainer( "TAG_EMS_REQ_SET_IDLE_PERIODS" );
									const c2 = this.startContainer( "TAG_EMS_IDLE_PERIOD" );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_TYPE", "", type );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_DAY", "", day );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_ACTIVE", "", active ? active.val : 0 );
									const c3 = this.startContainer( "TAG_EMS_IDLE_PERIOD_START" );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_HOUR", "", startHour ? startHour.val : 0 );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_MINUTE", "", startMinute ? startMinute.val : 0 );
									this.endContainer(c3);
									const c4 = this.startContainer( "TAG_EMS_IDLE_PERIOD_END" );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_HOUR", "", endHour ? endHour.val : 0 );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_MINUTE", "", endMinute ? endMinute.val : 0 );
									this.endContainer(c4);
									this.endContainer(c2);
									this.pushFrame(c1);
									// SET_IDLE_PERIODS response does not contain new values, so we need to separately request them:
									this.clearFrame();
									this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS" );
									this.pushFrame();
								});
							});
						});
					});
				});
			}, this.config.send_tuple_delay*1000 );
		} else {
			this.log.warn(`queueSetIdlePeriod: invalid globalId ${globalId}`);
		}
	}

	queueGetHistoryData( globalId ) {
		this.log.info( `queueGetHistoryData( ${globalId} )`);
		const el = globalId.split(".");
		if( el.length == 5 ) { // e.g. "e3dc-rscp.0.DB.HISTORY_DATA_DAY.TIME_START"
			const nameSpace = el[2];
			const shortTag = el[3]; // e.g. "HISTORY_DATA_DAY"
			const prefix = `${nameSpace}.${shortTag}`;
			if( nameSpace == "DB" && shortTag.startsWith("HISTORY_DATA_") ) {
				if( this.sendTupleTimeout[prefix] ) {
					clearTimeout(this.sendTupleTimeout[prefix]);
				}
				this.sendTupleTimeout[prefix] = setTimeout(() => {
					this.getState( `${nameSpace}.${shortTag}.TIME_START`, (err, timeStart) => {
						this.getState( `${nameSpace}.${shortTag}.TIME_INTERVAL`, (err, interval) => {
							this.getState( `${nameSpace}.${shortTag}.TIME_SPAN`, (err, span) => {
								this.sendTupleTimeout[prefix] = null;
								let d = new Date();
								if( timeStart && timeStart.val ) {
									d = stringToDate(timeStart.val.toString());
									this.setState( `${nameSpace}.${shortTag}.TIME_START`, dateToString(d), true ); // ack, and format time string
								}
								let i = 0;
								if( interval && interval.val ) {
									i = Number(interval.val);
									this.setState( `${nameSpace}.${shortTag}.TIME_INTERVAL`, interval.val, true ); // ack
								}
								let s = 0;
								if( span && span.val ) {
									s = Number(span.val);
									this.setState( `${nameSpace}.${shortTag}.TIME_SPAN`, span.val, true ); // ack
								}
								this.clearFrame();
								const pos = this.startContainer( `TAG_DB_REQ_${shortTag}` );
								this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_START", "", d.getTime()/1000 );
								this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_INTERVAL", "", i );
								this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_SPAN", "", s );
								this.endContainer(pos);
								this.pushFrame();
								this.log.debug(`TAG_DB_REQ_${shortTag} - START=${d.getTime()/1000} INTERVAL=${i} SPAN=${s}`);
							});
						});
					});
				}, this.config.send_tuple_delay*1000 );
			}
		} else {
			this.log.warn(`queueGetHistoryData: invalid globalId ${globalId}`);
		}
	}

	requestAllData( sml ) {
		if( this.config.query_ems ) this.queueEmsRequestData( sml );
		if( this.config.query_ep ) this.queueEpRequestData( sml );
		if( this.config.query_bat ) this.queueBatRequestData( sml );
		if( this.config.query_pvi ) this.queuePviRequestData( sml );
		if( this.config.query_wb ) this.queueWbRequestData( sml );
		this.sendNextFrame();
	}

	sendNextFrame() {
		if( this && this.queue[0] ) {
			if( rscpTag[this.queue[0].readUInt32LE(18)] ) {
				this.log.debug( `Sending request ${rscpTag[this.queue[0].readUInt32LE(18)].TagNameGlobal}` );
			} else {
				this.log.warn( `sendNextFrame called with invalid content: first tag is ${this.queue[0].readUInt32LE(18)}` );
			}
			this.log.silly( `OUT: ${printRscpFrame(this.queue[0])}` );
			// this.log.silly( dumpRscpFrame(this.queue[0]) );

			const encryptedFrame = Buffer.from( this.cipher.encrypt( this.queue[0], 256, this.encryptionIV ) );
			// last encrypted block will be used as IV for next frame
			if( this.encryptionIV ) encryptedFrame.copy( this.encryptionIV, 0, encryptedFrame.length - BLOCK_SIZE );

			if( this.tcpConnection && this.tcpConnection.write( encryptedFrame ) ) {
				this.log.silly( `Successfully written data to socket` );
				this.queue.shift();
			} else {
				this.log.error( `Failed writing data to socket` );
			}
		} else {
			this.log.silly( "Message queue is empty");
		}
	}

	// Parse flat TLV into tree with (tag, type, content) nodes.
	// For container: include content by recursive descent.
	// Note that type is not always the same as specified in official tag list:
	// e.g. TAG_BAT_DATA (usually a container) may carry just an Error value.
	parseTlv( buffer, start, end ) {
		const tree = [];
		while( start < end ) {
			const tagCode = buffer.readUInt32LE(start);
			const typeCode = buffer.readUInt8(start+4);
			const len = buffer.readUInt16LE(start+5);
			const typeName = rscpType[typeCode];
			if( !rscpTag[tagCode] ) {
				this.log.warn(`Unknown tag: tagCode=0x${tagCode.toString(16)}, len=${len}, typeCode=0x${typeCode.toString(16)}`);
			} else if( typeName == "Container") {
				tree.push({ "tag": tagCode, "type": typeCode, "content": this.parseTlv( buffer, start+7, start+7+len ) });
			} else {
				let value = null;
				switch( typeName  ) {
					case "CString":
						value = buffer.slice(start+7,start+7+len).toString();
						break;
					case "BitField":
					case "ByteArray":
						value = bufferToString( buffer.slice(start+7,start+7+len) );
						break;
					case "Char8":
						value = buffer.readInt8(start+7);
						break;
					case "UChar8":
						value = buffer.readUInt8(start+7);
						break;
					case "Bool":
						value = (buffer.readUInt8(start+7) != 0);
						break;
					case "Int16":
						value = buffer.readInt16LE(start+7);
						break;
					case "UInt16":
						value = buffer.readUInt16LE(start+7);
						break;
					case "Int32":
						value = buffer.readInt32LE(start+7);
						break;
					case "UInt32":
						value = buffer.readUInt32LE(start+7);
						break;
					case "Int64":
						value = buffer.readBigInt64LE(start+7).toString(); // setState does not accept BigInt, so use string representation
						break;
					case "UInt64":
						value = buffer.readBigUInt64LE(start+7).toString(); // setState does not accept BigInt, so use string representation
						break;
					case "Double64":
						value = roundForReadability( buffer.readDoubleLE(start+7) );
						break;
					case "Float32":
						value = roundForReadability( buffer.readFloatLE(start+7) );
						break;
					case "Timestamp":
						value = Math.round(Number(buffer.readBigUInt64LE(start+7))/1000); // setState does not accept BigInt, so convert to seconds
						break;
					case "Error":
						value = buffer.readUInt32LE(start+7);
						break;
					case "None":
						if( len > 0 ) this.log.warn( `Received data type NONE with data length = ${len} - tagCode 0x${tagCode.toString(16)}` );
						break;
					default:
						this.log.warn( `Unable to parse data: ${dumpRscpFrame( buffer.slice(start,start+7+len) )}` );
						value = null;
				}
				tree.push({ "tag": tagCode, "type": typeCode, "content": value });
			}
			start += 7+len;
		}
		return tree;
	}

	// Process one complete frame received from E3/DC:
	processFrame( buffer ) {
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
		if( buffer.length < 18 + dataLength + (hasCrc ? 4 : 0) ) {
			this.log.warn(`Received message with inconsistent length: ${buffer.length} vs ${18 + dataLength + (hasCrc ? 4 : 0)}`);
			this.log.debug( `IN: ${printRscpFrame(buffer)}` );
			this.log.silly( dumpRscpFrame(buffer) );
		}
		if( hasCrc && (CRC32.buf(buffer.slice(0,18+dataLength)) != buffer.readInt32LE(18+dataLength))  ) {
			this.log.warn(`Received message with invalid CRC-32: 0x${CRC32.buf(buffer.slice(0,18+dataLength)).toString(16)} vs 0x${buffer.readUInt32LE(18+dataLength).toString(16)} - dataLength = ${dataLength}`);
			this.log.silly( dumpRscpFrame(buffer) );
		}
		this.processTree( this.parseTlv( buffer, 18, 18+dataLength ), "" );
	}

	// Process a (sub)tree of TLV data:
	processTree( tree, path ) {
		this.log.silly( `processTree: path = ${path}, tree = ${printTree(tree)}` );
		if( !tree ) return;
		let pathNew = path;
		const multipleValueIndex = {};
		for( const i in tree ) {
			const token = tree[i];
			const tagName = rscpTag[token.tag].TagName;
			let tagNameNew = tagName;
			const nameSpace = rscpTag[token.tag].NameSpace;
			const shortId = `${nameSpace}.${tagName}`;
			const typeName = rscpType[token.type];
			if( typeName == "Error" ) {
				// Ignore ERRORs from BAT/PVI probe with out-of-range index
				if( shortId == "BAT.DATA" && this.batProbes-- > 0 ) continue;
				if( shortId == "PVI.REQ_DATA" && this.pviProbes-- > 0 ) continue;
				if( shortId == "EMS.SYS_SPEC_VALUE_INT" ) {
					// Gently skip SYS_SPEC error values, just set to zero
					this.storeValue( nameSpace, pathNew, tagName, "Int32", 0 );
					continue;
				}
				if( ! ignoreIds.includes(shortId) ) {
					this.log.warn( `Received data type ERROR: ${rscpError[token.content]} (${token.content}) - tag ${rscpTag[token.tag].TagNameGlobal} (0x${token.tag.toString(16)})` );
					continue;
				}
			}
			if( typeName == "Container" ) {
				if( shortId == "EMS.SYS_SPEC" && token.content.length == 3 ) {
					this.storeValue( nameSpace, pathNew + "SYS_SPECS.", token.content[1].content, "Int32", token.content[2].content, token.content[1].content, sysSpecUnits[token.content[1].content] );
					this.extendObject( `EMS.SYS_SPECS`, {type: "channel", common: {role: "info"}} );
				} else if( shortId == "EMS.GET_IDLE_PERIODS" ) {
					this.storeIdlePeriods( token.content, pathNew );
				} else if( shortId.startsWith("DB.HISTORY_DATA_") ) {
					this.storeHistoryData( token.content, pathNew + `${tagName}.` );
				} else if ( ignoreIndexIds.includes(shortId)  && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew, tagName, rscpType[token.content[1].type], token.content[1].content );
				} else if ( phaseIds.includes(shortId)  && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew + `Phase_${token.content[0].content}.`, tagName, rscpType[token.content[1].type], token.content[1].content );
					this.extendObject( `${nameSpace}.${pathNew}Phase_${token.content[0].content}`, {type: "channel", common: {role: "sensor.electricity"}} );
				} else if ( stringIds.includes(shortId)  && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew + `String_${token.content[0].content}.`, tagName, rscpType[token.content[1].type], token.content[1].content );
					this.extendObject( `${nameSpace}.${pathNew}String_${token.content[0].content}`, {type: "channel", common: {role: "sensor.electricity"}} );
				} else if ( shortId == "PVI.TEMPERATURE"  && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew + "TEMPERATURE.", token.content[0].content.toString().padStart(2,"0"), rscpType[token.content[1].type], token.content[1].content, "TEMPERATURE", "°C" );
					this.extendObject( `${nameSpace}.${pathNew}TEMPERATURE`, {type: "channel", common: {role: "sensor.temperature"}} );
				} else {
					this.processTree( token.content, pathNew );
				}
			} else {
				// Some tags we just skip, e.g. EMS_SYS_SPEC_INDEX
				if( ignoreIds.includes(shortId)) continue;

				// Handle multiple values for same tag within one container, e.g. PVI_RELEASE
				if ( multipleValueIds.includes(shortId) ) {
					if( ! multipleValueIndex[shortId] ) multipleValueIndex[shortId] = 0;
					this.log.silly( `storeValue( ${nameSpace}, ${pathNew + tagName + "."}, ${multipleValueIndex[shortId].toString().padStart(2,"0")}, ${rscpType[token.type]}, ${token.content}, ${tagName} )`);
					let dictionaryIndex = tagName;
					let unit = "";
					if( tagName == "DCB_CELL_TEMPERATURE" ) {
						if( token.content > 4.5 ) {
							unit = "°C";
						} else { // low values are regarded as voltage (seems to be a flaw in RSCP interface)
							unit = "V";
							dictionaryIndex = "DCB_CELL_VOLTAGE";
						}
					} else if( tagName == "DCB_CELL_VOLTAGE" ) {
						unit = "V";
					}
					const [ t, v ] = this.adjustTypeAndValue( shortId, rscpType[token.type], token.content );
					this.storeValue( nameSpace, pathNew + tagName + ".", multipleValueIndex[shortId].toString().padStart(2,"0"), t, v, dictionaryIndex, unit );
					let r = "info";
					if( tagName.includes("TEMPERATURE") ) r = "sensor.temperature"; else if( tagName.includes("VOLTAGE") ) r = "sensor.electricity";
					this.extendObject( `${nameSpace}.${pathNew.slice(0,-1)}.${tagName}`, {type: "channel", common: {role: r}} );
					multipleValueIndex[shortId]++;
					continue;
				}

				// INDEX indicates top level device, e.g. TAG_BAT_INDEX
				if( tagName == "INDEX" ) {
					if( tree.length <= Number(i)+1 || rscpType[tree[Number(i)+1].type] != "Error" ) {
						this.maxIndex[nameSpace] = this.maxIndex[nameSpace] ? Math.max( this.maxIndex[nameSpace], token.content) : token.content;
						//this.log.silly(`maxIndex[${nameSpace}] = ${this.maxIndex[nameSpace]}`);
						pathNew = `${nameSpace}_${token.content}.`;
						this.extendObject( `${nameSpace}.${pathNew.slice(0,-1)}`, {type: "channel", common: {role: "info.module"}} );
					}
					continue;
				}
				// ..._INDEX indicates sub-device, e.g. TAG_BAT_DCB_INDEX
				if( tagName.endsWith("_INDEX") ) {
					const name = tagName.replace("_INDEX","");
					const key = `${path}.${name}`;
					this.maxIndex[key] = this.maxIndex[key] ? Math.max( this.maxIndex[key], token.content) : token.content;
					pathNew = `${pathNew.split(".").slice(0,-1).join(".")}.${name}_${token.content}.`;
					this.extendObject( `${nameSpace}.${pathNew.slice(0,-1)}`, {type: "channel", common: {role: "info.submodule"}} );
					continue;
				}
				// ..._COUNT explicitely sets upper bound for (sub-)device index
				if( tagName.endsWith("_COUNT") ) {
					this.maxIndex[`${pathNew}${tagName.replace("_COUNT","")}`] = token.content - 1;
				}
				// Translate bit-mapped EMS.STATUS
				if( shortId == "EMS.STATUS" ) {
					for( let bit = 0; bit < 10; bit++ ) {
						this.storeValue( nameSpace, pathNew, `STATUS_${bit}`, "Bool", (token.content & (2**bit)) != 0, `EMS_STATUS_${bit}`);
					}
					continue;
				}

				// Handle mapping between "receive" tag names and "set" tag names:
				let targetStateMatch = null;
				if( mapReceivedIdToState[shortId] ) {
					if( mapReceivedIdToState[shortId]["*"] ) targetStateMatch = "*";
					if( mapReceivedIdToState[shortId][typeName] ) targetStateMatch = typeName;
					if( targetStateMatch && mapReceivedIdToState[shortId][targetStateMatch].targetState == "RETURN_CODE" && token.content < 0 ) {
						this.log.warn(`SET failed: ${shortId} = ${token.content}`);
					}
				}
				if( targetStateMatch ) tagNameNew = mapReceivedIdToState[shortId][targetStateMatch].split(".")[1];

				const [ t, v ] = this.adjustTypeAndValue( shortId, typeName, token.content );
				this.storeValue( nameSpace, pathNew, tagNameNew, t, v );
			}
		}
	}

	// Apply value and/or type corrections due to E3/DC inconsistencies:
	adjustTypeAndValue( shortId, typeName, value ) {
		let newValue = value;
		let newTypeName = typeName;
		if( negateValueIds.includes(shortId) ) newValue = -newValue;
		if( percentValueIds.includes(shortId) ) newValue = newValue * 100;
		if( castToBooleanIds.includes(shortId) && ( typeName == "Char8" || typeName == "UChar8" ) ) {
			newValue = (newValue!=0);
			newTypeName = "Bool";
		}
		if( castToTimestampIds.includes(shortId) ) {
			newValue = dateToString(new Date(Number(newValue)));
			newTypeName = "Timestamp";
		}
		// if( typeName != newTypeName || value != newValue ) this.log.silly(`adjustTypeAndValue(${shortId},${typeName},${value}}) returns [${newTypeName},${newValue}]`);
		return [ newTypeName, newValue ];
	}

	storeValue( nameSpace, path, tagName, typeName, value, dictionaryIndex, unit = "" ) {
		if( !dictionaryIndex ) dictionaryIndex = tagName;
		const oId = `${nameSpace}.${path}${tagName}`;
		const oKey = `${nameSpace}.${tagName}`;
		const oWrite = oKey in mapChangedIdToSetTags;
		let oRole = "";
		if( typeName == "Bool") {
			oRole = oWrite?"switch":"indicator";
		} else {
			oRole = oWrite?"level":"value";
		}
		let oUnit = unit;
		if( oUnit == "" && rscpTag[rscpTagCode[`TAG_${nameSpace}_${tagName}`]] ) {
			oUnit = rscpTag[rscpTagCode[`TAG_${nameSpace}_${tagName}`]].Unit;
		}
		const oName = systemDictionary[dictionaryIndex] ? systemDictionary[dictionaryIndex][this.language] : "***UNDEFINED_NAME***";
		this.setObjectNotExists( oId, {
			type: "state",
			common: {
				name: oName,
				type: rscpTypeMap[typeName],
				role: oRole,
				read: true,
				write: oWrite,
				states: (mapIdToCommonStates[oKey] ? mapIdToCommonStates[oKey] : ""),
				unit: oUnit,
			},
			native: {},
		}, () => {
			this.getState( oId, (err,obj) => {
				if( !(obj && obj.val == value && obj.ack ) ) {
					this.setState( oId, value, true );
				}
			});
		});
	}

	storeIdlePeriods( tree, path ) {
		tree.forEach(token => {
			if( rscpTag[token.tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD" || token.content.length != 5 ) return;
			if( rscpTag[token.content[0].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_TYPE" ) return;
			const type = token.content[0].content;
			if( rscpTag[token.content[1].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_DAY" ) return;
			const day = token.content[1].content;
			const idleNode = (type==0) ? "IDLE_PERIODS_CHARGE" : "IDLE_PERIODS_DISCHARGE";
			const dayNode = `${day.toString().padStart(2,"0")}-${dayOfWeek[day]}`;
			const newPath = `${path}${idleNode}.${dayNode}.`;
			if( !this.sendTupleTimeout[`EMS.${idleNode}.${dayNode}`] ) { // do not overwrite manual changes which are waiting to be sent
				if( rscpTag[token.content[2].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_ACTIVE" ) return;
				const active = token.content[2].content;
				if( rscpTag[token.content[3].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_START" || token.content[3].content.length != 2)  return;
				if( rscpTag[token.content[3].content[0].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_HOUR" ) return;
				const startHour = token.content[3].content[0].content;
				if( rscpTag[token.content[3].content[1].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_MINUTE" ) return;
				const startMinute = token.content[3].content[1].content;
				if( rscpTag[token.content[4].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_END" || token.content[4].content.length != 2)  return;
				if( rscpTag[token.content[4].content[0].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_HOUR" ) return;
				const endHour = token.content[4].content[0].content;
				if( rscpTag[token.content[4].content[1].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_MINUTE" ) return;
				const endMinute = token.content[4].content[1].content;
				this.storeValue( "EMS", newPath, "IDLE_PERIOD_ACTIVE", "Bool", (active!=0) );
				this.storeValue( "EMS", newPath, "START_HOUR", "UChar8", startHour, "START_HOUR", "h" );
				this.storeValue( "EMS", newPath, "START_MINUTE", "UChar8", startMinute, "START_MINUTE", "m" );
				this.storeValue( "EMS", newPath, "END_HOUR", "UChar8", endHour, "END_HOUR", "h" );
				this.storeValue( "EMS", newPath, "END_MINUTE", "UChar8", endMinute, "END_MINUTE", "m" );
				this.extendObject( `EMS.${newPath.slice(0,-1)}`, {type: "channel", common: {role: "calendar.day"}} );
			}
		});
		this.extendObject( "EMS.IDLE_PERIODS_CHARGE", {type: "channel", common: {role: "calendar.week"}} );
		this.extendObject( "EMS.IDLE_PERIODS_DISCHARGE", {type: "channel", common: {role: "calendar.week"}} );
	}

	storeHistoryData( tree, path ) {
		this.getState( `DB.${path}TIME_START`, (err, timeStartObj) => {
			this.getState( `DB.${path}TIME_INTERVAL`, (err, intervalObj) => {
				this.getState( `DB.${path}TIME_SPAN`, (err, spanObj) => {
					let timeStart = 0;
					if( timeStartObj && timeStartObj.val ) { timeStart = stringToDate(timeStartObj.val.toString()).getTime()/1000; } // epoch seconds
					let interval = 0;
					if( intervalObj && intervalObj.val ) { interval = Number(intervalObj.val); }
					let span = 0;
					if( spanObj && spanObj.val ) { span = Number(spanObj.val); }
					let count = 0;
					let oPath = "";
					let oRole = "";
					const scale = path.match(/HISTORY_DATA_([A-Z]+)[.]/)[1].toLowerCase();
					tree.forEach( token => {
						if( rscpTag[token.tag].TagNameGlobal == "TAG_DB_SUM_CONTAINER" ) {
							oPath = `${path}SUM.`;
							oRole = `calendar.${scale}`;
						} else if( rscpTag[token.tag].TagNameGlobal == "TAG_DB_VALUE_CONTAINER" ) {
							oPath = `${path}VALUE_${count.toString().padStart(2,"0")}.`;
							oRole = `calendar.split.${scale}`;
							count++;
							const graphIndex = Number(token.content[0].content);
							const timeStamp = new Date( (timeStart + graphIndex * interval) * 1000 );
							this.storeValue( "DB", oPath, "TIMESTAMP", "CString", dateToString(timeStamp), "TIMESTAMP" );
						} else {
							this.log.debug( `storeHistoryData: ignoring unexpected tag ${rscpTag[token.tag].TagNameGlobal}` );
							return; // next token
						}
						token.content.forEach( t => {
							this.storeValue( "DB", oPath, rscpTag[t.tag].TagName, rscpType[t.type], t.content, rscpTag[t.tag].TagName );
						});
						this.extendObject( `DB.${oPath.slice(0,-1)}`, {type: "channel", common: {role: `${oRole}`}} );
					});
					this.deleteValueObjects( count, path );
				});
			});
		});
	}

	// Delete VALUE_x object branches for a certain x, x+1, ...
	deleteValueObjects( count, path ) {
		const id = `DB.${path}VALUE_${count.toString().padStart(2,"0")}`;
		//this.log.silly(`deleteValueObjects: count=${count}, id=${id}`);
		this.getStates( `${id}.*`, (err, states) => {
			if(states) {
				//this.log.silly(`deleteValueObjects: getStates returned ${JSON.stringify(obj)}`);
				for( const state in states ) {
					this.delObject( state );
				}
				this.delObject( id );
				this.deleteValueObjects( count+1, path );
			}
		});
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
		// Statically, we define only one device per supported RSCP namespace,
		// plus some setter objects which would not appear before first setting.
		// The rest of the object tree is defined dynamically.
		this.language = "en";
		this.getForeignObject("system.config", (err, systemConfig) => {
			if( systemConfig ) this.language = systemConfig.common.language;
		});
		await this.setObjectNotExistsAsync("info", {
			type: "channel",
			common: {
				name: systemDictionary["Information"][this.language],
				role: "info.adapter",
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("info.connection", {
			type: "state",
			common: {
				name: systemDictionary["Connected"][this.language],
				type: "boolean",
				role: "indicator",
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("RSCP", {
			type: "device",
			common: {
				name: systemDictionary["RSCP"][this.language],
				role: "communication.protocol",
			},
			native: {},
		});
		if( this.config.query_bat ) {
			await this.setObjectNotExistsAsync("BAT", {
				type: "device",
				common: {
					name: systemDictionary["BAT"][this.language],
					role: "battery.storage",
				},
				native: {},
			});
		}
		if( this.config.query_pvi ) {
			await this.setObjectNotExistsAsync("PVI", {
				type: "device",
				common: {
					name: systemDictionary["PVI"][this.language],
					role: "photovoltaic.inverter",
				},
				native: {},
			});
		}
		if( this.config.query_ep ) {
			await this.setObjectNotExistsAsync("EP", {
				type: "device",
				common: {
					name: systemDictionary["EP"][this.language],
					role: "emergency.power",
				},
				native: {},
			});
		}
		if( this.config.query_ems ) {
			await this.setObjectNotExistsAsync("EMS", {
				type: "device",
				common: {
					name: systemDictionary["EMS"][this.language],
					role: "energy.management",
				},
				native: {},
			});
			await this.setObjectNotExistsAsync( "EMS.SET_POWER", {
				type: "state",
				common: {
					name: systemDictionary["SET_POWER"][this.language],
					type: "number",
					role: "value",
					read: true,
					write: false,
					unit: rscpTag[rscpTagCode["TAG_EMS_SET_POWER"]].Unit,
				},
				native: {},
			});
			await this.setObjectNotExistsAsync( "EMS.SET_POWER_VALUE", {
				type: "state",
				common: {
					name: systemDictionary["SET_POWER_VALUE"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_REQ_SET_POWER_VALUE"]].Unit,
				},
				native: {},
			});
			await this.setObjectNotExistsAsync( "EMS.SET_POWER_MODE", {
				type: "state",
				common: {
					name: systemDictionary["SET_POWER_MODE"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					states: rscpEmsSetPowerMode,
				},
				native: {},
			});
		}
		if( this.config.query_wb ) {
			await this.setObjectNotExistsAsync("WB", {
				type: "device",
				common: {
					name: systemDictionary["WB"][this.language],
					role: "wallbox",
				},
				native: {},
			});
		}
		if( this.config.query_db ) {
			await this.setObjectNotExistsAsync("DB", {
				type: "device",
				common: {
					name: systemDictionary["DB"][this.language],
					role: "database",
				},
				native: {},
			});
			for( const scale of ["DAY","WEEK","MONTH","YEAR"] ) {
				await this.setObjectNotExistsAsync(`DB.HISTORY_DATA_${scale}`, {
					type: "channel",
					common: {
						name: systemDictionary[`HISTORY_DATA_${scale}`][this.language],
						role: `calendar.${scale.toLowerCase()}`,
					},
					native: {},
				});
				await this.setObjectNotExistsAsync( `DB.HISTORY_DATA_${scale}.TIME_START`, {
					type: "state",
					common: {
						name: systemDictionary["TIME_START"][this.language],
						type: "string",
						role: "level",
						read: false,
						write: true,
					},
					native: {},
				});
				await this.setObjectNotExistsAsync( `DB.HISTORY_DATA_${scale}.TIME_INTERVAL`, {
					type: "state",
					common: {
						name: systemDictionary["TIME_INTERVAL"][this.language],
						type: "number",
						role: "level",
						read: false,
						write: true,
						unit: rscpTag[rscpTagCode["TAG_DB_REQ_HISTORY_TIME_INTERVAL"]].Unit,
					},
					native: {},
				});
				await this.setObjectNotExistsAsync( `DB.HISTORY_DATA_${scale}.TIME_SPAN`, {
					type: "state",
					common: {
						name: systemDictionary["TIME_SPAN"][this.language],
						type: "number",
						role: "level",
						read: false,
						write: true,
						unit: rscpTag[rscpTagCode["TAG_DB_REQ_HISTORY_TIME_SPAN"]].Unit,
					},
					native: {},
				});
			}
			const now = new Date();
			let d = new Date( now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0 );
			this.setState( "DB.HISTORY_DATA_DAY.TIME_START", dateToString(d), true );
			this.setState( "DB.HISTORY_DATA_DAY.TIME_INTERVAL", 3600/4, true );
			this.setState( "DB.HISTORY_DATA_DAY.TIME_SPAN", 3600*6, true );
			d = new Date( d.getTime() - (d.getDay()+6)%7*1000*3600*24 );
			this.setState( "DB.HISTORY_DATA_WEEK.TIME_START", dateToString(d), true );
			this.setState( "DB.HISTORY_DATA_WEEK.TIME_INTERVAL", 3600*4, true );
			this.setState( "DB.HISTORY_DATA_WEEK.TIME_SPAN", 3600*24*7, true );
			d.setDate( 1 );
			this.setState( "DB.HISTORY_DATA_MONTH.TIME_START", dateToString(d), true );
			this.setState( "DB.HISTORY_DATA_MONTH.TIME_INTERVAL", 3600*24, true );
			this.setState( "DB.HISTORY_DATA_MONTH.TIME_SPAN", 3600*24*31, true );
			d.setMonth( 0 );
			this.setState( "DB.HISTORY_DATA_YEAR.TIME_START", dateToString(d), true );
			this.setState( "DB.HISTORY_DATA_YEAR.TIME_INTERVAL", 3600*24*30, true );
			this.setState( "DB.HISTORY_DATA_YEAR.TIME_SPAN", 3600*24*365, true );
		}


		// Initialize your adapter here
		this.log.debug( `config.*: (${this.config.e3dc_ip}, ${this.config.e3dc_port}, ${this.config.portal_user}, ${this.config.polling_interval_short}, ${this.config.polling_interval_medium}, ${this.config.polling_interval_long}, ${this.config.setpower_interval})` );
		// @ts-ignore
		this.getForeignObject("system.config", (err, obj) => {
			if (obj && obj.native && obj.native.secret) {
				this.config.rscp_password = this.decryptPassword(obj.native.secret,this.config.rscp_password);
				this.config.portal_password = this.decryptPassword(obj.native.secret,this.config.portal_password);
				this.initChannel();

				// Find out number of BAT units:
				this.log.debug(`Probing for BAT units - 0..${this.batProbes-1}.`);
				if( this.config.query_bat ) this.queueBatProbe(this.batProbes);
				// Find out number of PVI units and sensors:
				this.log.debug(`Probing for PVI units - 0..${this.pviProbes-1}.`);
				if( this.config.query_pvi ) this.queuePviProbe(this.pviProbes);
				// Force some quick data requests for probing and building the object tree:
				for( let i = 0; i < 5; i++ ) {
					this.probingTimeout[i] = setTimeout(() => {
						this.requestAllData( "" );
					}, i * 1000 * 7 );
				}

				this.dataPollingTimerS = setInterval(() => {
					this.requestAllData( "S" );
				}, this.config.polling_interval_short * 1000 ); // seconds
				this.dataPollingTimerM = setInterval(() => {
					this.requestAllData( "M" );
				}, this.config.polling_interval_medium * 1000 * 60 ); // minutes
				this.dataPollingTimerL = setInterval(() => {
					this.requestAllData( "L" );
				}, this.config.polling_interval_long * 1000 * 3600 ); //hours

				this.config.polling_intervals.forEach(element => {
					this.pollingInterval[rscpTagCode[element.tag]] = element.interval;
				});

			} else {
				this.log.error( "Cannot initialize adapter because obj.native.secret is null." );
			}
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("RSCP.AUTHENTICATION");
		this.subscribeStates("EMS.IDLE_PERIODS_CHARGE.*");
		this.subscribeStates("EMS.IDLE_PERIODS_DISCHARGE.*");
		this.subscribeStates("DB.HISTORY_DATA_DAY.*");
		this.subscribeStates("DB.HISTORY_DATA_WEEK.*");
		this.subscribeStates("DB.HISTORY_DATA_MONTH.*");
		this.subscribeStates("DB.HISTORY_DATA_YEAR.*");
		for( const s in mapChangedIdToSetTags ) this.subscribeStates( s );
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
			if( this.dataPollingTimerS ) clearInterval(this.dataPollingTimerS);
			if( this.dataPollingTimerM ) clearInterval(this.dataPollingTimerM);
			if( this.dataPollingTimerL ) clearInterval(this.dataPollingTimerL);
			if( this.setPowerTimer ) clearInterval(this.setPowerTimer);
			this.sendTupleTimeout.forEach(element => {
				if( element ) this.clearInterval(element);
			});
			this.probingTimeout.forEach(element => {
				if( element ) this.clearInterval(element);
			});
			if( this.reconnectTimeout ) clearInterval(this.reconnectTimeout);
			this.tcpConnection.end();
			this.tcpConnection.destroy();
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
			this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			if( !state.ack ) {
				if( id.endsWith("EMS.SET_POWER_MODE") ) {
					this.getState( "EMS.SET_POWER_VALUE", (err, power) => {
						this.queueEmsSetPower( state.val, power ? power.val : 0 );
					});
				} else if( id.endsWith("EMS.SET_POWER_VALUE") ) {
					this.getState( "EMS.SET_POWER_MODE", (err, mode) => {
						this.queueEmsSetPower( mode ? mode.val : 0, state.val );
					});
				} else if( id.includes("IDLE_PERIOD") ) {
					this.queueSetIdlePeriod( id );
				} else if( id.includes("HISTORY_DATA") ) {
					this.queueGetHistoryData( id );
				} else {
					this.queueSetValue( id, state.val );
				}
			} else if( id.endsWith("RSCP.AUTHENTICATION") && state.val == 0 ) {
				this.log.warn( `E3/DC authentication failed`);
			}
		} else {
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
			text.content += `value: ${buffer.toString("utf8",pos+7,pos+7+len)} `;
			return 7+len;
		case "Bitfield":
		case "ByteArray":
			text.content += `value: ${bufferToString(buffer.slice(pos+7,pos+7+len))} `;
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

function printTree( tree ) {
	let result = "";
	if( tree ) {
		result = "[ ";
		tree.forEach(element => {
			result += `{${rscpTag[element.tag].TagNameGlobal}(${rscpType[element.type]}) = `;
			if( rscpType[element.type] == "Container" ) {
				result += printTree( element.content );
			} else {
				result += element.content;
			}
			result += "}, ";
		});
		result += " ]";
	}
	return result;
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

// Timestamps are stringified like "2022-01-30 12:00:00.000"
function dateToString( date ) {
	const year = date.getFullYear().toString().padStart(4,"0");
	const month = (date.getMonth()+1).toString().padStart(2,"0");
	const day = date.getDate().toString().padStart(2,"0");
	const hour = date.getHours().toString().padStart(2,"0");
	const minute = date.getMinutes().toString().padStart(2,"0");
	const second = date.getSeconds().toString().padStart(2,"0");
	const ms = date.getMilliseconds().toString().padStart(3,"0");
	return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
}
// Missing seconds/milliseconds will be set to zero - minimal valid string is like "2021-1-1 0:0"
// If no match is found, return "today midnight"
function stringToDate( string ) {
	const found =  string.match( /(\d\d\d\d)-(\d\d?)-(\d\d?) (\d\d?):(\d\d?)(?::(\d\d?)(?:\.(\d\d?\d?))?)?/ );
	if( found ) {
		const second = found[6] ? Number(found[6]) : 0;
		const ms = found[7] ? Number(found[7]) : 0;
		return new Date( Number(found[1]), Number(found[2])-1, Number(found[3]), Number(found[4]), Number(found[5]), second, ms );
	} else {
		const now = new Date();
		return new Date( now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0 );
	}
}

// Convert Buffer to/from human readable string, e.g. 4 byte like "F0 12 FF 00"
// Also used to display RSCP ByteArray/BitString types
function bufferToString( buf ) {
	let str = "";
	for (const x of buf ) {
		str += x.toString(16).padStart(2,"0").toUpperCase() + " ";
	}
	return str.trim();
}
function stringToBuffer ( str ) {
	const arr = [];
	str.split(" ").array.forEach(element => {
		arr.push( Number(`0x${element}`) );
	});
	return Buffer.from(arr);
}