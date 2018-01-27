/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/*
* Title: Hamsters.js
* Description: Javascript library to add multi-threading support to javascript by exploiting concurrent web workers
* Author: Austin K. Smith
* Contact: austin@asmithdev.com
* Copyright: 2015 Austin K. Smith - austin@asmithdev.com
* License: Artistic License 2.0
*/

import hamstersData from './data';
import hamstersHabitat from './habitat';

'use strict';

class wheel {

  constructor() {
    this.worker = this.workerScaffold;
    this.regular = this.regularScaffold;
    this.legacy = this.legacyScaffold;
  }

  workerScaffold() {
    'use strict';

    var params = {};
    var rtn = {};

    function setDefaults(incomingMessage) {
      params = incomingMessage.data;
      rtn = {
        data: [],
        dataType: params.dataType
      };
    }

    addEventListener('connect', function(incomingConnection) {
      const port = incomingConnection.ports[0];
      port.start();
      port.addEventListener('message', function(incomingMessage) {
        setDefaults(incomingMessage);
        eval("(" + params.fn + ")")();
        port.postMessage({
          results: rtn
        });
      }, false);
    }, false);
  }

  regularScaffold() {
    'use strict';

    var params = {};
    var rtn = {};

    function setDefaults(incomingMessage) {
      params = incomingMessage.data;
      rtn = {
        data: [],
        dataType: (params.dataType ? params.dataType.toLowerCase() : null)
      };
    }

    function prepareReturn(returnObject) {
      var dataType = returnObject.dataType;
      if(dataType) {
        returnObject.data = typedArrayFromBuffer(dataType, returnObject.data);
      }
      return returnObject;
    }

    function typedArrayFromBuffer(dataType, buffer) {
      const types = {
        'uint32': Uint32Array,
        'uint16': Uint16Array,
        'uint8': Uint8Array,
        'uint8clamped': Uint8ClampedArray,
        'int32': Int32Array,
        'int16': Int16Array,
        'int8': Int8Array,
        'float32': Float32Array,
        'float64': Float64Array
      };
      if (!types[dataType]) {
        return buffer;
      }
      return new types[dataType](buffer);
    }

    function prepareTransferBuffers(hamsterFood) {
      let buffers = [];
      let key = null;
      for (key in hamsterFood) {
        if (hamsterFood.hasOwnProperty(key) && hamsterFood[key]) {
          if(hamsterFood[key].buffer) {
            buffers.push(hamsterFood[key].buffer);
          } else if(Array.isArray(hamsterFood[key]) && typeof ArrayBuffer !== 'undefined') {
            buffers.push(new ArrayBuffer(hamsterFood[key]));
          }
        }
      }
      return buffers;
    }

    function onmessage(incomingMessage) {
      setDefaults(incomingMessage);
      new Function(params.fn)();
      postMessage(prepareReturn(rtn), prepareTransferBuffers(rtn));
    };
  }

  legacyScaffold(params, resolve, reject) {
    setTimeout(function() {
      var rtn = {
        data: [],
        dataType: (params.dataType ? params.dataType.toLowerCase() : null)
      };
      params.fn();
      if (params.dataType) {
        rtn.data = hamstersData.processDataType(params.dataType, rtn.data, hamstersHabitat.transferable);
        rtn.dataType = params.dataType;
      }
      resolve(rtn);
    }, 4); //4ms delay (HTML5 spec minimum), simulate threading
  }
};

var hamstersWheel = new wheel();

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = hamstersWheel;
}
