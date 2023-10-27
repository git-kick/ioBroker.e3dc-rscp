![Logo](admin/e3dc-rscp.png)
# ioBroker.e3dc-rscp

## Developer manual
This adapter is based on @iobroker/create-adapter v1.31.0
It was developed looking at E3/DC's [sample application](http://s10.e3dc.com/dokumentation/RscpExample.zip) which is written in C++.

The sample application package also contains the official tag lists, which are necessary to interpret RSCP frames semantically.

### Timestamp Handling

* RSCP: 8 byte BigInt [seconds], 4 byte Int [nanoseconds]
* internal processing is done via Float [seconds] and Date
* ioBroker object tree: human readable String like "2022-01-30 12:00:00.000"

### DB Namespace Semantics

In the DB namespace, time series can be requested from E3/DC:
* TIME_START = start of observed time range
* TIME_SPAN = length of observed time range; minimum is 900 seconds, i.e. 15 minutes
* TIME_INTERVAL = sampling rate; minimum is 900 seconds, i.e. 15 minutes

Results contain GRAPH_INDEX, described as "relative position within the graph". The data point's timestamp can be approximated like

	TIMESTAMP = TIME_START + GRAPH_INDEX * TIME_INTERVAL

Here is some data from test calls:
<table>
  <tr> <th>SPAN</th> <th>INTERVAL</th> <th>GRAPH_INDEX increment</th> <th># of values</th> </tr>
  <tr> <td>7200</td> <td>60</td> <td>13.6</td> <td>8</td> </tr>
  <tr> <td>3600</td> <td>60</td> <td>13.6</td> <td>4</td> </tr>
  <tr> <td>3600</td> <td>120</td> <td>6.8</td> <td>4</td> </tr>
  <tr> <td>120</td> <td>3600</td> <td>ERR</td> <td>ERR</td> </tr>
  <tr> <td>120</td> <td>120</td> <td>ERR</td> <td>ERR</td> </tr>
  <tr> <td>360</td> <td>120</td> <td>ERR</td> <td>ERR</td> </tr>
  <tr> <td>1800</td> <td>120</td> <td>6.8</td> <td>2</td> </tr>
  <tr> <td>900</td> <td>120</td> <td>6.8</td> <td>1</td> </tr>
  <tr> <td>86400</td> <td>3600</td> <td>1</td> <td>24</td> </tr>
  <tr> <td>86400</td> <td>60</td> <td>13.6</td> <td>96</td> </tr>
  <tr> <td>86400</td> <td>7200</td> <td>1</td> <td>12</td> </tr>
  <tr> <td>86400</td> <td>1800</td> <td>1</td> <td>48</td> </tr>
  <tr> <td>43200</td> <td>900</td> <td>1</td> <td>48</td> </tr>
  <tr> <td>86400</td> <td>900</td> <td>1</td> <td>96</td> </tr>
  <tr> <td>172800</td> <td>3600</td> <td>1</td> <td>32</td> </tr>
  <tr> <td>172800</td> <td>1800</td> <td>1</td> <td>64</td> </tr>
  <tr> <td>172800</td> <td>7200</td> <td>1</td> <td>16</td> </tr>
  <tr> <td>345600</td> <td>7200</td> <td>1</td> <td>16</td> </tr>
 </table>

Observations:
* It looks like E3/DC stores values in 15 minutes resolution.
* TIME_SPAN below 900 seconds causes an error response. 
* TIME_INTERVAL below 900 seconds is treated like 900 seconds.
* For HISTORY_DATA_DAY, it seems that TIME_SPAN maximum is 32 hours.
* Typically, the first data value is at TIME_START + TIME_INTERVAL/2
* One additional value is (always?) transmitted at the end of TIME_SPAN.

## Introducing a new  setter tag
While RSCP is not strictly built according to patterns, most of the settable attributes involve four tags, e.g. for EMS.WB_DISCHARGE_BAT_UNTIL we have

* TAG_EMS_REQ_**WB_DISCHARGE_BAT_UNTIL** - request current value from E3/DC
* TAG_EMS_**WB_DISCHARGE_BAT_UNTIL** - response: the requested value from E3/DC
* TAG_EMS_REQ_SET_**WB_DISCHARGE_BAT_UNTIL** - request E3/DC to set the value
* TAG_EMS_SET_**WB_DISCHARGE_BAT_UNTIL** - response: the value set in E3/DC

Within ioBroker's object tree, all four tags will be represented in one object: `e3dc-rscp.0.EMS.WB_DISCHARGE_BAT_UNTIL`

NOTE: the following describes how to handle the standard case as depicted above. Peculiarities like
* container frames involved (e.g. EMS_MAX_CHARGE_POWER)
* need to repeat requests to make E3/DC hold a value (e.g. SET_POWER)
* nested structures (e.g. IDLE_PERIODS, DB.HISTORY)

