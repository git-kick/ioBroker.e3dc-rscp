# Older changes
## 1.4.1

MODIFIED ADAPTER SETTINGS - see [Reuse of adapter configuration](https://github.com/git-kick/ioBroker.e3dc-rscp/tree/master?tab=readme-ov-file#reuse-of-adapter-configuration)
 
(git-kick)
* fixed error in weekdayStringToBitmask() - thanks to @SurfGargano for testing.
* idle periods v1 or v2 can now be switched off in the adapter config - recommendation is to use only one of both.
* fixed errors reported by the ioBroker Check and Service Bot:
  * \[E186\] "common.globalDependencies" must be an array in io-package.json
  * \[E190\] admin dependency missing. Please add to dependencies in io-package.json.
* New RscpTags.json: added new tags from 01-2024 tag list. 
**But keep** ...EMERGENCY_POWER_TEST... naming despite it changed to ...EMERGENCYPOWER_TEST... in the new tag-list (this affects four tags).
* Fixed [Issue #236](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/236) - added handling for version 2 PERIODs. 
* New instance settings for max. number of BAT/PVI/PM/PERIOD - so everybody who has e.g. 6 batteries or 3 power inverters can now adjust the detection range for his own setup. This fixes [Issue #249](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/249)
* Fixed [Issue #241](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/241) - modified PM index detection so that discountinuous index sets are handled correctly, like ( 0, 1, 3, 6 ).
* Fixed E524, E525, S526 dev dependencies.
* Enhanced max. index handling to produce less debug log messages. (Introduced notIndexIds for non-index counts.)
* fixed errors reported by the ioBroker Check and Service Bot:
  * \[E186\] "common.globalDependencies" must be an array in io-package.json
  * \[E190\] admin dependency missing. Please add to dependencies in io-package.json.
  * \[W050\] Package 'axios' listed as devDependency in package.json might be obsolete if using '@iobroker/adapter-dev'.

## 1.4.0   - Deprecated - Do not install -

## 1.3.1

MODIFIED ADAPTER SETTINGS - see [Reuse of adapter configuration](https://github.com/git-kick/ioBroker.e3dc-rscp/tree/master?tab=readme-ov-file#reuse-of-adapter-configuration)
 
(git-kick)
* Fixed [Issue #217](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/217) - added PM (power meter) namespace. **Only reading values, no SET tags.**
* Fixed two newly reported "undefined" occurences in main.js.
* Fixed errors listed in [Issue #217](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/217) - reported by the ioBroker Check and Service Bot.
  * \[E162\] js-controller dependency updated to >= 5.0.19
  * \[E204\] "remove news version 1.3.0" considered a false finding; in v1.2.6, io-package.json does not contain common.news "1.3.0"
  * \[E605\] updated copyright to 2024 in README.md
  * \[E605\] removed .npmignore from project directory
  * \[W040\] added keyword "ioBroker" in package.json
  * \[W130\] deleted all but some recent common.news in io-package.json 
  * \[W184\] removed "common.materialize" from io-package.json 
  * \[S522\] migrated to admin5 UI (jsonConfig.json5)

## 1.3.0  - Deprecated - Do not install -

## 1.2.6
 
(git-kick)
* Fixed [Issue #211](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/211) - added tag 0x0100003E to RscpTags.json and to ignoreIds, now adapter does not warn about it anymore.
* In consequence of [Issue #211](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/211), degraded "unknown tag" from warning to debug level. Message does not make sense to most of end users.

## 1.2.5
 
(git-kick)
* Added setter function for PARAM_EP_RESERVE and PARAM_EP_RESERVE_ENERGY in EP namespace - [Issue #199](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/199)  
  * Renamed PARAM_EP_RESERVE_W to PARAM_EP_RESERVE_ENERGY because it is a [Wh] energy variable.
  * Renamed PARAM_EP_RESERVE_MAX_W to PARAM_EP_RESERVE_MAX_ENERGY for the same reason.

* Removed "dangerous" setter tags introduced with v1.2.4 , instead of just switching them off - [Issue #196](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/196)

## 1.2.4
__MODIFIED ADAPTER SETTINGS - do not re-use settings stored in *.json__

__CAUTION: re-use of config from *.json will periodically stop your inverter! See [Issue #196](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/196) for details.__

(ka-vaNu / git-kick)
* Added setter functions for wallbox: BATTERY_BEFORE_CAR_MODE, BATTERY_TO_CAR_MODE, WB_DISCHARGE_BAT_UNTIL, WB_ENFORCE_POWER_ASSIGNMENT - [Issue #185](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/185)

(git-kick)
* Added EMS.REQ_SET_EMERGENCY_POWER (=>EMERGENCY_POWER), EMS.REQ_START_EMERGENCY_POWER_TEST (=>START_EMERGENCY_POWER_TEST) and EMS.REQ_SET_OVERRIDE_AVAILABLE_POWER (=>OVERRIDE_AVAILABLE_POWER). **EMERGENCY_POWER tags are experimental. Testing against the real E3/DC is difficult unless you have an UPS for all relevant devices.** - [Issue #57](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/57)

* Added EMS.REQ_EMERGENCY_POWER_RETRY (=>EMERGENCY_POWER_RETRY) and EMS.REQ_EMERGENCY_POWER_OVERLOAD_STATUS (=>PARAM_NO_REMAINING_ENTRY,PARAM_TIME_TO_RETRY). Note that both have polling interval "N" by default. (Reason is that they are not in the official tag list and use is unclear.)
* Check for IP address and port - [Issue #194](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/194)
* Added setter EMS.MANUAL_CHARGE_ENERGY - [Issue #184](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/184)
* Fixed onReady() async calls causing (very rare) unhandled exceptions - [Issue #178](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/178)
* Handle ENOENT exception if admin/words.js is unavailable - [Issue #180](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/180)
* Added config switch lazy_setstate  - [Issue #174](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/174). The adapter is now capable of updating State.ts according to convention (also when the value was unchanged). **Note** that the default ist "false" (i.e. no setState() call as long as value remains unchanged) in order to avoid a breaking chage for users with small hardware. 
* New chapter in [README-dev.md](https://github.com/git-kick/ioBroker.e3dc-rscp/blob/master/README-dev.md) describing how to add a standard setter tag to the adapter.

## 1.2.3
(git-kick)
* Added testing with Node 18 and Node 20 - [Issue #165](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/165)
* Upgraded to new translations, adding "uk" language - [Issue #166](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/166)
* Stop polling "unavailable" tags - [Issue #169](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/169)
* Fixed vulnerable dependency: protobufjs < 7.2.4 - [CVE-2023-36665](https://nvd.nist.gov/vuln/detail/CVE-2023-36665)
* Fixed vulnerable dependency: word-wrap < 1.2.4 - [CVE-2023-26115](https://nvd.nist.gov/vuln/detail/CVE-2023-26115)
* Adapter uses Sentry now.

## 1.2.2
(git-kick)
* Fixed TAG_PVI_REQ_FREQUENCY_UNDER_OVER warning with polling interval 'N' - [Issue #157](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/157)
* Log "warn - received message with invalid ..." reclassified to 'debug' - [Issue #159](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/159)
* Revised BAT and PVI probing; now resilient with lost responses - [Issue #160](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/160)
* Integrated Sentry plugin for crash reporting - see [documentation](https://github.com/ioBroker/plugin-sentry)

## 1.2.1
__MODIFIED ADAPTER SETTINGS - do not re-use settings stored in *.json__

(git-kick)
* Added INFO namespace REQ tags (no SET tags yet) - [Issue #149](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/149)
* Fixed representation of EMS.EPTEST_NEXT_TESTSTART in object tree.
* Fixed out of range exceptions upon TCP/IP noise (i.e., if a frame has inconsistent length, then stop processing it.)
* Added two README.md sections: "Reuse of adapter configuration", "Issues and feature requests"

## 1.2.0 - Deprecated - Do not install -

## 1.1.2
(ka-vaNu)
* WB Control.* no longer updated by rscp response - [PR #144](https://github.com/git-kick/ioBroker.e3dc-rscp/pull/144)

(git-kick)
* Avoid cleartext password in silly log.

## 1.1.1
(ka-vaNu)
* Fixed typo which prevented creation of wallbox object - [Issue #139](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/139)

(git-kick)
* Fixed vulnerable dependency: glob-parent < 5.1.2 - [CVE-2020-28469](https://nvd.nist.gov/vuln/detail/CVE-2022-28469)

## 1.1.0
(ka-vaNu)
* Added support for wallboxes, including setter tags - [Issue #106](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/106)

(helper0815)
* Added value "N" for polling intervals, meaning "never" - [Issue #126](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/126)

(git-kick)
* Fixed vulnerable dependency: minimatch < 3.0.5 - [CVE-2022-3517](https://nvd.nist.gov/vuln/detail/CVE-2022-3517)
* Fixed vulnerable dependency: decode-uri-component < 0.2.1 - [CVE-2022-38900](https://nvd.nist.gov/vuln/detail/CVE-2022-38900)

## 1.0.8
(git-kick)
* No updates for e3dc-rscp.0.EP.PARAM_0.* - [Issue #117](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/117)
* Vulnerable dependency: glob-parent < 5.1.2 - [CVE-2020-28469](https://nvd.nist.gov/vuln/detail/CVE-2020-28469)
* Define info.connection and RSCP.AUTHENTICATION synchronously (to avoid warning in adapter log)

__Note__: DO NOT import adapter settings from a json-file created with an older version of e3dc-rscp. Instead, create a new adapter configuration from the scratch and then store it to a json-file. Reason is that importing an older json-file will delete polling interval list entries which have been added with v1.0.8 and this will invalidate the bugfix!

## 1.0.7
(git-kick)
* High CPU load on js-controller after triggering historical data - [Issue #114](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/114)

## 1.0.6
(git-kick)
* Boolean switches (e.g. EMS.WEATHER_REGULATED_CHARGE_ENABLED) did not work properly - [Issue #109](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/103)
* Fixed vulnerable dependency: minimist < 1.2.6 - [CVE-2021-44906](https://nvd.nist.gov/vuln/detail/CVE-2021-44906)

## 1.0.5
(git-kick)
* SET_POWER not effective due to delayed transmission - [Issue #103](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/103)

## 1.0.4
(git-kick)
* BAT_1 not visible after update to v1.0.3 - [Issue #96](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/96)
* Save button inactive after loading adapter configuration - [Issue #95](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/95)

## 1.0.3
(git-kick)
* Reconnect does not work after RESTART_APPLICATION - [Issue #74](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/74)
* Query of battery data does not work - [Issue #85](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/85)
* DCB_CELL_TEMPERATURE = 0 obviously means there is no value, so display "(null)" instead of "0 °C"
* Uncaught out-of-range exception when entering invalid data - [Issue #88](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/88)
* Emergency Power Level - [Issue #89](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/89)

## 1.0.2
(git-kick)
* SYS namespace, experimental support - [Issue #60](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/60)
* info.connection is true while no connection - [Issue #64](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/64)
* Compatibility check to js-controller 4.0 - [Issue #75](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/75)
* WB.PM_ACTIVE_PHASES decode values - [Issue #76](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/76)
* WB.MODE decode value 8 - [Issue #77](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/77)
* Dependabot: follow-redirects 1.14.8

## 1.0.1
(git-kick)
* [CVE-2021-23566](https://nvd.nist.gov/vuln/detail/CVE-2021-23566): require nanoid >=3.1.31 - [Issue #61](https://github.com/git-kick/ioBroker.e3dc-rscp/issues/61)
* [CVE-2020-28469](https://nvd.nist.gov/vuln/detail/CVE-2020-28469): require glob-parent >=5.1.2
* [Sentry Event](https://sentry.io/organizations/ulrich-kick/issues/2812710513/events/0c4653a38cd24b6a8732a10d07370e06/): Type Error in sendNextFrame(), handling case this == null

## 1.0.0
(git-kick)
* Prerequisites for ioBroker repo in README.md, io-package.json, github
* CVE-2022-0155: require follow-redirects 1.14.7
* Best Practices: create info.connection state
* Best practices: set roles for all inner nodes in object tree
* Bugfix: EMS.POWER_PV was never updated due to missing line in polling intervals table
* Adapter review (PR#1589): removed tab stuff (tab_m.html)
* Adapter review (PR#1589): onUnload(), clear _all_ timers and close TCP connection
* Remove Sentry, because it was only a trial and not properly configured

<a name="lic"></a>