/**
 * ioBroker adapter for E3/DC devices.
 *
 * Control your E3/DC power station using the proprietary RSCP protocol which allows for reading state values and also setting control parameters, e.g. the charge power limit. This is the advantage of RSCP compared to the standard Modbus, which is only for reading values. If you have no need to write values, have a look at the (simpler) Modbus adapter.
 *
 * @link   https://github.com/git-kick/ioBroker.e3dc-rscp
 * @file   This files defines the E3dcRscp class.
 * @author git-kick.
 * @since  1.0.0
 */

/* eslint-disable no-unused-vars */
"use strict";

// System dictionary
const fs = require( "fs" );
const path = require( "path" );
// eslint-disable-next-line prefer-const
let systemDictionary = {};
let ad = {};

const helper = require( path.join( __dirname,"/helper.js" ) );

let wb = {};
const wallbox = require( path.join( __dirname,"/wallbox.js" ) );

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
const rscpTag = require( path.join( __dirname, "/lib/RscpTags.json" ) );
const rscpTagCode = {}; // maps string to code
for ( const i in rscpTag ) rscpTagCode[rscpTag[i].TagNameGlobal] = i;


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
for ( const i in rscpType ) rscpTypeCode[rscpType[i]] = i;

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
const rscpEmsSetEmergencyPower = {
	0: "NORMAL_GRID_MODE",
	1: "EMERGENCY_MODE",
	2: "ISLAND_NO_POWER_MODE",
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
const rscpSysSystemReboot = {
	0: "Reboot currently not possible, try later",
	1: "Reboot initiated",
	2: "Waiting for services to terminate, reboot will be initiated then"
};
const rscpWbMode = wb.rscpWbMode;

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
	"PM.MODE": rscpPmMode,
	"PM.TYPE": rscpPmType,
	"WB.PM_ACTIVE_PHASES": rscpActivePhases,
	"WB.MODE": rscpWbMode,
	"SYS.SYTEM_REBOOT": rscpSysSystemReboot,
};
// List of writable states, with Mapping for response value handling.
// Key is returned_tag; value is (type_pattern: target_state)
// type "*" means: apply to all types
const mapReceivedIdToState = {
	"EMS.RES_POWERSAVE_ENABLED": { "*": "EMS.POWERSAVE_ENABLED" },
	"EMS.RES_WEATHER_REGULATED_CHARGE_ENABLED": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_CHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_MAX_DISCHARGE_POWER": { "*": "EMS.RETURN_CODE" },
	"EMS.RES_POWER_LIMITS_USED": { "*": "EMS.RETURN_CODE" },
	"EMS.DISCHARGE_START_POWER": { "Int32": "EMS.DISCHARGE_START_POWER", "Char8": "EMS.RETURN_CODE" },
	"EMS.USER_CHARGE_LIMIT": { "*": "EMS.MAX_CHARGE_POWER" },
	"EMS.USER_DISCHARGE_LIMIT": { "*": "EMS.MAX_DISCHARGE_POWER" },
	"EMS.DPP_SET_BATTERY_CHARGE_ENABLED": { "*": "EMS.DPP_PRICE_BASED_BATTERY_CHARGE_ENABLED" },
	"EMS.DPP_SET_PRICE_LIMIT_BATTERY": { "*": "EMS.DPP_PRICE_LIMIT_BATTERY" },
};
// List of all writable states and define how to send a corresponding SET to E3/DC
// hash-key is the state id - '*' wildcards in path are allowed. This is the state the user will modify to trigger a change.
// hash-value is [optional_container_global_tag, setter_global_tag]. This is the tag the adapter will send to the E3/DC device.
// hash-value is [] (i.e. empty) for tags which are handled in a dedicated queue...() function
const mapChangedIdToSetTags = {
	"EMS.MAX_CHARGE_POWER": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_MAX_CHARGE_POWER"],
	"EMS.MAX_DISCHARGE_POWER": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_MAX_DISCHARGE_POWER"],
	"EMS.DISCHARGE_START_POWER": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_DISCHARGE_START_POWER"],
	"EMS.POWERSAVE_ENABLED": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_POWERSAVE_ENABLED"],
	"EMS.POWER_LIMITS_USED": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_POWER_LIMITS_USED"],
	"EMS.WEATHER_REGULATED_CHARGE_ENABLED": ["TAG_EMS_REQ_SET_POWER_SETTINGS", "TAG_EMS_WEATHER_REGULATED_CHARGE_ENABLED"],
	"EMS.MANUAL_CHARGE_ENERGY": ["", "TAG_EMS_REQ_START_MANUAL_CHARGE"],
	"EMS.SET_POWER_MODE": [],
	"EMS.SET_POWER_VALUE": [],
	"EMS.BATTERY_TO_CAR_MODE": ["", "TAG_EMS_REQ_SET_BATTERY_TO_CAR_MODE"],
	"EMS.BATTERY_BEFORE_CAR_MODE": ["", "TAG_EMS_REQ_SET_BATTERY_BEFORE_CAR_MODE"],
	"EMS.WB_DISCHARGE_BAT_UNTIL": ["", "TAG_EMS_REQ_SET_WB_DISCHARGE_BAT_UNTIL"],
	"EMS.WB_ENFORCE_POWER_ASSIGNMENT": ["", "TAG_EMS_REQ_SET_WB_ENFORCE_POWER_ASSIGNMENT"],
	"EMS.EMERGENCY_POWER": ["", "TAG_EMS_REQ_SET_EMERGENCY_POWER"],
	"EMS.START_EMERGENCY_POWER_TEST": ["", "TAG_EMS_REQ_START_EMERGENCY_POWER_TEST"],
	"EMS.OVERRIDE_AVAILABLE_POWER": ["", "TAG_EMS_REQ_SET_OVERRIDE_AVAILABLE_POWER"],
	"EMS.DPP_PRICE_LIMIT_BATTERY": ["", "TAG_EMS_REQ_DPP_SET_PRICE_LIMIT_BATTERY"],
	"EMS.DPP_PRICE_BASED_BATTERY_CHARGE_ENABLED": ["", "TAG_EMS_REQ_DPP_SET_BATTERY_CHARGE_ENABLED"],
	"EMS.DPP_SOC_BATTERY": ["", "TAG_EMS_REQ_DPP_SET_SOC_BATTERY"],
	"EMS.DPP_MONTHS_ACTIVE": ["", "TAG_EMS_REQ_DPP_SET_MONTHS_ACTIVE"],
	"EMS.*.*.IDLE_PERIOD_ACTIVE": [],
	"EMS.*.*.START_HOUR": [],
	"EMS.*.*.START_MINUTE": [],
	"EMS.*.*.END_HOUR": [],
	"EMS.*.*.END_MINUTE": [],
	"EMS.*.*.PERIOD_ACTIVE": [],
	"EMS.*.*.IDLE_PERIOD_TYPE": [],
	"EMS.*.*.PERIOD_START": [],
	"EMS.*.*.PERIOD_STOP": [],
	"EMS.*.*.PERIOD_WEEKDAYS": [],
	"EMS.*.*.PERIOD_DESCRIPTION": [],
	"EP.*.PARAM_EP_RESERVE": [],
	"EP.*.PARAM_EP_RESERVE_ENERGY": [],
	"DB.HISTORY_DATA_DAY.*": [],
	"DB.HISTORY_DATA_WEEK.*": [],
	"DB.HISTORY_DATA_MONTH.*": [],
	"DB.HISTORY_DATA_YEAR.*": [],
	"SYS.SYSTEM_REBOOT": ["", "TAG_SYS_REQ_SYSTEM_REBOOT"],
	"SYS.RESTART_APPLICATION": ["", "TAG_SYS_REQ_RESTART_APPLICATION"],
	"WB.*.Control.*": [],
};
// RSCP is sloppy concerning Bool - some Char8 and UChar8 values must be converted:
const castToBooleanIds = [
	"EMS.POWERSAVE_ENABLED",
	"EMS.RES_POWERSAVE_ENABLED",
	"EMS.WEATHER_REGULATED_CHARGE_ENABLED",
	"EMS.hybridModeSupported",
	"EMS.BATTERY_BEFORE_CAR_MODE",
	"EMS.BATTERY_TO_CAR_MODE",
	"EMS.WB_ENFORCE_POWER_ASSIGNMENT",
	"EMS.EXT_SRC_AVAILABLE",
	"SYS.IS_SYSTEM_REBOOTING",
	"SYS.RESTART_APPLICATION",
];
// RSCP is sloppy concerning Timestamp - some UInt64 values must be converted:
const castToTimestampIds = [
	"BAT.DCB_LAST_MESSAGE_TIMESTAMP",
	"EMS.ERROR_TIMESTAMP",
	"EP.PARAM_TIME_LAST_EMPTY",
	"EP.PARAM_TIME_LAST_FULL"
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
// Some of the return values we do not want to see as (missing) states.
// "INDEX" and "..._INDEX" tags are automatically treated as subchannels, no need to list them here.
// Current implementation handles only containers having exactly 1 value attribute besides index.
const ignoreIds = [
	"RSCP.UNDEFINED",
	"EMS.UNDEFINED_POWER_VALUE",
	"EMS.UNDEFINED_POWER_SETTING",
	"EMS.MANUAL_CHARGE_START_COUNTER", // returns Int64, seems to be the same timestamp as in MANUAL_CHARGE_LAST_START
	"EMS.PARAM_INDEX", // always 0, occurs in container EMERGENCY_POWER_OVERLOAD_STATUS
	"EMS.SYS_SPEC_INDEX",
	"EMS.SET_IDLE_PERIODS",
	"EMS.SET_IDLE_PERIODS_2",
	"EMS.SET_WB_DISCHARGE_BAT_UNTIL",  	// Response is always "true", not usable for state with unit "%"
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
// Some of the INDEX or COUNT tags must be treated as regular values, NOT as indexes
const notIndexIds = [
	"BAT.DCB_CYCLE_COUNT",
	"BAT.SPECIFIED_MAX_DCB_COUNT",
];
// Some of the tags are unavailable on some E3/DC devices.
// For those, automatically stop polling after the first RSCP_ERR_NOT_AVAILABLE response:
const stopPollingIds = [
	"PVI.REQ_FREQUENCY_UNDER_OVER",
	"PVI.REQ_VOLTAGE_MONITORING"
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
const Net = require( "net" );
const CRC32 = require( "crc-32" );
// @ts-ignore
const Rijndael = require( "rijndael-js" );
const BLOCK_SIZE = 32;
const KEY_SIZE = 32;

/*
 * Created with @iobroker/create-adapter v1.31.0
 */
const utils = require( "@iobroker/adapter-core" );
const { resourceLimits, threadId } = require( "worker_threads" );
const { type } = require( "os" );
class E3dcRscp extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor( options ) {
		super( {
			...options,
			name: "e3dc-rscp",
		} );
		this.on( "ready", this.onReady.bind( this ) );
		this.on( "stateChange", this.onStateChange.bind( this ) );
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on( "unload", this.onUnload.bind( this ) );

		// For preparing & buffering outbound frames:
		this.frame = null;
		this.queue = [];

		// For keeping observed max. indexes, e.g. BAT.INDEX, DCB_COUNT etc.:
		this.maxIndex = {}; // {path} - the biggest index with ok response, or 1 below the smallest index with error response

		// For PM, there may be a non-sequential set of indexes like (0, 2, 6),
		// so initialize with a best guess covering set, which will be pinched out dynamically.
		this.indexSet = {}; // {path} - array of indexes with ok response

		// For triggering the polling and setting requests:
		this.dataPollingTimerS = null;
		this.dataPollingTimerM = null;
		this.dataPollingTimerL = null;
		this.setPowerTimer = null;
		this.checkAuthTimeout = null;
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
	initChannel() {
		if ( !this.config.portal_user ) this.config.portal_user = "";
		if ( !this.config.portal_password ) this.config.portal_password = "";

		this.aesKey = Buffer.alloc( KEY_SIZE, 0xFF );
		this.encryptionIV = Buffer.alloc( BLOCK_SIZE, 0xFF );
		this.decryptionIV = Buffer.alloc( BLOCK_SIZE, 0xFF );
		if( this.aesKey.write( this.config.rscp_password ) > this.config.rscp_password.length ) this.log.error( "ERROR initializing AES-KEY!" );
		this.cipher = new Rijndael( this.aesKey, "cbc" );

		this.queueRscpAuthentication();
		this.checkAuthTimeout = this.setTimeout( () => {
			this.getState( "RSCP.AUTHENTICATION", ( err, obj ) => {
				const auth = obj ? obj.val : 0;
				// @ts-ignore
				if( auth < 10  ) {
					this.log.error( "Authentication against E3/DC failed - check adapter settings, then restart instance." );
					this.setState( "info.connection", false, true );
				}
			} );
		}, 5000 ); // check authentication success after 5 seconds - no retry.

		this.setState( "info.connection", false, true );
		if( this.config.e3dc_port && this.config.e3dc_ip ) {
			this.tcpConnection.connect( this.config.e3dc_port, this.config.e3dc_ip, () => {
				this.setState( "info.connection", true, true );
				this.log.info( "Connection to E3/DC is established" );
				this.sendFrameFIFO();
			} );
		} else {
			this.log.error( "E3/DC IP address and/or port not set - check adapter configuration!" );
			// For exit codes see https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/src/lib/common/exitCodes.ts
			this.terminate( "Error due to missing ip/port", 2 );
		}

		this.tcpConnection.on( "data", ( data ) => {
			this.setState( "info.connection", true, true );
			// Use inBuffer to handle TCP fragmentation:
			if ( this.inBuffer ) {
				this.inBuffer = Buffer.concat( [this.inBuffer, data] );
			} else {
				this.inBuffer = Buffer.from( data );
			}
			if( this.inBuffer && this.inBuffer.length % 32 == 0 ) {
				const receivedFrame = Buffer.from( this.cipher.decrypt( this.inBuffer, 256, this.decryptionIV ) );
				this.log.silly( "Received response" );
				if( rscpTag[receivedFrame.readUInt32LE( 18 )] ) this.log.silly( rscpTag[receivedFrame.readUInt32LE( 18 )].TagNameGlobal );
				if( this.decryptionIV ) this.inBuffer.copy( this.decryptionIV, 0, this.inBuffer.length - BLOCK_SIZE ); // last encrypted block will be used as IV for next frame
				this.log.silly( `IN: ${printRscpFrame( receivedFrame )}` );
				// this.log.silly( dumpRscpFrame(receivedFrame) );
				this.processFrame( receivedFrame );
				this.sendFrameFIFO();
				this.inBuffer = null;
			} else {
				this.log.silly( `inBuffer has length ${this.inBuffer.length} which is not a multiple of 256bit - waiting for next chunk...` );
			}
		} );

		this.tcpConnection.on( "end", () => {
			this.setState( "info.connection", false, true );
			this.log.warn( "Disconnected from E3/DC" );
			this.reconnectChannel();
		} );

		this.tcpConnection.on( "close", () => {
			this.setState( "info.connection", false, true );
			this.log.warn( "E3/DC connection closed" );
			this.reconnectChannel();
		} );

		this.tcpConnection.on( "timeout", () => {
			this.setState( "info.connection", false, true );
			this.log.info( "E3/DC connection timeout" );
			this.reconnectChannel();
		} );

		this.tcpConnection.on( "error", () => {
			this.setState( "info.connection", false, true );
			this.log.error( "E3/DC connection error" );
			this.reconnectChannel();
		} );

		// For BAT and PVI, there is no COUNT request, so initialize maxIndex to a best guess upper bound.
		// Error responses due to out-of range index are handled by processTree(), and maxIndex is adjusted dynamically.
		// Initialize index sets from adapter config:
		this.maxIndex["BAT"] = this.config.maxindex_bat; // E3/DC tag list states that BAT INDEX is always 0, BUT there are counterexamples (see Issue#96)
		this.maxIndex["PVI"] = this.config.maxindex_pvi;
		this.maxIndex["WB"] = this.config.maxindex_wb;
		this.indexSet["PM"] = [];
		for ( let i = 0; i <= this.config.maxindex_pm; i++ ) {
			this.indexSet["PM"].push( i );
		}

		// Force some quick data requests for index probing and building up the object tree:
		for( let i = 0; i < 5; i++ ) {
			this.probingTimeout[i] = setTimeout( () => {
				this.requestAllData( "" );
			}, i * 1000 * 7 );  // every 7 seconds
		}

		this.dataPollingTimerS = setInterval( () => {
			this.requestAllData( "S" );
		}, this.config.polling_interval_short * 1000 ); // seconds
		this.dataPollingTimerM = setInterval( () => {
			this.requestAllData( "M" );
		}, this.config.polling_interval_medium * 1000 * 60 ); // minutes
		this.dataPollingTimerL = setInterval( () => {
			this.requestAllData( "L" );
		}, this.config.polling_interval_long * 1000 * 3600 ); //hours

		this.config.polling_intervals.forEach( element => {
			this.pollingInterval[rscpTagCode[element.tag]] = element.interval;
		} );

		// Cleanup v1/v2 idle period objects, according to config:
		if( !this.config.periods_v1 ) {
			this.deleteObjectRecursively( "e3dc-rscp.0.EMS.IDLE_PERIODS_CHARGE" );
			this.deleteObjectRecursively( "e3dc-rscp.0.EMS.IDLE_PERIODS_DISCHARGE" );
		}
		if( !this.config.periods_v2 ) {
			this.deleteObjectRecursively( "e3dc-rscp.0.EMS.IDLE_PERIODS_2" );
		}
	}

	reconnectChannel() {
		if( !this.reconnectTimeout ) {
			this.log.info( "Stop communication with E3/DC and pause a minute before retry ..." );
			this.tcpConnection.removeAllListeners();
			this.clearAllIntervals();
			this.reconnectTimeout = setTimeout( () => {
				this.reconnectTimeout = null;
				this.log.info( "Try reconnecting to E3/DC" );
				this.initChannel();
			}, 60000 );
		}
	}

	clearFrame() { // preset MAGIC and CTRL and reserve space for timestamp and length
		this.frame = Buffer.from( [0xE3, 0xDC, 0x00, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] );
	}

	// Add one tag to the frame under preparation
	// Not for Container tags, see startContainer
	addTagtoFrame( tag, sml = "", value = Object( 0 ) ) {
		if( !rscpTagCode[tag] ) {
			this.log.warn( `Unknown tag ${tag} with value ${value} - cannot add to frame.` );
			return;
		}
		const tagCode = rscpTagCode[tag];
		if( sml != "" && !Object.keys( this.pollingInterval ).includes( tagCode ) && tag.includes( "_REQ_" ) && !tag.endsWith( "_COUNT" ) ) {
			this.log.warn( `${tag} has no assigned polling interval  - assuming 'M' - please check io-package.json` );
			this.pollingInterval[tagCode] = "M";
		}
		if ( this.pollingInterval[tagCode] != "N" && ( sml == "" || sml == this.pollingInterval[tagCode] ) ) {
			const typeCode = parseInt( rscpTag[tagCode].DataTypeHex, 16 );
			const buf1 = Buffer.alloc( 1 );
			const buf2 = Buffer.alloc( 2 );
			const buf4 = Buffer.alloc( 4 );
			const buf8 = Buffer.alloc( 8 );
			buf4.writeInt32LE( tagCode );
			this.frame = Buffer.concat( [this.frame, buf4] );
			this.frame = Buffer.concat( [this.frame, Buffer.from( [typeCode] )] );
			this.frame = Buffer.concat( [this.frame, Buffer.from( [0x00, 0x00] )] ); // reserve space for Length
			switch( rscpType[typeCode] ) {
				case "None":
					break;
				case "Container":
					this.log.warn( `Container-tag ${tag} passed to addTagToFrame - cannot add tag to frame.` );
					return;
				case "CString":
					if( typeof value != "string" ) value = "";
					this.frame.writeUInt16LE( value.length, this.frame.length - 2 );
					this.frame = Buffer.concat( [this.frame, Buffer.from( value )] );
					break;
				case "Bitfield":
				case "ByteArray":
					if( typeof value != "string" ) value = "";
					this.frame.writeUInt16LE( helper.stringToBuffer( value ).length, this.frame.length - 2 );
					this.frame = Buffer.concat( [this.frame, helper.stringToBuffer( value )] );
					break;
				case "Char8":
				case "UChar8":
				case "Error":
					if( typeof value == "boolean" ) value = value?1:0;
					else if( typeof value != "number" || value < 0 || value > Math.pow( 2, 8 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 1, this.frame.length - 2 );
					buf1.writeUInt8( value );
					this.frame = Buffer.concat( [this.frame, buf1] );
					break;
				case "Bool": // bool is encoded as 0/1 byte
					if( typeof value != "boolean" ) value = false;
					this.frame.writeUInt16LE( 1, this.frame.length - 2 );
					buf1.writeUInt8( value?1:0 );
					this.frame = Buffer.concat( [this.frame, buf1] );
					break;
				case "Int16":
					if ( typeof value != "number" || value < -Math.pow( 2, 15 ) || value > Math.pow( 2, 15 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 2, this.frame.length - 2 );
					buf2.writeInt16LE( value );
					this.frame = Buffer.concat( [this.frame, buf2] );
					break;
				case "UInt16":
					if ( typeof value != "number" || value < 0 || value > Math.pow( 2, 16 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 2, this.frame.length - 2 );
					buf2.writeUInt16LE( value );
					this.frame = Buffer.concat( [this.frame, buf2] );
					break;
				case "Int32":
					if ( typeof value != "number" || value < -Math.pow( 2, 31 ) || value > Math.pow( 2, 31 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 4, this.frame.length - 2 );
					buf4.writeInt32LE( value );
					this.frame = Buffer.concat( [this.frame, buf4] );
					break;
				case "UInt32":
					if ( typeof value != "number" || value < 0 || value > Math.pow( 2, 32 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 4, this.frame.length - 2 );
					buf4.writeUInt32LE( value );
					this.frame = Buffer.concat( [this.frame, buf4] );
					break;
				case "Int64":
					if ( typeof value != "number" || value < -Math.pow( 2, 63 ) || value > Math.pow( 2, 63 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 8, this.frame.length - 2 );
					buf8.writeBigInt64LE( value );
					this.frame = Buffer.concat( [this.frame, buf8] );
					break;
				case "UInt64":
					if ( typeof value != "number" || value < 0 || value > Math.pow( 2, 64 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 8, this.frame.length - 2 );
					buf8.writeBigUInt64LE( value );
					this.frame = Buffer.concat( [this.frame, buf8] );
					break;
				case "Float32":
					if ( typeof value != "number" ) value = 0;
					this.frame.writeUInt16LE( 4, this.frame.length - 2 );
					buf4.writeFloatLE( value );
					this.frame = Buffer.concat( [this.frame, buf4] );
					break;
				case "Double64":
					if ( typeof value != "number" ) value = 0;
					this.frame.writeUInt16LE( 8, this.frame.length - 2 );
					buf8.writeDoubleLE( value );
					this.frame = Buffer.concat( [this.frame, buf8] );
					break;
				case "Timestamp": // NOTE: treating value as seconds (float)
					if ( typeof value != "number" || value < 0 || value > Math.pow( 2, 64 ) - 1 ) value = 0;
					this.frame.writeUInt16LE( 12, this.frame.length - 2 );
					buf8.writeBigUInt64LE( BigInt( Math.floor( value ) ) );
					buf4.writeUInt32LE( Math.round( ( value - Math.floor( value ) ) * 1000000 ) );
					this.frame = Buffer.concat( [this.frame, buf8, new Uint8Array( [0x00,0x00,0x00,0x00] )] );
					break;
				default:
					this.log.warn( `addTagtoFrame does not know how to handle data type ${rscpType[typeCode]}` );
			}
			return 0;
		}
	}

	// Add a Container tag to frame under preparation
	// Returns position of Container length within frame for use in endContainer
	startContainer( tag, sml = "" ) {
		if( !rscpTagCode[tag] ) {
			this.log.warn( `Unknown container tag ${tag} - cannot start container.` );
			return 0;
		}
		const tagCode = rscpTagCode[tag];
		if( sml == "" || !Object.keys( this.pollingInterval ).includes( tagCode ) || this.pollingInterval[tagCode] == sml ) {
			const typeCode = parseInt( rscpTag[tagCode].DataTypeHex, 16 );
			if( rscpType[typeCode] != "Container" ) {
				this.log.warn( `Non-container tag ${tag} passed to startContainer - cannot start container.` );
				return 0;
			}
			const buf4 = Buffer.alloc( 4 );
			buf4.writeInt32LE( tagCode );
			this.frame = Buffer.concat( [this.frame, buf4] );
			this.frame = Buffer.concat( [this.frame, Buffer.from( [typeCode] )] );
			this.frame = Buffer.concat( [this.frame, Buffer.from( [0x00, 0x00] )] ); // reserve space for Length
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
			this.frame.writeUIntLE( Math.floor( new Date().getTime()/1000 ), 4, 6 ); // set timestamp - bytes 7,8 remain zero (which will be wrong after 19.01.2038)
			this.frame.writeUInt16LE( this.frame.length - 18, 16 ); // set total length
			if( pos > 0 ) this.endContainer( pos );
			const buf4 = Buffer.alloc( 4 );
			buf4.writeInt32LE( CRC32.buf( this.frame ) );
			this.frame = Buffer.concat( [this.frame, buf4] ); // concat returns a copy of this.frame, which therefore can be reused
			this.queue.push( this.frame );
		}
	}

	queueRscpAuthentication() {
		this.clearFrame();
		const pos = this.startContainer( "TAG_RSCP_REQ_AUTHENTICATION" );
		this.addTagtoFrame( "TAG_RSCP_AUTHENTICATION_USER", "", this.config.portal_user );
		this.addTagtoFrame( "TAG_RSCP_AUTHENTICATION_PASSWORD", "", this.config.portal_password );
		this.pushFrame( pos );
	}

	queueBatRequestData( sml ) {
		for ( let i = 0; i <= this.maxIndex["BAT"]; i++ ) {
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
			for ( let j = 0; j <= this.maxIndex[`BAT_${i}.DCB`]; j++ ) {
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_ALL_CELL_TEMPERATURES", sml, j );
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_ALL_CELL_VOLTAGES", sml, j );
				this.addTagtoFrame( "TAG_BAT_REQ_DCB_INFO", sml, j );
			}
			this.pushFrame( pos );
		}
	}

	queuePviRequestData( sml ) {
		for ( let i = 0; i <= this.maxIndex["PVI"]; i++ ) {
			this.clearFrame();
			const pos = this.startContainer( "TAG_PVI_REQ_DATA" );
			this.addTagtoFrame( "TAG_PVI_INDEX", "", i );
			this.addTagtoFrame( "TAG_PVI_REQ_DC_MAX_STRING_COUNT", "" );
			this.addTagtoFrame( "TAG_PVI_REQ_TEMPERATURE_COUNT", sml );
			this.addTagtoFrame( "TAG_PVI_REQ_TYPE", sml );
			this.addTagtoFrame( "TAG_PVI_REQ_SERIAL_NUMBER", sml );
			this.addTagtoFrame( "TAG_PVI_REQ_VERSION", sml );
			this.addTagtoFrame( "TAG_PVI_REQ_ON_GRID", sml );
			this.addTagtoFrame( "TAG_PVI_REQ_STATE", sml );
			this.addTagtoFrame( "TAG_PVI_REQ_LAST_ERROR", sml );
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
			for( let j = 0; j <= this.maxIndex[`PVI_${i}.AC_MAX_PHASE`]; j++ ) {
				for( const id of phaseIds ) {
					this.addTagtoFrame( `TAG_PVI_REQ_${id.split( "." )[1]}`, sml, j );
				}
			}
			for( let j = 0; j <= this.maxIndex[`PVI_${i}.DC_MAX_STRING`]; j++ ) {
				for( const id of stringIds ) {
					this.addTagtoFrame( `TAG_PVI_REQ_${id.split( "." )[1]}`, sml, j );
				}
			}
			for( let j = 0; j <= this.maxIndex[`PVI_${i}.TEMPERATURE`]; j++ ) {
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
		this.addTagtoFrame( "TAG_EMS_REQ_WB_DISCHARGE_BAT_UNTIL", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_WB_ENFORCE_POWER_ASSIGNMENT", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_REMAINING_BAT_CHARGE_POWER", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_REMAINING_BAT_DISCHARGE_POWER", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCY_POWER_STATUS", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCY_POWER_TEST_STATUS", sml );
		// this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCY_POWER_OVERLOAD_STATUS", sml ); // no response?
		// this.addTagtoFrame( "TAG_EMS_REQ_EMERGENCY_POWER_RETRY", sml ); // CAUTION: stops inverter! Response is a bool & PARAM_0=(NO_REMAINING_ENTY,TIME_TO_RETRY)
		this.addTagtoFrame( "TAG_EMS_REQ_STORED_ERRORS", sml );
		// this.addTagtoFrame( "TAG_EMS_REQ_GET_GENERATOR_STATE", sml ); // always returns ERROR data type
		// this.addTagtoFrame( "TAG_EMS_REQ_ERROR_BUZZER_ENABLED", sml ); // always returns ERROR data type
		this.addTagtoFrame( "TAG_EMS_REQ_INSTALLED_PEAK_POWER", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DERATE_AT_PERCENT_VALUE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DERATE_AT_POWER_VALUE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_EXT_SRC_AVAILABLE", sml );
		if( this.config.periods_v1 ) { this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS", sml ); }
		if( this.config.periods_v2 ) { this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS_2", sml ); }
		this.addTagtoFrame( "TAG_EMS_REQ_GET_SYS_SPECS", sml );
		this.pushFrame();
	}

	queueDppRequestData( sml ) {
		this.clearFrame();
		this.addTagtoFrame( "TAG_EMS_REQ_DPP_PRICE_BASED_WB_CHARGE_ACTIVE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DPP_PRICE_BASED_BATTERY_CHARGE_ACTIVE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DPP_PRICE_LIMIT_BATTERY", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DPP_SOC_BATTERY", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DPP_MONTHS_ACTIVE", sml );
		this.addTagtoFrame( "TAG_EMS_REQ_DPP_PRICE_BASED_BATTERY_CHARGE_ENABLED" , sml );
		this.pushFrame();
	}

	sendEmsSetPower( mode, value ) {
		this.log.debug( `sendEmsSetPower( ${mode}, ${value} )` );
		this.clearFrame();
		const pos = this.startContainer( "TAG_EMS_REQ_SET_POWER" );
		this.addTagtoFrame( "TAG_EMS_REQ_SET_POWER_MODE", "", mode );
		this.addTagtoFrame( "TAG_EMS_REQ_SET_POWER_VALUE", "", value );
		this.pushFrame( pos );
		this.sendFrameLIFO();
		this.clearFrame();
		this.addTagtoFrame( "TAG_EMS_REQ_MODE" ); // separately update MODE because SET_POWER response contains VALUE, but not MODE
		this.pushFrame();
		this.sendFrameLIFO();
		// Acknowledge SET_POWER_*
		this.setState( "EMS.SET_POWER_MODE", mode, true );
		this.setState( "EMS.SET_POWER_VALUE", value, true );
		// E3/DC requires regular SET_POWER repetition, otherwise it will fall back to NORMAL mode:
		if( ( mode > 0 && this.config.setpower_interval > 0 ) && !this.setPowerTimer ) {
			this.setPowerTimer = setInterval( () => {
				this.getState( "EMS.SET_POWER_VALUE", ( err, vObj ) => {
					this.getState( "EMS.SET_POWER_MODE", ( err, mObj ) => {
						this.sendEmsSetPower( mObj ? mObj.val : 0, vObj ? vObj.val : 0 );
					} );
				} );
			}, this.config.setpower_interval*1000 );
		} else if( ( mode == 0 || this.config.setpower_interval == 0 ) && this.setPowerTimer ) { // clear timer when mode is set to NORMAL or interval is zero
			clearInterval( this.setPowerTimer );
			this.setPowerTimer = null; // nullify to enable "is timer running" check
		}
	}

	queueSysRequestData( sml ) {
		this.clearFrame();
		this.addTagtoFrame( "TAG_SYS_REQ_IS_SYSTEM_REBOOTING", sml );
		this.pushFrame();
	}

	queueInfoRequestData( sml ) {
		this.clearFrame();
		this.addTagtoFrame( "TAG_INFO_REQ_SERIAL_NUMBER", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_PRODUCTION_DATE", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_MODULES_SW_VERSIONS", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_A35_SERIAL_NUMBER", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_IP_ADDRESS", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_SUBNET_MASK", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_MAC_ADDRESS", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_GATEWAY", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_DNS", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_DHCP_STATUS", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_TIME", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_UTC_TIME", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_TIME_ZONE", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_SW_RELEASE", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_GUI_TARGET", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_GET_FACILITY", sml );
		this.addTagtoFrame( "TAG_INFO_REQ_GET_FS_USAGE", sml );

		// REQ_INFO is just a shortcut for REQ_SERIAL_NUMBER, REQ_MAC_ADDRESS, REQ_PRODUCTION_DATE; but it's buggy, delivers invalid PRODUCTION_DATE
		// this.addTagtoFrame( "TAG_INFO_REQ_INFO", sml );

		// The following requests all end up in "access denied":
		// this.addTagtoFrame( "TAG_INFO_REQ_PLATFORM_TYPE", sml );
		// this.addTagtoFrame( "TAG_INFO_REQ_IS_CALIBRATED", sml );
		// this.addTagtoFrame( "TAG_INFO_REQ_CALIBRATION_CHECK", sml );
		// this.addTagtoFrame( "TAG_INFO_REQ_HW_TIME", sml );
		this.pushFrame();
	}

	queuePmRequestData( sml ) {
		this.clearFrame();
		for( const i of this.indexSet["PM"] ) {
			const pos = this.startContainer( "TAG_PM_REQ_DATA" );
			this.addTagtoFrame( "TAG_PM_INDEX", "", i );
			this.addTagtoFrame( "TAG_PM_REQ_DEVICE_STATE", sml );
			this.addTagtoFrame( "TAG_PM_REQ_POWER_L1", sml );
			this.addTagtoFrame( "TAG_PM_REQ_POWER_L2", sml );
			this.addTagtoFrame( "TAG_PM_REQ_POWER_L3", sml );
			this.addTagtoFrame( "TAG_PM_REQ_ACTIVE_PHASES", sml );
			this.addTagtoFrame( "TAG_PM_REQ_MODE", sml );
			this.addTagtoFrame( "TAG_PM_REQ_ENERGY_L1", sml );
			this.addTagtoFrame( "TAG_PM_REQ_ENERGY_L2", sml );
			this.addTagtoFrame( "TAG_PM_REQ_ENERGY_L3", sml );
			this.addTagtoFrame( "TAG_PM_REQ_DEVICE_ID", sml );
			this.addTagtoFrame( "TAG_PM_REQ_ERROR_CODE", sml );
			this.addTagtoFrame( "TAG_PM_REQ_FIRMWARE_VERSION", sml );
			this.addTagtoFrame( "TAG_PM_REQ_VOLTAGE_L1", sml );
			this.addTagtoFrame( "TAG_PM_REQ_VOLTAGE_L2", sml );
			this.addTagtoFrame( "TAG_PM_REQ_VOLTAGE_L3", sml );
			this.addTagtoFrame( "TAG_PM_REQ_TYPE", sml );
			this.addTagtoFrame( "TAG_PM_REQ_GET_PHASE_ELIMINATION", sml );
			this.endContainer( pos );
		}
		this.pushFrame();
	}

	queueEpRequestData( sml ) {
		this.clearFrame();
		this.addTagtoFrame( "TAG_EP_REQ_IS_READY_FOR_SWITCH", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_GRID_CONNECTED", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_ISLAND_GRID", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_POSSIBLE", sml );
		this.addTagtoFrame( "TAG_EP_REQ_IS_INVALID_STATE", sml );
		this.addTagtoFrame( "TAG_EP_REQ_EP_RESERVE", sml );
		this.pushFrame();
	}

	// Only used for interface exploration:
	queueDbRequestData( sml ) {
		this.clearFrame();
		const pos = this.startContainer( "TAG_DB_REQ_HISTORY_DATA_DAY" );
		this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_START", "", 1639609200 );
		this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_INTERVAL", "", 1800 );
		this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_SPAN", "", 86400 );
		this.endContainer( pos );
		this.pushFrame();
	}

	queueSetValue( globalId, value ) {
		this.log.info( `queueSetValue( ${globalId}, ${value} )` );
		const id = globalId.match( "^[^.]+[.][^.]+[.](.*)" )[1];
		const setTags = getSetTags( id );
		if ( setTags && setTags.length == 2 ) {
			if ( setTags[0] ) {
				this.clearFrame();
				const pos = this.startContainer( setTags[0] );
				this.addTagtoFrame( setTags[1], "", value );
				this.pushFrame( pos );
			} else {
				this.clearFrame();
				this.addTagtoFrame( setTags[1], "", value );
				this.pushFrame();
			}
		} else {
			this.log.warn( `Don't know how to queue ${id}` );
		}
	}

	queueSetEpReserve( globalId, value ) {
		this.log.info( `queueEpReserve( ${globalId} )` );
		const tagname = globalId.match( "^[^.]+[.][^.]+[.][^.]+[.][^.]+[.](.*)" )[1];
		this.clearFrame();
		const pos = this.startContainer( "TAG_EP_REQ_SET_EP_RESERVE" );
		const index = 0; // are there cases where index > 0 ?
		this.addTagtoFrame( "TAG_EP_PARAM_INDEX", "", index );
		this.addTagtoFrame( `TAG_EP_${tagname}`, "", value );
		this.pushFrame( pos );
	}

	queueSetIdlePeriod( globalId ) {
		this.log.info( `queueSetIdlePeriod( ${globalId} )` );
		const el = globalId.split( "." );
		if( el.length == 6 ) {
			const prefix = el.slice( 2,5 ).join( "." ); // e.g. "EMS.IDLE_PERIODS_CHARGE.00-Monday"
			const type = ( el[3].endsWith( "_CHARGE" ) ) ? 0 : 1;
			const day = Number( el[4].split( "-" )[0] );
			if( this.sendTupleTimeout[prefix] ) {
				clearTimeout( this.sendTupleTimeout[prefix] );
			}
			this.sendTupleTimeout[prefix] = setTimeout( () => {
				this.getState( `${prefix}.IDLE_PERIOD_ACTIVE`, ( err, active ) => {
					this.getState( `${prefix}.START_HOUR`, ( err, startHour ) => {
						this.getState( `${prefix}.START_MINUTE`, ( err, startMinute ) => {
							this.getState( `${prefix}.END_HOUR`, ( err, endHour ) => {
								this.getState( `${prefix}.END_MINUTE`, ( err, endMinute ) => {
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
									this.endContainer( c3 );
									const c4 = this.startContainer( "TAG_EMS_IDLE_PERIOD_END" );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_HOUR", "", endHour ? endHour.val : 0 );
									this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_MINUTE", "", endMinute ? endMinute.val : 0 );
									this.endContainer( c4 );
									this.endContainer( c2 );
									this.pushFrame( c1 );
									// SET_IDLE_PERIODS response does not contain new values, so we need to separately request them:
									this.clearFrame();
									this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS" );
									this.pushFrame();
								} );
							} );
						} );
					} );
				} );
			}, this.config.send_tuple_delay * 1000 );
		} else {
			this.log.warn( `queueSetIdlePeriod: invalid globalId ${globalId}` );
		}
	}

	queueSetIdlePeriods2() {
		this.log.info( `queueSetIdlePeriod2()` );
		const prefix = "EMS.IDLE_PERIODS_2";
		if( this.sendTupleTimeout[prefix] ) {
			clearTimeout( this.sendTupleTimeout[prefix] );
		}
		this.sendTupleTimeout[prefix] = setTimeout( () => {
			// RSCP requires to send a container with _all_ PERIODs every time something changes.
			this.getHighestSubnode( prefix, ( max ) => {
				this.log.debug( `queueSetIdlePeriods2: maxNode = ${max}` );
				this.clearFrame();
				const c1 = this.startContainer( "TAG_EMS_REQ_SET_IDLE_PERIODS_2" );
				let counter = max;
				for( let n = 0; n <= max; n++ ) {
					const node = `${prefix}.${n.toString().padStart( 2, "0" )}`;
					this.log.debug( `queueSetIdlePeriod2(): node ${node}` );
					this.getState( `${node}.PERIOD_ACTIVE`, ( err, active ) => {
						this.getState( `${node}.PERIOD_DESCRIPTION`, ( err, description ) => {
							this.getState( `${node}.PERIOD_WEEKDAYS`, ( err, weekdays ) => {
								this.getState( `${node}.PERIOD_START`, ( err, start ) => {
									this.getState( `${node}.PERIOD_STOP`, ( err, stop ) => {
										this.getState( `${node}.IDLE_PERIOD_TYPE`, ( err, type ) => {
											this.log.silly( `queueSetIdlePeriod2(): ${start ? start.val : "00:00:00"}-${stop ? stop.val : "00:00:00"} translates to ${helper.timeOfDayStringToSeconds( start ? start.val : "00:00:00" )}-${helper.timeOfDayStringToSeconds( stop ? stop.val : "00:00:00" )}` );
											const c2 = this.startContainer( "TAG_EMS_IDLE_PERIOD_2" );
											this.addTagtoFrame( "TAG_EMS_PERIOD_ACTIVE", "", active ? active.val : 0 );
											this.addTagtoFrame( "TAG_EMS_PERIOD_DESCRIPTION", "", description ? description.val : "" );
											this.addTagtoFrame( "TAG_EMS_PERIOD_WEEKDAYS", "", helper.weekdayStringToBitmask( weekdays ? weekdays.val : 0 ) );
											this.addTagtoFrame( "TAG_EMS_PERIOD_START", "", helper.timeOfDayStringToSeconds( start ? start.val : "00:00:00" ) );
											this.addTagtoFrame( "TAG_EMS_PERIOD_STOP", "", helper.timeOfDayStringToSeconds( stop ? stop.val : "00:00:00" ) );
											this.addTagtoFrame( "TAG_EMS_IDLE_PERIOD_TYPE", "", type ? type.val : 0 );
											this.endContainer( c2 );
											if( --counter < 0 ) { // async detect loop work finished
												this.pushFrame( c1 );
												this.clearFrame();
												this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS_2" );
												this.pushFrame();
												this.sendTupleTimeout[prefix] = null;
											}
										} );
									} );
								} );
							} );
						} );
					} );
				}
			} );
		}, this.config.send_tuple_delay * 1000 );
	}

	queueGetHistoryData( globalId ) {
		this.log.info( `queueGetHistoryData( ${globalId} )` );
		const el = globalId.split( "." );
		if( el.length == 5 ) { // e.g. "e3dc-rscp.0.DB.HISTORY_DATA_DAY.TIME_START"
			const nameSpace = el[2];
			const shortTag = el[3]; // e.g. "HISTORY_DATA_DAY"
			const prefix = `${nameSpace}.${shortTag}`;
			if( nameSpace == "DB" && shortTag.startsWith( "HISTORY_DATA_" ) ) {
				if( this.sendTupleTimeout[prefix] ) {
					clearTimeout( this.sendTupleTimeout[prefix] );
				}
				this.sendTupleTimeout[prefix] = setTimeout( () => {
					this.getState( `${nameSpace}.${shortTag}.TIME_START`, ( err, timeStart ) => {
						this.getState( `${nameSpace}.${shortTag}.TIME_INTERVAL`, ( err, interval ) => {
							this.getState( `${nameSpace}.${shortTag}.TIME_SPAN`, ( err, span ) => {
								this.sendTupleTimeout[prefix] = null;
								let d = new Date();
								if( timeStart && timeStart.val ) {
									d = helper.stringToDate( timeStart.val.toString() );
									this.setState( `${nameSpace}.${shortTag}.TIME_START`, helper.dateToString( d ), true ); // ack, and format time string
								}
								let i = 0;
								if( interval && interval.val ) {
									i = Number( interval.val );
									this.setState( `${nameSpace}.${shortTag}.TIME_INTERVAL`, interval.val, true ); // ack
								}
								let s = 0;
								if( span && span.val ) {
									s = Number( span.val );
									this.setState( `${nameSpace}.${shortTag}.TIME_SPAN`, span.val, true ); // ack
								}
								this.clearFrame();
								const pos = this.startContainer( `TAG_DB_REQ_${shortTag}` );
								this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_START", "", d.getTime() / 1000 );
								this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_INTERVAL", "", i );
								this.addTagtoFrame( "TAG_DB_REQ_HISTORY_TIME_SPAN", "", s );
								this.endContainer( pos );
								this.pushFrame();
								this.log.debug( `TAG_DB_REQ_${shortTag} - START=${d.getTime() / 1000} INTERVAL=${i} SPAN=${s}` );
							} );
						} );
					} );
				}, this.config.send_tuple_delay * 1000 );
			}
		} else {
			this.log.warn( `queueGetHistoryData: invalid globalId ${globalId}` );
		}
	}

	queueSysSystemReboot( reboot ) {
		if( reboot == 1 ) {
			this.clearFrame();
			this.addTagtoFrame( "TAG_SYS_REQ_SYSTEM_REBOOT" );
			this.pushFrame();
		}
	}

	queueSysRestartApplication( restart ) {
		if( restart ) {
			this.clearFrame();
			this.addTagtoFrame( "TAG_SYS_REQ_RESTART_APPLICATION" );
			this.pushFrame();
		}
	}

	requestAllData( sml ) {
		if ( this.config.query_ems ) {
			this.queueEmsRequestData( sml );
			this.queueDppRequestData( sml );
		}
		if ( this.config.query_pm ) this.queuePmRequestData( sml );
		if ( this.config.query_ep ) this.queueEpRequestData( sml );
		if ( this.config.query_bat ) this.queueBatRequestData( sml );
		if ( this.config.query_pvi ) this.queuePviRequestData( sml );
		if ( this.config.query_sys ) this.queueSysRequestData( sml );
		if ( this.config.query_info ) this.queueInfoRequestData( sml );
		this.log.silly( `maxIndex["WB"] = ${this.maxIndex["WB"]}` );
		if ( this.config.query_wb ) wb.queueWbRequestData( sml );
		this.sendFrameFIFO();
	}

	sendFrameFIFO() {
		if ( this && this.queue.length > 0 ) {
			const f = this.queue.shift();
			if ( f ) {
				this.sendFrame( f );
			} else {
				this.log.silly( "Message queue is empty" );
			}
		}
	}

	sendFrameLIFO() {
		if ( this && this.queue.length > 0 ) {
			const f = this.queue.pop();
			if ( f ) {
				this.sendFrame( f );
			} else {
				this.log.silly( "Message queue is empty" );
			}
		}
	}

	sendFrame( f ) {
		if( f ) {
			if( rscpTag[f.readUInt32LE( 18 )] ) {
				this.log.debug( `Sending request ${rscpTag[f.readUInt32LE( 18 )].TagNameGlobal}` );
			} else {
				this.log.warn( `sendFrame called with invalid content: first tag is ${f.readUInt32LE( 18 )}` );
			}
			this.log.silly( `OUT: ${printRscpFrame( f )}` );
			// this.log.silly( dumpRscpFrame(f) );

			const encryptedFrame = Buffer.from( this.cipher.encrypt( f, 256, this.encryptionIV ) );
			// last encrypted block will be used as IV for next frame
			if ( this.encryptionIV ) encryptedFrame.copy( this.encryptionIV, 0, encryptedFrame.length - BLOCK_SIZE );

			if ( this.tcpConnection && this.tcpConnection.write( encryptedFrame ) ) {
				this.log.silly( `Successfully written data to socket` );
			} else {
				this.log.error( `Failed writing data to socket` );
				this.initChannel();
			}
		}
	}

	// Parse flat TLV into tree with (tag, type, content) nodes.
	// For container: include content by recursive descent.
	// Note that type is not always the same as specified in official tag list:
	// e.g. TAG_BAT_DATA (usually a container) may carry just an Error value.
	parseTlv( buffer, start, end ) {
		const tree = [];
		while( start < end ) {
			const tagCode = buffer.readUInt32LE( start );
			const typeCode = buffer.readUInt8( start+4 );
			const len = buffer.readUInt16LE( start+5 );
			const typeName = rscpType[typeCode];
			if( !rscpTag[tagCode] ) {
				this.log.debug( `Unknown tag: tagCode=0x${tagCode.toString( 16 )}, len=${len}, typeCode=0x${typeCode.toString( 16 )}` );
			} else if( typeName == "Container" ) {
				tree.push( { "tag": tagCode, "type": typeCode, "content": this.parseTlv( buffer, start+7, start+7+len ) } );
			} else {
				let value = null;
				switch ( typeName ) {
					case "CString":
						value = buffer.slice( start + 7, start + 7 + len ).toString();
						break;
					case "BitField":
					case "ByteArray":
						value = helper.bufferToString( buffer.slice( start + 7, start + 7 + len ) );
						break;
					case "Char8":
						value = buffer.readInt8( start + 7 );
						break;
					case "UChar8":
						value = buffer.readUInt8( start + 7 );
						break;
					case "Bool":
						value = ( buffer.readUInt8( start + 7 ) != 0 );
						break;
					case "Int16":
						value = buffer.readInt16LE( start + 7 );
						break;
					case "UInt16":
						value = buffer.readUInt16LE( start + 7 );
						break;
					case "Int32":
						value = buffer.readInt32LE( start + 7 );
						break;
					case "UInt32":
						value = buffer.readUInt32LE( start + 7 );
						break;
					case "Int64":
						value = buffer.readBigInt64LE( start + 7 ).toString(); // setState does not accept BigInt, so use string representation
						break;
					case "UInt64":
						value = buffer.readBigUInt64LE( start + 7 ).toString(); // setState does not accept BigInt, so use string representation
						break;
					case "Double64":
						value = helper.roundForReadability( buffer.readDoubleLE( start + 7 ) );
						break;
					case "Float32":
						value = helper.roundForReadability( buffer.readFloatLE( start + 7 ) );
						break;
					case "Timestamp":
						//value = Math.round( Number( buffer.readBigUInt64LE( start + 7 ) ) / 1000 ); // setState does not accept BigInt, so convert to seconds
						value = helper.dateToString( new Date( ( Number( buffer.readBigUInt64LE( start+7 ) ) + buffer.readUInt32LE( start+7+8 ) / 1000000 ) * 1000 ) );
						break;
					case "Error":
						value = buffer.readUInt32LE( start + 7 );
						break;
					case "None":
						if ( len > 0 ) this.log.warn( `Received data type NONE with data length = ${len} - tagCode 0x${tagCode.toString( 16 )}` );
						break;
					default:
						this.log.warn( `Unable to parse data: ${dumpRscpFrame( buffer.slice( start, start + 7 + len ) )}` );
						value = null;
				}
				tree.push( { "tag": tagCode, "type": typeCode, "content": value } );
			}
			start += 7 + len;
		}
		return tree;
	}

	// Process one complete frame received from E3/DC:
	processFrame( buffer ) {
		const magic = buffer.toString( "hex",0,2 ).toUpperCase();
		if( magic != "E3DC" ) {
			this.log.debug( `Received message with invalid MAGIC: >${magic}<` );
		}
		const ctrl = buffer.toString( "hex",2,4 ).toUpperCase();
		let hasCrc = false;
		switch ( ctrl ) {
			case "0010":
				hasCrc = false;
				break;
			case "0011":
				hasCrc = true;
				break;
			default:
				this.log.debug( `Received message with invalid CTRL: >${ctrl}<` );
		}
		const dataLength = buffer.readUInt16LE( 16 );
		if( buffer.length < 18 + dataLength + ( hasCrc ? 4 : 0 ) ) {
			this.log.debug( `Received message with inconsistent length: ${buffer.length} vs ${18 + dataLength + ( hasCrc ? 4 : 0 )}` );
			this.log.debug( `IN: ${printRscpFrame( buffer )}` );
			this.log.silly( dumpRscpFrame( buffer ) );
		} else {
			if( hasCrc && ( CRC32.buf( buffer.slice( 0,18+dataLength ) ) != buffer.readInt32LE( 18+dataLength ) )  ) {
				this.log.debug( `Received message with invalid CRC-32: 0x${CRC32.buf( buffer.slice( 0,18+dataLength ) ).toString( 16 )} vs 0x${buffer.readUInt32LE( 18+dataLength ).toString( 16 )} - dataLength = ${dataLength}` );
				this.log.silly( dumpRscpFrame( buffer ) );
			} else {
				this.processTree( this.parseTlv( buffer, 18, 18 + dataLength ), "" );
			}
		}
	}

	// Process a (sub)tree of TLV data:
	processTree( tree, path ) {
		this.log.silly( `processTree: path = ${path}, tree = ${printTree( tree )}` );
		if( !tree ) return;
		let pathNew = path;
		const multipleValueIndex = {};
		let currentIndex;
		for ( const i in tree ) {
			const token = tree[i];
			const tag = token.tag;
			const tagName = rscpTag[tag].TagName;
			let tagNameNew = tagName;
			const nameSpace = rscpTag[tag].NameSpace;
			const shortId = `${nameSpace}.${tagName}`;
			const typeName = rscpType[token.type];
			if ( typeName == "Error" ) {
				if ( shortId == "EMS.SYS_SPEC_VALUE_INT" ) {
					// Gently skip SYS_SPEC error values, just set to zero
					this.storeValue( nameSpace, pathNew, tagName, "Int32", 0 );
					continue;
				}
				if ( shortId == "BAT.DATA" && rscpError[token.content] == "RSCP_ERR_NOT_AVAILABLE" ) {
					// This is an error response due to out-of-range BAT index, heuristically cut off the biggest one:
					--this.maxIndex["BAT"];
					this.log.info( `Decreased BAT max. index to ${this.maxIndex["BAT"]}` );
					continue;
				}
				if ( ["PM.DEVICE_STATE","PM.REQ_DEVICE_STATE"].includes( shortId ) && ["RSCP_ERR_NOT_AVAILABLE","RSCP_ERR_OUT_OF_BOUNDS"].includes( rscpError[token.content] ) ) {
					// This is an error response due to out-of-range PM index, pinch it out:
					this.indexSet["PM"] = this.indexSet["PM"].filter( number => number !== currentIndex );
					this.log.info( `Adjusted PM index set to [${this.indexSet["PM"]}]` );
					break; // skip subsequent fields as they will all have type error
				}
				if ( stopPollingIds.includes( shortId ) && rscpError[token.content] == "RSCP_ERR_NOT_AVAILABLE" ) {
					this.pollingInterval[tag] = "N";
					this.log.info( `Device reports that ${shortId} is not available - setting polling interval to 'N'` );
					continue;
				}
				if( ! ignoreIds.includes( shortId ) ) {
					this.log.warn( `Received data type ERROR: ${rscpError[token.content]} (${token.content}) - tag ${rscpTag[token.tag].TagNameGlobal} (0x${token.tag.toString( 16 )})` );
					continue;
				}
			}
			if ( typeName == "Container" ) {
				if ( shortId == "EMS.SYS_SPEC" && token.content.length == 3 ) {
					this.storeValue( nameSpace, pathNew + "SYS_SPECS.", token.content[1].content, "Int32", token.content[2].content, token.content[1].content, sysSpecUnits[token.content[1].content] );
					this.extendObject( `EMS.SYS_SPECS`, { type: "channel", common: { role: "info" } } );
				} else if ( shortId == "PVI.DATA" && token.content.length == 2 && rscpType[token.content[1].type] == "Error" && rscpError[token.content[1].content] == "RSCP_ERR_FORMAT" ) {
					// This is an error response due to out-of-range PVI index
					if( token.content[0].content - 1 < this.maxIndex["PVI"] ) {
						this.maxIndex["PVI"] = token.content[0].content - 1;
						this.log.info( `Decreased PVI max. index to ${token.content[0].content - 1}` );
					}
				} else if ( shortId == "INFO.MODULE_SW_VERSION" && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew + "MODULE_SW_VERSION.", token.content[0].content, "CString", token.content[1].content, token.content[0].content );
					this.extendObject( `INFO.MODULE_SW_VERSION`, { type: "channel", common: { role: "info" } } );
				} else if ( shortId.includes( "WB.EXTERN_DATA_" ) && token.content.length == 2 ) {
					wb.storeWbExternData( shortId, token.content, pathNew );
				} else if ( shortId == "EMS.GET_IDLE_PERIODS" ) {
					this.storeIdlePeriods( token.content, pathNew );
				} else if ( shortId == "EMS.GET_IDLE_PERIODS_2" ) {
					this.storeIdlePeriods2( token.content, pathNew );
				} else if ( shortId.startsWith( "DB.HISTORY_DATA_" ) ) {
					this.storeHistoryData( token.content, pathNew + `${tagName}.` );
				} else if ( ignoreIndexIds.includes( shortId ) && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew, tagName, rscpType[token.content[1].type], token.content[1].content );
				} else if ( phaseIds.includes( shortId ) && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew + `Phase_${token.content[0].content}.`, tagName, rscpType[token.content[1].type], token.content[1].content );
					this.extendObject( `${nameSpace}.${pathNew}Phase_${token.content[0].content}`, { type: "channel", common: { role: "sensor.electricity" } } );
				} else if ( stringIds.includes( shortId ) && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew + `String_${token.content[0].content}.`, tagName, rscpType[token.content[1].type], token.content[1].content );
					this.extendObject( `${nameSpace}.${pathNew}String_${token.content[0].content}`, { type: "channel", common: { role: "sensor.electricity" } } );
				} else if ( shortId == "PVI.TEMPERATURE" && token.content.length == 2 ) {
					this.storeValue( nameSpace, pathNew + "TEMPERATURE.", token.content[0].content.toString().padStart( 2, "0" ), rscpType[token.content[1].type], token.content[1].content, "TEMPERATURE", "°C" );
					this.extendObject( `${nameSpace}.${pathNew}TEMPERATURE`, { type: "channel", common: { role: "sensor.temperature" } } );
				} else {
					this.processTree( token.content, pathNew );
				}
			} else {
				// Some tags we just skip, e.g. EMS_SYS_SPEC_INDEX
				if( ignoreIds.includes( shortId ) ) continue;

				// Handle multiple values for same tag within one container, e.g. PVI_RELEASE
				if ( multipleValueIds.includes( shortId ) ) {
					if( ! multipleValueIndex[shortId] ) multipleValueIndex[shortId] = 0;
					this.log.silly( `storeValue( ${nameSpace}, ${pathNew + tagName + "."}, ${multipleValueIndex[shortId].toString().padStart( 2,"0" )}, ${rscpType[token.type]}, ${token.content}, ${tagName} )` );
					let dictionaryIndex = tagName;
					let unit = "";
					if ( tagName == "DCB_CELL_TEMPERATURE" ) {
						if ( token.content > 4.5 ) {
							unit = "°C";
						} else { // low values are regarded as voltage (seems to be a flaw in RSCP interface)
							unit = "V";
							dictionaryIndex = "DCB_CELL_VOLTAGE";
						}
					} else if ( tagName == "DCB_CELL_VOLTAGE" ) {
						unit = "V";
					}
					// eslint-disable-next-line prefer-const
					let [t, v] = this.adjustTypeAndValue( shortId, rscpType[token.type], token.content );
					if( tagName == "DCB_CELL_TEMPERATURE" && v == 0 ) v = null; // 0 means "no value", so dispaly as "(null)", not "0 °C"
					this.storeValue( nameSpace, pathNew + tagName + ".", multipleValueIndex[shortId].toString().padStart( 2,"0" ), t, v, dictionaryIndex, unit );
					let r = "info";
					if( tagName.includes( "TEMPERATURE" ) ) r = "sensor.temperature"; else if( tagName.includes( "VOLTAGE" ) ) r = "sensor.electricity";
					this.extendObject( `${nameSpace}.${pathNew.slice( 0,-1 )}.${tagName}`, { type: "channel", common: { role: r } } );
					multipleValueIndex[shortId]++;
					continue;
				}

				// Handle index values named INDEX or COUNT
				if( !notIndexIds.includes( shortId ) ) {
					// INDEX indicates top level device, e.g. TAG_BAT_INDEX
					if( tagName == "INDEX" ) {
						currentIndex = token.content;
						if( tree.length <= Number( i )+1 || rscpType[tree[Number( i )+1].type] != "Error" ) {
							if( nameSpace != "PM" && currentIndex > this.maxIndex[nameSpace] ) { // PM has an index _set_ and is handled separately
								this.maxIndex[nameSpace] = currentIndex;
								this.log.info( `Increased ${nameSpace} max. index to ${currentIndex}` );
							}
							pathNew = `${nameSpace}_${currentIndex}.`;
							this.extendObject( `${nameSpace}.${pathNew.slice( 0,-1 )}`, { type: "channel", common: { role: "info.module" } } );
						}
						continue;
					}
					// ..._INDEX indicates sub-device, e.g. TAG_BAT_DCB_INDEX
					if( tagName.endsWith( "_INDEX" ) ) {
						const name = tagName.replace( "_INDEX","" );
						const key = path ? `${path}${name}` : name ;
						if( !this.maxIndex[key] || token.content > this.maxIndex[key] ) {
							this.maxIndex[key] = token.content;
							this.log.debug( `Increased ${key} max. index to ${token.content}` );
						}
						pathNew = path ? `${pathNew.split( "." ).slice( 0,-1 ).join( "." )}.${name}_${token.content}.` : `${name}_${token.content}.`;
						this.extendObject( `${nameSpace}.${pathNew.slice( 0,-1 )}`, { type: "channel", common: { role: "info.submodule" } } );
						continue;
					}
					// ..._COUNT explicitely sets upper bound for (sub-)device index
					if( tagName.endsWith( "_COUNT" ) ) {
						if( this.maxIndex[`${pathNew}${tagName.replace( "_COUNT","" )}`] != ( token.content - 1 ) ) {
							this.maxIndex[`${pathNew}${tagName.replace( "_COUNT","" )}`] = token.content - 1;
							this.log.debug( `Adjusted ${pathNew}${tagName.replace( "_COUNT","" )} max. index to ${token.content - 1}` );
						}
					}
				}
				// Translate bit-mapped EMS.STATUS to single-bit values
				if( shortId == "EMS.STATUS" ) {
					for( let bit = 0; bit < 10; bit++ ) {
						this.storeValue( nameSpace, pathNew, `STATUS_${bit}`, "Bool", ( token.content & ( 2**bit ) ) != 0, `EMS_STATUS_${bit}` );
					}
					continue;
				}
				// Translate bit-mapped EMS.DPP_MONTHS_ACTIVE to string
				if( shortId == "EMS.DPP_MONTHS_ACTIVE" ) {
					this.storeValue( nameSpace, pathNew, "DPP_MONTHS_ACTIVE", "CString", helper.bitmaskToMonthString( token.content ), "DPP_MONTHS_ACTIVE" );
					continue;
				}
				// Use SET_EMERGENCY_POWER response "true" to acknowledge state EMS.EMERGENCY_POWER
				if( shortId == "EMS.SET_EMERGENCY_POWER" && token.content ) {
					this.getState( "EMS.EMERGENCY_POWER", ( err, obj ) => {
						this.setState( "EMS.EMERGENCY_POWER", obj ? obj.val : 0, true );
					} );
					continue;
				}
				// Use START_EMERGENCY_POWER_TEST response >0 to reset state EMS.START_EMERGENCY_POWER_TEST
				// (the numerical return value is discarded, but EP_TEST_START_COUNTER has the same semantics)
				if( shortId == "EMS.START_EMERGENCY_POWER_TEST" && token.content > 0 ) {
					this.getState( "EMS.START_EMERGENCY_POWER_TEST", ( err, obj ) => {
						this.setState( "EMS.EMERGENCY_POWER", false, true );
					} );
					continue;
				}
				// Use SET_OVERRIDE_AVAILABLE_POWER response "true" to acknowledge state EMS.OVERRIDE_AVAILABLE_POWER
				if( shortId == "EMS.SET_OVERRIDE_AVAILABLE_POWER" && token.content ) {
					this.getState( "EMS.OVERRIDE_AVAILABLE_POWER", ( err, obj ) => {
						this.setState( "EMS.OVERRIDE_AVAILABLE_POWER", obj ? obj.val : 0, true );
					} );
					continue;
				}
				// Use START_MANUAL_CHARGE response to acknowledge state EMS.MANUAL_CHARGE_ENERGY
				if( shortId == "EMS.START_MANUAL_CHARGE" ) {
					this.getState( "EMS.MANUAL_CHARGE_ENERGY", ( err, obj ) => {
						this.setState( "EMS.MANUAL_CHARGE_ENERGY", obj ? obj.val : 0, true );
					} );
					continue;
				}
				// On EMS.MANUAL_CHARGE_ACTIVE == false, reset state EMS.MANUAL_CHARGE_ENERGY = 0
				if( shortId == "EMS.MANUAL_CHARGE_ACTIVE" ) {
					if( !token.content ) {
						this.setState( "EMS.MANUAL_CHARGE_ENERGY", 0, true );
					}
				}
				// Handle mapping between "receive" tag names and "set" tag names:
				let targetStateMatch = null;
				if( mapReceivedIdToState[shortId] ) {
					if( mapReceivedIdToState[shortId]["*"] ) targetStateMatch = "*";
					if( mapReceivedIdToState[shortId][typeName] ) targetStateMatch = typeName;
					if( targetStateMatch && mapReceivedIdToState[shortId][targetStateMatch].targetState == "RETURN_CODE" && token.content < 0 ) {
						this.log.warn( `SET failed: ${shortId} = ${token.content}` );
					}
				}
				if( targetStateMatch ) tagNameNew = mapReceivedIdToState[shortId][targetStateMatch].split( "." )[1];

				const [t, v] = this.adjustTypeAndValue( shortId, typeName, token.content );
				this.storeValue( nameSpace, pathNew, tagNameNew, t, v );
			}
		}
	}

	// Apply value and/or type corrections due to E3/DC inconsistencies:
	adjustTypeAndValue( shortId, typeName, value ) {
		let newValue = value;
		let newTypeName = typeName;
		if( negateValueIds.includes( shortId ) ) newValue = -newValue;
		if( percentValueIds.includes( shortId ) ) newValue = newValue * 100;
		if( castToBooleanIds.includes( shortId ) && ( typeName == "Char8" || typeName == "UChar8" ) ) {
			newValue = ( newValue!=0 );
			newTypeName = "Bool";
		}
		if( castToTimestampIds.includes( shortId ) ) {
			newValue = helper.dateToString( new Date( Number( newValue ) ) );
			newTypeName = "Timestamp";
		}
		// if( typeName != newTypeName || value != newValue ) this.log.silly(`adjustTypeAndValue(${shortId},${typeName},${value}}) returns [${newTypeName},${newValue}]`);
		return [newTypeName, newValue];
	}

	storeValue( nameSpace, path, tagName, typeName, value, dictionaryIndex, unit = "" ) {
		if ( !dictionaryIndex ) dictionaryIndex = tagName;
		const oId = `${nameSpace}.${path}${tagName}`;
		const oKey = `${nameSpace}.${tagName}`;
		const oWrite = ( getSetTags( oId ) !== null );
		let oRole = "";
		if ( typeName == "Bool" ) {
			oRole = oWrite ? "switch" : "indicator";
		} else {
			oRole = oWrite ? "level" : "value";
		}
		let oUnit = unit;
		if ( oUnit == "" && rscpTag[rscpTagCode[`TAG_${nameSpace}_${tagName}`]] ) {
			oUnit = rscpTag[rscpTagCode[`TAG_${nameSpace}_${tagName}`]].Unit;
		}
		let oName = dictionaryIndex;
		if( systemDictionary[dictionaryIndex] && this.language !== undefined ) {
			oName = systemDictionary[dictionaryIndex][this.language];
		}
		// const oName = systemDictionary[dictionaryIndex] ? systemDictionary[dictionaryIndex][this.language] : dictionaryIndex;
		this.setObjectNotExists( oId, {
			type: "state",
			common: {
				name: oName,
				type: rscpTypeMap[typeName],
				role: oRole,
				read: true,
				write: oWrite,
				states: ( mapIdToCommonStates[oKey] ? mapIdToCommonStates[oKey] : null ),
				unit: oUnit,
			},
			native: {},
		}, () => {
			this.getState( oId, ( err,obj ) => {
				if( !( obj && obj.ack && obj.val == value && this.config.lazy_setstate ) ) {
					this.setState( oId, value, true );
				}
			} );
		} );
	}

	storeIdlePeriods( tree, path ) {
		if( this.config.periods_v1 ) {
			tree.forEach( token => {
				if( rscpTag[token.tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD" || token.content.length != 5 ) return;
				if( rscpTag[token.content[0].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_TYPE" ) return;
				const type = token.content[0].content;
				if ( rscpTag[token.content[1].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_DAY" ) return;
				const day = token.content[1].content;
				const idleNode = ( type==0 ) ? "IDLE_PERIODS_CHARGE" : "IDLE_PERIODS_DISCHARGE";
				const dayNode = `${day.toString().padStart( 2, "0" )}-${dayOfWeek[day]}`;
				const newPath = `${path}${idleNode}.${dayNode}.`;
				if ( !this.sendTupleTimeout[`EMS.${idleNode}.${dayNode}`] ) { // do not overwrite manual changes which are waiting to be sent
					if ( rscpTag[token.content[2].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_ACTIVE" ) return;
					const active = token.content[2].content;
					if( rscpTag[token.content[3].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_START" || token.content[3].content.length != 2 )  return;
					if( rscpTag[token.content[3].content[0].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_HOUR" ) return;
					const startHour = token.content[3].content[0].content;
					if ( rscpTag[token.content[3].content[1].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_MINUTE" ) return;
					const startMinute = token.content[3].content[1].content;
					if( rscpTag[token.content[4].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_END" || token.content[4].content.length != 2 )  return;
					if( rscpTag[token.content[4].content[0].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_HOUR" ) return;
					const endHour = token.content[4].content[0].content;
					if ( rscpTag[token.content[4].content[1].tag].TagNameGlobal != "TAG_EMS_IDLE_PERIOD_MINUTE" ) return;
					const endMinute = token.content[4].content[1].content;
					this.storeValue( "EMS", newPath, "IDLE_PERIOD_ACTIVE", "Bool", ( active != 0 ) );
					this.storeValue( "EMS", newPath, "START_HOUR", "UChar8", startHour, "START_HOUR", "h" );
					this.storeValue( "EMS", newPath, "START_MINUTE", "UChar8", startMinute, "START_MINUTE", "m" );
					this.storeValue( "EMS", newPath, "END_HOUR", "UChar8", endHour, "END_HOUR", "h" );
					this.storeValue( "EMS", newPath, "END_MINUTE", "UChar8", endMinute, "END_MINUTE", "m" );
					this.extendObject( `EMS.${newPath.slice( 0, -1 )}`, { type: "channel", common: { role: "calendar.day" } } );
				}
			} );
			this.extendObject( "EMS.IDLE_PERIODS_CHARGE", { type: "channel", common: { role: "calendar.week" } } );
			this.extendObject( "EMS.IDLE_PERIODS_DISCHARGE", { type: "channel", common: { role: "calendar.week" } } );
		}
	}

	storeIdlePeriods2( tree, path ) {
		// Sometimes we receive an empty GET_IDLE_PERIODS_2 container. Don't know why. Ignore it.
		if( tree.length > 0 && this.config.periods_v2 ) {
			const prefix = "EMS.IDLE_PERIODS_2";
			if ( !this.sendTupleTimeout[prefix] ) { // do not overwrite manual changes which are waiting to be sent
				let i = 0;
				tree.forEach( token => {
					if( rscpTag[token.tag].TagNameGlobal == "TAG_EMS_IDLE_PERIOD_2" ) {
						const idleNode = `IDLE_PERIODS_2.${String( i ).padStart( 2, "0" )}`;
						const newPath = `${path}${idleNode}.`;
						let active = 0;
						let type = 0;
						let start = 0;
						let stop = 0;
						let weekdays = 0;
						let desc = "";
						token.content.forEach( member => {
							switch( rscpTag[member.tag].TagNameGlobal ) {
								case "TAG_EMS_PERIOD_ACTIVE": active = member.content; break;
								case "TAG_EMS_PERIOD_DESCRIPTION": desc = member.content; break;
								case "TAG_EMS_PERIOD_WEEKDAYS": weekdays = member.content; break;
								case "TAG_EMS_PERIOD_START": start = member.content; break;
								case "TAG_EMS_PERIOD_STOP": stop = member.content; break;
								case "TAG_EMS_IDLE_PERIOD_TYPE": type = member.content; break;
								default: this.log.debug( `storeIdlePeriods2: got unexpected tag ${rscpTag[member.tag].TagNameGlobal}` );
							}
						} );
						this.storeValue( "EMS", newPath, "PERIOD_ACTIVE", "Bool", ( active != 0 ), "PERIOD_ACTIVE" );
						this.storeValue( "EMS", newPath, "PERIOD_DESCRIPTION", "CString", desc, "PERIOD_DESCRIPTION" );
						this.storeValue( "EMS", newPath, "PERIOD_WEEKDAYS", "CString", helper.bitmaskToWeekdayString( weekdays ), "PERIOD_WEEKDAYS" );
						this.storeValue( "EMS", newPath, "PERIOD_START", "CString", helper.secondsToTimeOfDayString( start ), "PERIOD_START" );
						this.storeValue( "EMS", newPath, "PERIOD_STOP", "CString", helper.secondsToTimeOfDayString( stop ), "PERIOD_STOP" );
						this.storeValue( "EMS", newPath, "IDLE_PERIOD_TYPE", "UChar8", type, "TYPE" );
						this.extendObject( `EMS.${newPath.slice( 0, -1 )}`, { type: "channel", common: { role: "calendar.day" } } );
						i++;
					}
				} );
				this.extendObject( prefix, { type: "channel", common: { role: "calendar.week" } } );
				this.maxIndex[prefix] = i - 1;
				this.log.silly( `storeIdlePeriods2: new max is ${i}; will delete higher indexes.` );
				// delete remaining periods (may happen when periods were deleted e.g. using the E3/DC portal)
				this.getHighestSubnode( prefix, ( max ) => {
					for( i; i <= max; i++ ) {
						const id = `${prefix}.${String( i ).padStart( 2, "0" )}`;
						this.deleteObjectRecursively( id );
					}
				} );
			}
			if( this.config.periods_v1 ) {
				// Delete & reload idle periods V1 objects, to get rid of "zombie objects"
				this.deleteObjectRecursively( "e3dc-rscp.0.EMS.IDLE_PERIODS_CHARGE" );
				this.deleteObjectRecursively( "e3dc-rscp.0.EMS.IDLE_PERIODS_DISCHARGE" );
				this.clearFrame();
				this.addTagtoFrame( "TAG_EMS_REQ_GET_IDLE_PERIODS" );
				this.pushFrame();
			}
		}
	}

	storeHistoryData( tree, path ) {
		this.getState( `DB.${path}TIME_START`, ( err, timeStartObj ) => {
			this.getState( `DB.${path}TIME_INTERVAL`, ( err, intervalObj ) => {
				this.getState( `DB.${path}TIME_SPAN`, ( err, spanObj ) => {
					let timeStart = 0;
					if( timeStartObj && timeStartObj.val ) { timeStart = helper.stringToDate( timeStartObj.val.toString() ).getTime()/1000; } // epoch seconds
					let interval = 0;
					if( intervalObj && intervalObj.val ) { interval = Number( intervalObj.val ); }
					let span = 0;
					if( spanObj && spanObj.val ) { span = Number( spanObj.val ); }
					let count = 0;
					let oPath = "";
					let oRole = "";
					const scale = path.match( /HISTORY_DATA_([A-Z]+)[.]/ )[1].toLowerCase();
					tree.forEach( token => {
						if ( rscpTag[token.tag].TagNameGlobal == "TAG_DB_SUM_CONTAINER" ) {
							oPath = `${path}SUM.`;
							oRole = `calendar.${scale}`;
						} else if( rscpTag[token.tag].TagNameGlobal == "TAG_DB_VALUE_CONTAINER" ) {
							oPath = `${path}VALUE_${count.toString().padStart( 2,"0" )}.`;
							oRole = `calendar.split.${scale}`;
							count++;
							const graphIndex = Number( token.content[0].content );
							const timeStamp = new Date( ( timeStart + graphIndex * interval ) * 1000 );
							this.storeValue( "DB", oPath, "TIMESTAMP", "CString", helper.dateToString( timeStamp ), "TIMESTAMP" );
						} else {
							this.log.debug( `storeHistoryData: ignoring unexpected tag ${rscpTag[token.tag].TagNameGlobal}` );
							return; // next token
						}
						token.content.forEach( t => {
							this.storeValue( "DB", oPath, rscpTag[t.tag].TagName, rscpType[t.type], t.content, rscpTag[t.tag].TagName );
						} );
						this.extendObject( `DB.${oPath.slice( 0, -1 )}`, { type: "channel", common: { role: `${oRole}` } } );
					} );
					this.deleteValueObjects( count, path );
				} );
			} );
		} );
	}

	// Delete VALUE_x object branches for a certain x, x+1, ...
	deleteValueObjects( count, path ) {
		if( this.common !== undefined ) {
			const id = `${this.common.name}.${this.instance}.DB.${path}VALUE_${count.toString().padStart( 2,"0" )}`;
			//this.log.silly(`deleteValueObjects: count=${count}, id=${id}`);
			this.getForeignObject( id, ( err, obj ) => {
				if( obj ) {
					//this.log.silly(`deleteValueObjects: found object with id=${id}`);
					this.delObject( id, { recursive:true } );
					this.deleteValueObjects( count+1, path );
				}
			} );
		}
	}

	clearAllIntervals() {
		if( this.dataPollingTimerS ) clearInterval( this.dataPollingTimerS );
		if( this.dataPollingTimerM ) clearInterval( this.dataPollingTimerM );
		if( this.dataPollingTimerL ) clearInterval( this.dataPollingTimerL );
		if( this.setPowerTimer ) clearInterval( this.setPowerTimer );
		// @ts-ignore
		if( this.checkAuthTimeout ) clearInterval( this.checkAuthTimeout );
		for( const [key, timeout] of Object.entries( this.sendTupleTimeout ) ) {
			if( timeout ) this.clearInterval( timeout );
		}
		for( const timeout of this.probingTimeout ) {
			if( timeout ) this.clearInterval( timeout ) ;
		}
		if( this.reconnectTimeout ) clearInterval( this.reconnectTimeout );
	}

	deleteObjectRecursively( id ) {
		this.delObject( id, { recursive: true }, ( err ) => {
			if( err ) {
				this.log.warn( `deleteObjectRecursively(): cannot delete ${id}: ${err}` );
			}
		} );
	}

	// Given node <id> has subnodes "00", "01", "02", ... - return highest number
	getHighestSubnode( id, callback ) {
		this.getStates( id + ".*", ( err, states ) => {
			if ( err || !states ) {
				callback( null );
				return;
			}
			let max = -1;
			Object.keys( states ).forEach( id => {
				const match = id.match( /\.(\d+)\.[A-Z_]+$/ );
				if ( match ) {
					max = Math.max( max, parseInt( match[1], 10 ) );
				}
			} );
			callback( max >= 0 ? max : null );
		} );
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Statically, we define only one device per supported RSCP namespace,
		// plus some setter objects which would not appear before first setting.
		// The rest of the object tree is defined dynamically.
		//
		this.language = "en";
		this.getForeignObject( "system.config", ( err, systemConfig ) => {
			if( systemConfig ) this.language = systemConfig.common.language;
		} );
		try {
			eval( fs.readFileSync( path.join( __dirname, "/admin/words.js" ) ).toString() );
		} catch( e ) {
			// For exit codes see https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/src/lib/common/exitCodes.ts
			this.terminate( "Error while reading systemDictionary: " + e, 29 );
		}
		// For some objects, we use setObjectNotExists instead of setObjectNotExistsAsync
		// to avoid "has no existing objects" warning in the adapter log
		//
		await this.setObjectNotExistsAsync( "info", {
			type: "channel",
			common: {
				name: systemDictionary["Information"][this.language],
				role: "info.adapter",
			},
			native: {},
		} );
		await this.setObjectNotExistsAsync( "info.connection", {
			type: "state",
			common: {
				name: systemDictionary["Connected"][this.language],
				type: "boolean",
				role: "indicator",
				read: true,
				write: false,
			},
			native: {},
		} );
		await this.setObjectNotExistsAsync( "RSCP", {
			type: "device",
			common: {
				name: systemDictionary["RSCP"][this.language],
				role: "communication.protocol",
			},
			native: {},
		} );
		await this.setObjectNotExists( "RSCP.AUTHENTICATION", {
			type: "state",
			common: {
				name: systemDictionary["AUTHENTICATION"][this.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: rscpTag[rscpTagCode["TAG_RSCP_AUTHENTICATION"]].Unit,
			},
			native: {},
		} );
		if( this.config.query_info ) {
			await this.setObjectNotExistsAsync( "INFO", {
				type: "device",
				common: {
					name: systemDictionary["INFO"][this.language],
					role: "device.information",
				},
				native: {},
			} );
		}
		if( this.config.query_bat ) {
			await this.setObjectNotExistsAsync( "BAT", {
				type: "device",
				common: {
					name: systemDictionary["BAT"][this.language],
					role: "battery.storage",
				},
				native: {},
			} );
		}
		if( this.config.query_pvi ) {
			await this.setObjectNotExistsAsync( "PVI", {
				type: "device",
				common: {
					name: systemDictionary["PVI"][this.language],
					role: "photovoltaic.inverter",
				},
				native: {},
			} );
		}
		if( this.config.query_ep ) {
			await this.setObjectNotExistsAsync( "EP", {
				type: "device",
				common: {
					name: systemDictionary["EP"][this.language],
					role: "emergency.power",
				},
				native: {},
			} );
		}
		if( this.config.query_pm ) {
			await this.setObjectNotExistsAsync( "PM", {
				type: "device",
				common: {
					name: systemDictionary["PM"][this.language],
					role: "power.meter",
				},
				native: {},
			} );
		}
		if( this.config.query_ems ) {
			await this.setObjectNotExistsAsync( "EMS", {
				type: "device",
				common: {
					name: systemDictionary["EMS"][this.language],
					role: "energy.management",
				},
				native: {},
			} );
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
			} );
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
			} );
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
			} );
			await this.setObjectNotExistsAsync( "EMS.MANUAL_CHARGE_ENERGY", {
				type: "state",
				common: {
					name: systemDictionary["MANUAL_CHARGE_ENERGY"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_REQ_START_MANUAL_CHARGE"]].Unit,
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.BATTERY_BEFORE_CAR_MODE", {
				type: "state",
				common: {
					name: systemDictionary["BATTERY_BEFORE_CAR_MODE"][this.language],
					type: "boolean",
					role: "switch",
					read: false,
					write: true
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.BATTERY_TO_CAR_MODE", {
				type: "state",
				common: {
					name: systemDictionary["BATTERY_TO_CAR_MODE"][this.language],
					type: "boolean",
					role: "switch",
					read: false,
					write: true
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.WB_DISCHARGE_BAT_UNTIL", {
				type: "state",
				common: {
					name: systemDictionary["WB_DISCHARGE_BAT_UNTIL"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_WB_DISCHARGE_BAT_UNTIL"]].Unit,
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.WB_ENFORCE_POWER_ASSIGNMENT", {
				type: "state",
				common: {
					name: systemDictionary["WB_ENFORCE_POWER_ASSIGNMENT"][this.language],
					type: "boolean",
					role: "switch",
					read: false,
					write: true,
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.EMERGENCY_POWER", {
				type: "state",
				common: {
					name: systemDictionary["EMERGENCY_POWER"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					states: rscpEmsSetEmergencyPower,
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.START_EMERGENCY_POWER_TEST", {
				type: "state",
				common: {
					name: systemDictionary["START_EMERGENCY_POWER_TEST"][this.language],
					type: "boolean",
					role: "switch",
					read: false,
					write: true,
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.OVERRIDE_AVAILABLE_POWER", {
				type: "state",
				common: {
					name: systemDictionary["OVERRIDE_AVAILABLE_POWER"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_REQ_SET_OVERRIDE_AVAILABLE_POWER"]].Unit
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.DPP_PRICE_LIMIT_BATTERY", {
				type: "state",
				common: {
					name: systemDictionary["DPP_PRICE_LIMIT_BATTERY"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_REQ_DPP_SET_PRICE_LIMIT_BATTERY"]].Unit
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.DPP_PRICE_BASED_BATTERY_CHARGE_ENABLED", {
				type: "state",
				common: {
					name: systemDictionary["DPP_PRICE_BASED_BATTERY_CHARGE_ENABLED"][this.language],
					type: "boolean",
					role: "switch",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_REQ_DPP_SET_BATTERY_CHARGE_ENABLED"]].Unit
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.DPP_SOC_BATTERY", {
				type: "state",
				common: {
					name: systemDictionary["DPP_SOC_BATTERY"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_REQ_DPP_SET_SOC_BATTERY"]].Unit
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "EMS.DPP_MONTHS_ACTIVE", {
				type: "state",
				common: {
					name: systemDictionary["DPP_MONTHS_ACTIVE"][this.language],
					type: "number",
					role: "level",
					read: false,
					write: true,
					unit: rscpTag[rscpTagCode["TAG_EMS_REQ_DPP_SET_MONTHS_ACTIVE"]].Unit
				},
				native: {},
			} );
		}
		if( this.config.query_sys ) {
			await this.setObjectNotExistsAsync( "SYS", {
				type: "device",
				common: {
					name: systemDictionary["SYS"][this.language],
					role: "system",
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "SYS.SYSTEM_REBOOT", {
				type: "state",
				common: {
					name: systemDictionary["SYSTEM_REBOOT"][this.language],
					type: "number",
					role: "level",
					read: true,
					write: true,
					states: rscpSysSystemReboot,
				},
				native: {},
			} );
			await this.setObjectNotExistsAsync( "SYS.RESTART_APPLICATION", {
				type: "state",
				common: {
					name: systemDictionary["RESTART_APPLICATION"][this.language],
					type: "boolean",
					role: "switch",
					read: true,
					write: true,
				},
				native: {},
			} );
		}
		if ( this.config.query_db ) {
			await this.setObjectNotExistsAsync( "DB", {
				type: "device",
				common: {
					name: systemDictionary["DB"][this.language],
					role: "database",
				},
				native: {},
			} );

			const now = new Date();
			let d = new Date( now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0 );
			const timeStart = {};
			const timeInterval = {};
			const timeSpan = {};
			timeStart["DAY"] = helper.dateToString( d ); // last midnight
			timeInterval["DAY"] = 3600 / 4; // 15 min
			timeSpan["DAY"] = 3600 * 6; // 6 hours
			d = new Date( d.getTime() - ( d.getDay() + 6 ) % 7 * 1000 * 3600 * 24 );
			timeStart["WEEK"] = helper.dateToString( d ); // last Monday
			timeInterval["WEEK"] = 3600 * 4; // 4 hours
			timeSpan["WEEK"] = 3600 * 24 * 7; // 7 days
			d.setDate( 1 );
			timeStart["MONTH"] = helper.dateToString( d ); // 1st of month
			timeInterval["MONTH"] = 3600 * 24; // 1 day
			timeSpan["MONTH"] = 3600 * 24 * 31; // 31 days
			d.setMonth( 0 );
			timeStart["YEAR"] = helper.dateToString( d ); // 1st of January
			timeInterval["YEAR"] = 3600 * 24 * 30; // 30 days
			timeSpan["YEAR"] = 3600 * 24 * 365; // 1 year

			for ( const scale of ["DAY", "WEEK", "MONTH", "YEAR"] ) {
				await this.setObjectNotExistsAsync( `DB.HISTORY_DATA_${scale}`, {
					type: "channel",
					common: {
						name: systemDictionary[`HISTORY_DATA_${scale}`][this.language],
						role: `calendar.${scale.toLowerCase()}`,
					},
					native: {},
				} );
				await this.setObjectNotExistsAsync( `DB.HISTORY_DATA_${scale}.TIME_START`, {
					type: "state",
					common: {
						name: systemDictionary["TIME_START"][this.language],
						type: "string",
						role: "level",
						read: false,
						write: true,
						def: timeStart[scale],
					},
					native: {},
				} );
				await this.setObjectNotExistsAsync( `DB.HISTORY_DATA_${scale}.TIME_INTERVAL`, {
					type: "state",
					common: {
						name: systemDictionary["TIME_INTERVAL"][this.language],
						type: "number",
						role: "level",
						read: false,
						write: true,
						def: timeInterval[scale],
						unit: rscpTag[rscpTagCode["TAG_DB_REQ_HISTORY_TIME_INTERVAL"]].Unit,
					},
					native: {},
				} );
				await this.setObjectNotExistsAsync( `DB.HISTORY_DATA_${scale}.TIME_SPAN`, {
					type: "state",
					common: {
						name: systemDictionary["TIME_SPAN"][this.language],
						type: "number",
						role: "level",
						read: false,
						write: true,
						def: timeSpan[scale],
						unit: rscpTag[rscpTagCode["TAG_DB_REQ_HISTORY_TIME_SPAN"]].Unit,
					},
					native: {},
				} );
			}
		}
		if ( this.config.query_wb ) {
			wb = new wallbox( {}, this, systemDictionary );
		}

		// Initialize your adapter here
		this.log.debug( `config.*: (${this.config.e3dc_ip}, ${this.config.e3dc_port}, ${this.config.portal_user}, ${this.config.polling_interval_short}, ${this.config.polling_interval_medium}, ${this.config.polling_interval_long}, ${this.config.setpower_interval})` );
		this.initChannel();

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates( "RSCP.AUTHENTICATION" );
		for( const s in mapChangedIdToSetTags ) this.subscribeStates( s );
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload( callback ) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			this.clearAllIntervals();
			this.tcpConnection.end();
			this.tcpConnection.destroy();
			this.setState( "RSCP.AUTHENTICATION", 0, true );
			callback();
		} catch ( e ) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state change
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange( id, state ) {
		if ( state ) {
			this.log.debug( `state ${id} changed: ${state.val} (ack = ${state.ack})` );
			if ( !state.ack ) {
				if ( id.endsWith( "EMS.SET_POWER_MODE" ) ) {
					this.getState( "EMS.SET_POWER_VALUE", ( err, power ) => {
						this.sendEmsSetPower( state.val, power ? power.val : 0 );
					} );
				} else if ( id.endsWith( "EMS.SET_POWER_VALUE" ) ) {
					this.getState( "EMS.SET_POWER_MODE", ( err, mode ) => {
						this.sendEmsSetPower( mode ? mode.val : 0, state.val );
					} );
				} else if ( id.endsWith( "SYS.SYSTEM_REBOOT" ) ) {
					this.getState( "SYS.SYSTEM_REBOOT", ( err, reboot ) => {
						this.queueSysSystemReboot( reboot ? reboot.val : 0 );
					} );
				} else if ( id.endsWith( "SYS.RESTART_APPLICATION" ) ) {
					this.getState( "SYS.RESTART_APPLICATION", ( err, restart ) => {
						this.queueSysRestartApplication( restart ? restart.val : false );
					} );
				} else if ( id.includes( ".WB." ) ) {
					wb.queueWbSetData( id );
				} else if ( id.includes( "IDLE_PERIODS_2" ) ) {
					this.queueSetIdlePeriods2();
				} else if ( id.includes( "IDLE_PERIOD" ) ) {
					this.queueSetIdlePeriod( id );
				} else if ( id.includes( "HISTORY_DATA" ) ) {
					this.queueGetHistoryData( id );
				} else if ( id.endsWith( "PARAM_EP_RESERVE" ) || id.endsWith( "PARAM_EP_RESERVE_ENERGY" ) ) {
					this.queueSetEpReserve( id, state.val );
				} else if ( id.endsWith( "EMS.DPP_MONTHS_ACTIVE" ) ) {
					this.queueSetValue( id, helper.monthStringToBitmask( state.val ) );
				} else {
					this.queueSetValue( id, state.val );
				}
			}
			else {
				if( id.endsWith( "RSCP.AUTHENTICATION" ) && state.val == 0 ) {
					this.setState( "info.connection", false, true );
					this.log.warn( `E3/DC authentication failed` );
				}
			}
		} else {
			this.log.debug( `state ${id} deleted` );
		}
	}
}

// @ts-ignore parent is a valid property on module
if ( module.parent ) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = ( options ) => new E3dcRscp( options );
} else {
	// otherwise start the instance directly
	ad = new E3dcRscp();
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
	for ( line = 0; line * bpl * bpb < buffer.length; line++ ) {
		// Loop 1: hex
		for( block = 0; block < bpl && ( line*bpl+block )*bpb < buffer.length; block++ ) {
			for( i = 0; i < bpb && ( line*bpl+block )*bpb+i < buffer.length; i++ ) {
				result += ( "0"+buffer.readUInt8( ( line*bpl+block )*bpb+i ).toString( 16 ) ).slice( -2 ).toUpperCase()+" ";
			}
			result += "  ";
		}
		result += " -- ";
		// Loop 2: ASCII
		for( block = 0; block < bpl && ( line*bpl+block )*bpb < buffer.length; block++ ) {
			for( i = 0; i < bpb && ( line*bpl+block )*bpb+i < buffer.length; i++ ) {
				b = buffer.readUInt8( ( line*bpl+block )*bpb+i );
				if( b < 32 || b > 126 ) { b = 46; }
				result += String.fromCharCode( b );
			}
		}
		result += "\r\n";
	}
	return result;
}

function parseRscpToken( buffer, pos, text ) {
	if ( buffer.length < pos + 7 ) {
		text.content += " - invalid tag, buffer is too short.";
		return buffer.length;
	}
	const tagCode = buffer.readUInt32LE( pos );
	const typeCode = buffer.readUInt8( pos+4 );
	const typeName = rscpType[typeCode];
	const len = buffer.readUInt16LE( pos+5 );
	if( !rscpTag[tagCode] || buffer.length < pos+7+len ) {
		text.content += ` - invalid tag: 0x${tagCode.toString( 16 ).toUpperCase().padStart( 2,"0" )}`;
		return buffer.length;
	}
	text.content += `${rscpTag[tagCode].TagNameGlobal} - type: 0x${typeCode.toString( 16 ).toUpperCase().padStart( 2,"0" )} - ${rscpType[typeCode]} - length: ${len} `;
	if( ["AUTHENTICATION_USER","AUTHENTICATION_PASSWORD"].includes( rscpTag[tagCode].TagName ) ) {
		text.content += "value: ***hidden***"; // do not log cleartext credentials
		return 7+len;
	}
	switch( typeName ) {
		case "None":
			if ( len > 0 ) text.content += `CAUTION: length of data is ${len} `;
			return 7 + len;
		case "Container":
			text.content += "<Container content follows...> ";
			return 7; // length of container header, not content
		case "CString":
			text.content += `value: ${buffer.toString( "utf8",pos+7,pos+7+len )} `;
			return 7+len;
		case "Bitfield":
		case "ByteArray":
			text.content += `value: ${helper.bufferToString( buffer.slice( pos+7,pos+7+len ) )} `;
			return 7+len;
		case "Char8":
		case "UChar8":
		case "Bool":
			if( buffer.readUInt8( pos+7 ) > 31 && buffer.readUInt8( pos+7 ) < 127 && ( typeName == "Char8" || typeName == "UChar8" )  ) {
				text.content += `value: ${buffer.toString( "utf8",pos+7,pos+8 )} `;
			} else {
				text.content += `value: 0x${buffer.readUInt8( pos+7 ).toString( 16 ).toUpperCase().padStart( 2,"0" )} `;
			}
			return 7 + len;
		case "Int16":
			text.content += `value: ${buffer.readInt16LE( pos+7 )} `;
			return 7+len;
		case "UInt16":
			text.content += `value: ${buffer.readUInt16LE( pos+7 )} `;
			return 7+len;
		case "Int32":
			text.content += `value: ${buffer.readInt32LE( pos+7 )} `;
			return 7+len;
		case "UInt32":
			text.content += `value: ${buffer.readUInt32LE( pos+7 )} `;
			return 7+len;
		case "Int64":
			text.content += `value: ${buffer.readBigInt64LE( pos+7 )} `;
			return 7+len;
		case "UInt64":
			text.content += `value: ${buffer.readBigUInt64LE( pos+7 )} `;
			return 7+len;
		case "Error":
			text.content += `value: ${buffer.readUInt32LE( pos+7 )} `;
			return 7+len;
		case "Double64":
			text.content += `value: ${buffer.readDoubleLE( pos+7 )} `;
			return 7+len;
		case "Float32":
			text.content += `value: ${buffer.readFloatLE( pos+7 )} `;
			return 7+len;
		case "Timestamp":
			text.content += `seconds: ${buffer.readBigUInt64LE( pos+7 )} - nseconds: ${buffer.readUInt32LE( pos+7+8 )} `;
			return 7+len;
		default:
			if( len > 0 ) text.content += `${dumpRscpFrame( buffer.slice( pos+7,pos+7+len ) )} `;
			return 7+len;
	}
}

function printRscpFrame( buffer ) {
	const result = { content: "" };
	const magic = buffer.toString( "hex",0,2 ).toUpperCase();
	if( magic == "E3DC" ) {
		result.content += `magic: >${magic}< is OK `;
	} else {
		result.content += `magic: >${magic}< is WRONG `;
	}
	const ctrl = buffer.toString( "hex",2,4 ).toUpperCase();
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
	result.content += ` - seconds: ${buffer.readUIntLE( 4,6 )} - nseconds: ${buffer.readUInt32LE( 12 )} - length: ${buffer.readUInt16LE( 16 )}\r\n`;
	let i = parseRscpToken( buffer, 18, result );
	while( i < buffer.readUInt16LE( 16 ) ) {
		if( buffer.length >= 18+i+7 ) {
			result.content += "\r\n";
			i += parseRscpToken( buffer, 18 + i, result );
		} else break;
	}
	if ( buffer.length == 18 + i + 4 ) {
		result.content += "\r\nCRC32";
	} else {
		result.content += "\r\nno CRC32";
	}
	return result.content;
}

function printTree( tree ) {
	let result = "";
	if ( tree ) {
		result = "[ ";
		tree.forEach( element => {
			result += `<${rscpTag[element.tag].TagNameGlobal}(${rscpType[element.type]}) = `;
			if ( rscpType[element.type] == "Container" ) {
				result += printTree( element.content );
			} else {
				result += element.content;
			}
			result += ">, ";
		} );
		result = result.slice( 0, -2 ) + " ]";
	}
	return result;
}

// Access mapChangedIdToSetTags dictionary containing '*' wildcards in it's key.
// Input is a full state id like 'EMS.IDLE_PERIODS_DISCHARGE.01-Tuesday.END_MINUTE'
// Output for this example is the value of mapChangedIdToSetTags[EMS.*.*.END_MINUTE]
// Returns null if no mapChangedIdToSetTags entry matches.
function getSetTags( id ) {
	if ( mapChangedIdToSetTags[id] ) {
		return mapChangedIdToSetTags[id];
	} else {
		let result = null;
		for( const key in mapChangedIdToSetTags ) {
			const regex = new RegExp( "^" + key.replace( /[.]/g,"\\." ).replace( /[*]/g,"\\S+" ) + "$", "gi" );
			if( id.match( regex ) ) {
				result = mapChangedIdToSetTags[key];
				break;
			}
		}
		return result;
	}
}