are not described here, but handled by dedicated code (e.g. a new `queue...()` function in `main.js`).

### 1. Make sure the four tags are listed correctly in `RscpTags.json` and `io-package.json`
First, check `RscpTags.json`. If the REQ tag was unknown before, also add a polling interval default in `io-package.json`.
NOTE: do _not_ add the REQ_SET tag to `io-package.json`; only the REQ tag is used for polling.

    "polling_intervals": [
        ...
        {
            "tag": "TAG_EMS_REQ_WB_DISCHARGE_BAT_UNTIL",
            "interval": "M"
        },
        ...
    ],
_Do not_ add the REQ_SET tag; it will not be polled regularly.

NOTE: after modifying `io-package.json`, you have to do reinstall the adapter from-the-scratch and re-ernter the configuration - _do not_ load a config json file, this will disable the new `io-package.json` entries.
### 2. Declare object to represent a setter and assign setter tag

    const mapChangedIdToSetTags = {
      ...
      "EMS.WB_DISCHARGE_BAT_UNTIL": ["", "TAG_EMS_REQ_SET_WB_DISCHARGE_BAT_UNTIL"],
    }
### 3. Add getter tag to subsystem data request (if not already there)
This includes the value in regular polling so that we will see E3/DC side changes in the object tree.

    queueEmsRequestData( sml ) {
    ...
        this.addTagtoFrame( "TAG_EMS_REQ_WB_DISCHARGE_BAT_UNTIL", sml );
    ...
    }
### 4. Add an object to the object tree
This is necessary because it is writable and thererfore non-standard.

    await this.setObjectNotExistsAsync( "EMS.WB_DISCHARGE_BAT_UNTIL", {
      type: "state",
      common: {
        name: systemDictionary["WB_DISCHARGE_BAT_UNTIL"][this.language],
        type: "number",
        role: "value",
        read: false,
        write: true,
        unit: "%",
      },
      native: {},
    } );
### 5. System dictionary entry
The systemDictionary["WB_DISCHARGE_BAT_UNTIL"][this.language] above must be filled with a meaningful text in admin/en/translations.json

    "WB_DISCHARGE_BAT_UNTIL": "Set wallbox discharge battery until",

After entering English text, call 

  `npm run translate all`

to generate translations to all other languages.

### Done. No extra send function in such standard cases! `queueSetValue()` will send the value after it was changed in the object tree.


## RSCP API Documentation

### Original sources

The S10 portal contains basic documentation

* [RSCP Short Description](https://s10.e3dc.com/s10/module/download/get.php?id=270)
* [RscpExample](https://s10.e3dc.com/s10/module/download/get.php?id=1626) contains RSCP-Tags-Official.xlsm
* [Documentation of RscpExample](https://s10.e3dc.com/s10/module/download/get.php?id=280)

### Additional sources

In addition, the following projects, among others, deal with the RSCP interface:

* [RSCPGui](https://github.com/rxhan/RSCPGui) [MIT License](https://github.com/rxhan/RSCPGui/blob/master/LICENSE)
* [rscp2mqtt](https://github.com/pvtom/rscp2mqtt) [MIT License](https://github.com/pvtom/rscp2mqtt/blob/main/LICENSE)
* [E3dcGui](https://github.com/nischram/E3dcGui) no License found
* [E3DC-Rscp](https://github.com/rellla/E3DC-Rscp) no License found
* [S10history](https://github.com/RalfJL/S10history) no License found

#
## The rest of this Developer manual will be modified/removed when processed and done, respectively.

### Best Practices
We've collected some [best practices](https://github.com/ioBroker/ioBroker.repositories#development-and-coding-best-practices) regarding ioBroker development and coding in general. If you're new to ioBroker or Node.js, you should
check them out. If you're already experienced, you should also take a look at them - you might learn something new :)

### Scripts in `package.json`
Several npm scripts are predefined for your convenience. You can run them using `npm run <scriptname>`
| Script name | Description |
|-------------|-------------|
| `test:js` | Executes the tests you defined in `*.test.js` files. |
| `test:package` | Ensures your `package.json` and `io-package.json` are valid. |
| `test:unit` | Tests the adapter startup with unit tests (fast, but might require module mocks to work). |
| `test:integration` | Tests the adapter startup with an actual instance of ioBroker. |
| `test` | Performs a minimal test run on package files and your tests. |
| `check` | Performs a type-check on your code (without compiling anything). |
| `lint` | Runs `ESLint` to check your code for formatting errors and potential bugs. |

### Writing tests
When done right, testing code is invaluable, because it gives you the 
confidence to change your code while knowing exactly if and when 
something breaks. A good read on the topic of test-driven development 
is https://hackernoon.com/introduction-to-test-driven-development-tdd-61a13bc92d92. 
Although writing tests before the code might seem strange at first, but it has very 
clear upsides.

The template provides you with basic tests for the adapter startup and package files.
It is recommended that you add your own tests into the mix.
