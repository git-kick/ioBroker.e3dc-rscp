/**
 * Wallbox setter and getter.
 *
 * Due to large main.js file, wallbox functionality was put in this separate file.
 *
 * @link   https://github.com/ka-vaNu/ioBroker.e3dc-rscp/tree/Support-Wallbox
 * @file   This files defines the wallbox class.
 * @author ka-vaNu.
 * @since  1.1.0
 */

const helper = require( "./helper" );

const rscpWbType2Locked = {
	0: "UNLOCKED",
	1: "LOCKED",
	16: "NOT_CONNECTED"
};

const rscpWbSunmode = {
	"1": "SUNMODE",
	"2": "MIXEDMODE",
};

const rscpWbActivePhases = {
	1: "1-Phase",
	3: "3-Phase",
};

const rscpBool = {
	0: "NO",
	1: "YES",
};

class wallbox {

	constructor( settings, adapter, systemDictionary ) {
		this.settings = settings || {};
		this.adapter = adapter;
		this.systemDictionary = systemDictionary;
		this.rscpTag = require( "./lib/RscpTags.json" );
	}

	queueWbRequestData( sml ) {
		this.adapter.clearFrame();
		this.adapter.addTagtoFrame( "TAG_WB_REQ_CONNECTED_DEVICES", sml );
		for ( let i = 0; i <= this.adapter.maxIndex["WB"]; i++ ) {
			const pos = this.adapter.startContainer( "TAG_WB_REQ_DATA" );
			this.adapter.addTagtoFrame( "TAG_WB_INDEX", "", i );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_STATUS", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_ERROR_CODE", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_MODE", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DEVICE_ID", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DEVICE_NAME", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DEVICE_STATE", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_APP_SOFTWARE", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_BOOTLOADER_SOFTWARE", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_HW_VERSION", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_FLASH_VERSION", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_ENERGY_ALL", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_ENERGY_SOLAR", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_SOC", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_POWER_L1", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_POWER_L2", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_POWER_L3", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_ACTIVE_PHASES", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_MODE", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_ENERGY_L1", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_ENERGY_L2", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_ENERGY_L3", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_DEVICE_ID", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_ERROR_CODE", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_FIRMWARE_VERSION", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PM_MAX_PHASE_POWER", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DIAG_INFOS", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DIAG_WARNINGS", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DIAG_ERRORS", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DIAG_TEMP_1", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_DIAG_TEMP_2", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_SUN", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_NET", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_ALL", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_ALG", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PARAM_1", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_PARAM_2", sml );
			this.adapter.endContainer( pos );
		}
		this.adapter.pushFrame();
	}

	queueWbRequestExternData( sml ) {
		this.adapter.clearFrame();
		this.adapter.addTagtoFrame( "TAG_WB_REQ_CONNECTED_DEVICES", sml );
		for ( let i = 0; i <= this.adapter.maxIndex["WB"]; i++ ) {
			const pos = this.adapter.startContainer( "TAG_WB_REQ_DATA" );
			this.adapter.addTagtoFrame( "TAG_WB_INDEX", "", i );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_SUN", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_NET", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_ALL", sml );
			this.adapter.addTagtoFrame( "TAG_WB_REQ_EXTERN_DATA_ALG", sml );
			this.adapter.endContainer( pos );
		}
		this.adapter.pushFrame();
	}

	queueWbSetData( id ) {
		const lp = "[queueWbSetData] ";
		this.adapter.log.debug( lp + "State changed: " + id );
		const baseId = id.substr( 0, id.lastIndexOf( "." ) );
		const tag = id.substr( id.lastIndexOf( "." ) + 1 );
		this.adapter.log.silly( lp + "baseId: " + baseId );
		this.adapter.log.silly( lp + "tag: " + tag );
		// Expects EXTERN_DATA (length 6) and EXTERN_DATA_LEN =6 /
		// Byte 1: 1-Sonnenmode / 2-Mischmode /
		// Byte 2: Strombegrenzung für alle  / Modes, [1 ? 32] A /
		// Byte 3:  PreCharge (1: +5% / 2: -5%) /numPhases
		// Byte 4: > 0: Anzahl Phasen tauschen  /
		// Byte 5: > 0: Typ 2, Laden abbrechen /
		// Byte 6: > 0: Schuko, Best�tigung für ?AN?  /
		// SUNMODE
		switch ( tag ) {
			case "SunMode":
				this.adapter.getState( baseId + ".SunMode", ( err, sunmodeState ) => {
					if ( err ) {
						this.adapter.log.error( err.message );
					}
					const sunmodeVal = ( sunmodeState ? sunmodeState.val : 0 );
					const sunmode = helper.toHex( sunmodeVal );
					this.adapter.log.silly( "sunmode: " + sunmode );
					this.adapter.setState( baseId + ".SunMode", sunmodeVal, true );
					this.buildWbExternData( sunmode + " 00 00 00 00 00" );
				} );
				break;
			case "PowerLimitation":
				// Power_Limitation
				this.adapter.getState( baseId + ".PowerLimitation", ( err, powerLimitationState ) => {
					if ( err ) {
						this.adapter.log.error( err.message );
					}
					const powerLimitationVal = ( powerLimitationState ? powerLimitationState.val : 10 );
					const powerLimitation = helper.toHex( powerLimitationVal );
					this.adapter.log.silly( "powerLimitationVal: " + powerLimitation );
					this.adapter.setState( baseId + ".PowerLimitation", powerLimitationVal, true );
					this.buildWbExternData( "00 " + powerLimitation + " 00 00 00 00 " );
				} );
				break;
			case "Precharge":
				// Precharge
				this.adapter.getState( baseId + ".Precharge", ( err, prechargeState ) => {
					if ( err ) {
						this.adapter.log.error( err.message );
					}
					const prechargeVal = ( prechargeState ? prechargeState.val : 10 );
					const precharge = helper.toHex( prechargeVal );
					this.adapter.log.silly( "prechargeVal: " + precharge );
					this.adapter.setState( baseId + ".Precharge", prechargeVal, true );
					this.buildWbExternData( "00 00 " + precharge + " 00 00 00 " );
				} );
				break;
			case "TogglePhases":
				// Toggle Phases 1->3, 3->1
				this.adapter.getState( baseId + ".TogglePhases", ( err, togglePhasesState ) => {
					if ( err ) {
						this.adapter.log.error( err.message );
					}
					const togglePhasesVal = ( togglePhasesState ? togglePhasesState.val : 0 );
					const togglePhases = helper.toHex( togglePhasesVal );
					this.adapter.log.silly( "togglePhasesVal: " + togglePhasesVal );
					// Reset toggle phases
					this.adapter.setState( baseId + ".TogglePhases", 0, true );
					this.buildWbExternData( "00 00 00 " + togglePhases + " 00 00 " );
				} );
				break;
			case "ToggleChargingType2":
				// Abort Charging Type 2 Plug
				this.adapter.getState( baseId + ".ToggleChargingType2", ( err, abortChargingState ) => {
					if ( err ) {
						this.adapter.log.error( err.message );
					}
					const abortChargingVal = ( abortChargingState ? abortChargingState.val : 0 );
					const abortCharging = helper.toHex( abortChargingVal );
					this.adapter.log.silly( "abortChargingVal: " + abortChargingVal );
					// reset abort charging
					this.adapter.setState( baseId + ".ToggleChargingType2", 0, true );
					this.buildWbExternData( "00 00 00 00 " + abortCharging + " 00 " );
				} );
				break;
			default:
				break;
		}
		// schuko unklar, zunächst ignorieren
		// Aktualisierung beauftragen
		this.queueWbRequestExternData( "" );
	}

	buildWbExternData( str ) {
		const lp = "[buildWbExternData] ";
		this.adapter.log.debug( lp + "Building Frame" );
		this.adapter.log.silly( lp + "TAG_WB_EXTERN_DATA: " + str );
		this.adapter.clearFrame();
		const c1 = this.adapter.startContainer( "TAG_WB_REQ_DATA" );
		this.adapter.addTagtoFrame( "TAG_WB_INDEX", "", 0 ); // Index der Wallbox = 0
		const c2 = this.adapter.startContainer( "TAG_WB_REQ_SET_EXTERN" );
		this.adapter.addTagtoFrame( "TAG_WB_EXTERN_DATA", "", str );
		this.adapter.addTagtoFrame( "TAG_WB_EXTERN_DATA_LEN", "", 6 ); // Länge des bytearray
		this.adapter.endContainer( c2 );
		this.adapter.endContainer( c1 );
		this.adapter.pushFrame( c1 );
		this.adapter.log.silly( lp + "End Building Frame" );
	}


	storeWbExternData( shortId, tree, path ) {
		const lp = "[storeWbExternData] ";
		this.adapter.log.silly( lp + "Storing Data" );
		const wbPath = "WB." + path.split( "." )[0];
		this.adapter.log.silly( lp + "ExternData wbPath : " + wbPath );
		if ( this.adapter.config.query_wb ) {

			// Falls erforderlich wird die Struktur erzeugt
			this.generateStates( wbPath );

			// Tree verarbeiten
			let container = "";
			tree.forEach( token => {
				this.adapter.log.silly( lp + "ExternData Token : " + JSON.stringify( token ) );
				const tag = shortId.split( "." )[1];
				if ( this.rscpTag[token.tag].DataType == "Container" ) {
					this.adapter.log.silly( lp + "Container : " + container );
				}
				if ( this.rscpTag[token.tag].TagNameGlobal in ["TAG_WB_EXTERN_DATA_SUN", "TAG_WB_EXTERN_DATA_NET", "TAG_WB_EXTERN_DATA_ALL", "TAG_WB_EXTERN_DATA_ALG"] ) {
					this.adapter.extendObject( "WB." + path + tag, { type: "channel", common: { role: "value" } } );
				}
				if ( this.rscpTag[token.tag].TagNameGlobal == "TAG_WB_EXTERN_DATA" ) {
					this.adapter.log.silly( lp + "ExternData fullPath : " + wbPath + "." + tag + ".EXTERN_DATA" );
					this.adapter.setObjectNotExists( wbPath + "." + tag + ".EXTERN_DATA", {
						type: "state",
						common: {
							name: this.systemDictionary["EXTERN_DATA"][this.adapter.language],
							type: "string",
							role: "value",
							read: true,
							write: false,
							unit: "",
							def: ""
						},
						native: {},
					} );
					this.adapter.setState( wbPath + "." + tag + ".EXTERN_DATA", token.content, true );
					this.adapter.log.silly( lp + "ExternData shortId : " + shortId );
					this.adapter.log.silly( lp + "ExternData Content : " + token.content );
					container = shortId.split( "." )[1];
					this.adapter.log.silly( lp + "Container : " + container );
					let extData = [];
					switch ( container ) {
						case "EXTERN_DATA_SUN":
							extData = token.content.split( " " );
							this.adapter.log.silly( lp + "EXTERN_DATA_SUN : " + JSON.stringify( extData ) );
							this.adapter.log.silly( lp + "SunPower[W] : " + parseInt( extData[1] + extData[2], 16 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_SUN.SunPower", parseInt( extData[1] + extData[0], 16 ), true );
							break;
						case "EXTERN_DATA_NET":
							extData = token.content.split( " " );
							this.adapter.log.silly( lp + "EXTERN_DATA_NET : " + JSON.stringify( extData ) );
							this.adapter.log.silly( lp + "GridPower[W] : " + parseInt( extData[1] + extData[2], 16 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_NET.GridPower", parseInt( extData[1] + extData[0], 16 ), true );
							break;
						case "EXTERN_DATA_ALL":
							extData = token.content.split( " " );
							this.adapter.log.silly( lp + "EXTERN_DATA_ALL : " + JSON.stringify( extData ) );
							this.adapter.log.silly( lp + "TotalPower[W] : " + parseInt( extData[1] + extData[2], 16 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_ALL.TotalPower", parseInt( extData[1] + extData[0], 16 ), true );
							break;
						case "EXTERN_DATA_ALG":
							extData = token.content.split( " " );
							this.adapter.log.silly( lp + "EXTERN_DATA_ALG : " + JSON.stringify( extData ) );

							// Byte 2 Aktive Phasen
							this.adapter.log.silly( lp + "ActivePhases : " + parseInt( extData[1], 16 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_ALG.ActivePhases", parseInt( extData[1], 16 ), true );

							/* Byte 3 WB-Status
							EXTERN_DATA_ALG
							A8 1010 1000 - Sonnenmodus, Not Canceled, Lädt      , Locked
							C8 1100 1000 - Sonnenmodus,     Canceled, Lädt nicht, Locked
							48 0100 1000 - MixedMode  ,     Canceled, Lädt nicht, Locked
							*/
							this.adapter.log.silly( lp + "WB-Status : " + parseInt( extData[1], 16 ) );
							// Bit 7 - Wert 128 - Sonnenmodus / Mixedmode
							this.adapter.log.silly( lp + "SunMode : " + ( ( parseInt( extData[2], 16 ) & 128 ) == 128 ? 1 : 2 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_ALG.SunMode", ( parseInt( extData[2], 16 ) & 128 ) == 128 ? 1 : 2, true );
							// Bit 6 - Wert 64  - Charging canceled
							this.adapter.log.silly( lp + "CarChargingCanceled : " + ( ( parseInt( extData[2], 16 ) & 64 ) == 64 ? 1 : 0 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_ALG.CarChargingCanceled", ( parseInt( extData[2], 16 ) & 64 ) == 64 ? 1 : 0, true );
							// Bit 5 - Wert 32  - Charging
							this.adapter.log.silly( lp + "CarCharging : " + ( ( parseInt( extData[2], 16 ) & 32 ) == 32 ? 1 : 0 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_ALG.CarCharging", ( parseInt( extData[2], 16 ) & 32 ) == 32 ? 1 : 0, true );
							// Bit 4 ist immer 0
							// Bit 3 - Wert 8   - Locked
							this.adapter.log.silly( lp + "Type2Locked : " + ( ( parseInt( extData[2], 16 ) & 8 ) == 8 ? 1 : 0 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_ALG.Type2Locked", ( parseInt( extData[2], 16 ) & 8 ) == 8 ? 1 : 0, true );
							// Bit 3,2,1 sind immer 0

							// Byte 4 : Ladeleistung - OK bei DEVICE_NAME "Easy Connect"
							this.adapter.log.silly( lp + "PowerLimitation : " + parseInt( extData[3], 16 ) );
							this.adapter.setState( wbPath + ".EXTERN_DATA_ALG.PowerLimitation", parseInt( extData[3], 16 ), true );
							break;
						default:
							break;
					}
				}
			} );
		}
	}

	generateStates( wbPath ){
		this.adapter.setObjectNotExists( "WB", {
			type: "device",
			common: {
				name: this.systemDictionary["WB"][this.adapter.language],
				role: "wallbox",
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".Control.SunMode", {
			type: "state",
			common: {
				name: this.systemDictionary["SunMode"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: true,
				unit: "",
				states: rscpWbSunmode,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".Control.PowerLimitation", {
			type: "state",
			common: {
				name: this.systemDictionary["PowerLimitation"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: true,
				unit: "A",
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".Control.TogglePhases", {
			type: "state",
			common: {
				name: this.systemDictionary["TogglePhases"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: true,
				unit: "",
				states: rscpBool,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".Control.ToggleChargingType2", {
			type: "state",
			common: {
				name: this.systemDictionary["ToggleChargingType2"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: true,
				unit: "",
				states: rscpBool,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_SUN.SunPower", {
			type: "state",
			common: {
				name: this.systemDictionary["SunPower"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "W",
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_NET.GridPower", {
			type: "state",
			common: {
				name: this.systemDictionary["GridPower"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "W",
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_ALL.TotalPower", {
			type: "state",
			common: {
				name: this.systemDictionary["TotalPower"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "W",
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_ALG.CarCharging", {
			type: "state",
			common: {
				name: this.systemDictionary["CarCharging"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "",
				states: rscpBool,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_ALG.CarChargingCanceled", {
			type: "state",
			common: {
				name: this.systemDictionary["CarChargingCanceled"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "",
				states: rscpBool,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_ALG.Type2Locked", {
			type: "state",
			common: {
				name: this.systemDictionary["Type2Locked"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "",
				states: rscpWbType2Locked,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_ALG.ActivePhases", {
			type: "state",
			common: {
				name: this.systemDictionary["ActivePhases"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "",
				states: rscpWbActivePhases,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_ALG.SunMode", {
			type: "state",
			common: {
				name: this.systemDictionary["SunMode"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "",
				states: rscpWbSunmode,
				def: 0
			},
			native: {},
		} );
		this.adapter.setObjectNotExists( wbPath + ".EXTERN_DATA_ALG.PowerLimitation", {
			type: "state",
			common: {
				name: this.systemDictionary["PowerLimitation"][this.adapter.language],
				type: "number",
				role: "value",
				read: true,
				write: false,
				unit: "A",
				def: 0
			},
			native: {},
		} );
	}
}

module.exports = wallbox;
