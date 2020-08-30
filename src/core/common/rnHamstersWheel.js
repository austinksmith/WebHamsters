/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/***********************************************************************************
* Title: Hamsters.js                                                               *
* Description: 100% Vanilla Javascript Multithreading & Parallel Execution Library *
* Author: Austin K. Smith                                                          *
* Contact: austin@asmithdev.com                                                    *  
* Copyright: 2015 Austin K. Smith - austin@asmithdev.com                           * 
* License: Artistic License 2.0                                                    *
***********************************************************************************/

this.params = {};
this.rtn = {};

var typedArrayFromBuffer = function(dataType, buffer) {
  var types = {
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
};

var prepareReturn = function(returnObject) {
  var dataType = returnObject.dataType;
  if(dataType) {
    returnObject.data = typedArrayFromBuffer(dataType, returnObject.data);
  }
  return JSON.stringify(returnObject);
};

this.onmessage = function(incomingMessage) {
  params = JSON.parse(incomingMessage.data);
  rtn = {
    data: [],
    dataType: (params.dataType ? params.dataType.toLowerCase() : null)
  };
  if(params.importScripts) {
    this.importScripts(params.importScripts);
  }
  new Function(params.hamstersJob)();
  postMessage(prepareReturn(rtn));
};

