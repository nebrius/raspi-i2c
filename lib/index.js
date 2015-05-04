"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*
The MIT License (MIT)

Copyright (c) 2015 Bryan Hughes <bryan@theoreticalideations.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var i2c = _interopRequire(require("i2c-bus"));

var execSync = require("child_process").execSync;

var Peripheral = require("raspi-peripheral").Peripheral;

var _raspiBoard = require("raspi-board");

var VERSION_1_MODEL_B_REV_1 = _raspiBoard.VERSION_1_MODEL_B_REV_1;
var getBoardRevision = _raspiBoard.getBoardRevision;

if (typeof execSync !== "function") {
  execSync = require("execSync").run;
}

function checkAddress(address) {
  if (typeof address !== "number" || address < 0 || address > 127) {
    throw new Error("Invalid I2C address " + address + ". Valid addresses are 0 through 0x7f.");
  }
}

function checkRegister(register) {
  if (register !== undefined && (typeof register !== "number" || register < 0 || register > 255)) {
    throw new Error("Invalid I2C register " + register + ". Valid registers are 0 through 0xff.");
  }
}

function checkLength(length) {
  if (typeof length !== "number" || length < 0 || length > 32) {
    throw new Error("Invalid I2C length " + length + ". Valid lengths are 0 through 32.");
  }
}

function checkCallback(cb) {
  if (typeof cb !== "function") {
    throw new Error("Invalid I2C callback " + cb);
  }
}

function checkBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length <= 0 || buffer.length > 32) {
    throw new Error("Invalid I2C buffer " + buffer + ". Valid lengths are 0 through 32.");
  }
}

function checkByte(byte) {
  if (typeof byte !== "number" || byte < 0 || byte > 255) {
    throw new Error("Invalid I2C byte " + byte + ". Valid values are 0 through 0xff.");
  }
}

function checkWord(word) {
  if (typeof word !== "number" || word < 0 || word > 65535) {
    throw new Error("Invalid I2C word " + word + ". Valid values are 0 through 0xffff.");
  }
}

var devices = "__r$396836_1$__";
var getDevice = "__r$396836_2$__";

var I2C = exports.I2C = (function (_Peripheral) {
  function I2C(options) {
    _classCallCheck(this, I2C);

    var pins = options;
    if (!Array.isArray(pins)) {
      options = options || {};
      pins = options.pins || ["SDA0", "SCL0"];
    }
    _get(Object.getPrototypeOf(I2C.prototype), "constructor", this).call(this, pins);

    Object.defineProperties(this, _defineProperty({}, devices, {
      writable: true,
      value: []
    }));

    execSync("modprobe i2c-dev");
  }

  _inherits(I2C, _Peripheral);

  _createClass(I2C, (function () {
    var _createClass2 = {
      destroy: {
        value: function destroy() {
          this[devices].forEach(function (device) {
            device.closeSync();
          });

          this[devices] = [];

          _get(Object.getPrototypeOf(I2C.prototype), "destroy", this).call(this);
        }
      }
    };

    _defineProperty(_createClass2, getDevice, {
      value: function (address) {
        var device = this[devices][address];

        if (device === undefined) {
          device = i2c.openSync(getBoardRevision() === VERSION_1_MODEL_B_REV_1 ? 0 : 1);
          this[devices][address] = device;
        }

        return device;
      }
    });

    _defineProperty(_createClass2, "read", {
      value: function read(address, register, length, cb) {
        this.validateAlive();

        if (arguments.length === 3) {
          cb = length;
          length = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkLength(length);
        checkCallback(cb);

        var buffer = new Buffer(length);
        function callback(err) {
          if (err) {
            return cb(err);
          }
          cb(null, buffer);
        };

        if (register === undefined) {
          this[getDevice](address).i2cRead(address, length, buffer, callback);
        } else {
          this[getDevice](address).readI2cBlock(address, register, length, buffer, callback);
        }
      }
    });

    _defineProperty(_createClass2, "readSync", {
      value: function readSync(address, register, length) {
        this.validateAlive();

        if (arguments.length === 2) {
          length = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkLength(length);

        var buffer = new Buffer(length);

        if (register === undefined) {
          this[getDevice](address).i2cReadSync(address, length, buffer);
        } else {
          this[getDevice](address).readI2cBlockSync(address, register, length, buffer);
        }

        return buffer;
      }
    });

    _defineProperty(_createClass2, "readByte", {
      value: function readByte(address, register, cb) {
        this.validateAlive();

        if (arguments.length === 2) {
          cb = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);

        if (register === undefined) {
          var buffer = new Buffer(1);
          this[getDevice](address).i2cRead(address, buffer.length, buffer, function (err) {
            if (err) {
              return cb(err);
            }
            cb(null, buffer[0]);
          });
        } else {
          this[getDevice](address).readByte(address, register, cb);
        }
      }
    });

    _defineProperty(_createClass2, "readByteSync", {
      value: function readByteSync(address, register) {
        this.validateAlive();

        checkAddress(address);
        checkRegister(register);

        if (register === undefined) {
          var buffer = new Buffer(1);
          this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
          return buffer[0];
        } else {
          return this[getDevice](address).readByteSync(address, register);
        }
      }
    });

    _defineProperty(_createClass2, "readWord", {
      value: function readWord(address, register, cb) {
        this.validateAlive();

        if (arguments.length === 2) {
          cb = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);

        if (register === undefined) {
          var buffer = new Buffer(2);
          this[getDevice](address).i2cRead(address, buffer.length, buffer, function (err) {
            if (err) {
              return cb(err);
            }
            cb(null, buffer.readUInt16LE(0));
          });
        } else {
          this[getDevice](address).readWord(address, register, cb);
        }
      }
    });

    _defineProperty(_createClass2, "readWordSync", {
      value: function readWordSync(address, register) {
        this.validateAlive();

        checkAddress(address);
        checkRegister(register);

        if (register === undefined) {
          var buffer = new Buffer(2);
          this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
          return buffer.readUInt16LE(0);
        } else {
          return this[getDevice](address).readWordSync(address, register);
        }
      }
    });

    _defineProperty(_createClass2, "write", {
      value: function write(address, register, buffer, cb) {
        this.validateAlive();

        if (arguments.length === 3) {
          cb = buffer;
          buffer = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkBuffer(buffer);
        checkCallback(cb);

        if (register === undefined) {
          this[getDevice](address).i2cWrite(address, buffer.length, buffer, cb);
        } else {
          this[getDevice](address).writeI2cBlock(address, register, buffer.length, buffer, cb);
        }
      }
    });

    _defineProperty(_createClass2, "writeSync", {
      value: function writeSync(address, register, buffer) {
        this.validateAlive();

        if (arguments.length === 2) {
          buffer = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkBuffer(buffer);

        if (register === undefined) {
          this[getDevice](address).i2cWriteSync(address, buffer.length, buffer);
        } else {
          this[getDevice](address).writeI2cBlockSync(address, register, buffer.length, buffer);
        }
      }
    });

    _defineProperty(_createClass2, "writeByte", {
      value: function writeByte(address, register, byte, cb) {
        this.validateAlive();

        if (arguments.length === 3) {
          cb = byte;
          byte = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkByte(byte);
        checkCallback(cb);

        if (register === undefined) {
          this[getDevice](address).i2cWrite(address, 1, new Buffer([byte]), cb);
        } else {
          this[getDevice](address).writeByte(address, register, byte, cb);
        }
      }
    });

    _defineProperty(_createClass2, "writeByteSync", {
      value: function writeByteSync(address, register, byte) {
        this.validateAlive();

        if (arguments.length === 2) {
          byte = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkByte(byte);

        if (register === undefined) {
          this[getDevice](address).i2cWriteSync(address, 1, new Buffer([byte]));
        } else {
          this[getDevice](address).writeByteSync(address, register, byte);
        }
      }
    });

    _defineProperty(_createClass2, "writeWord", {
      value: function writeWord(address, register, word, cb) {
        this.validateAlive();

        if (arguments.length === 3) {
          cb = word;
          word = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkWord(word);
        checkCallback(cb);

        if (register === undefined) {
          var buffer = new Buffer(2);
          buffer.writeUInt16LE(word, 0);
          this[getDevice](address).i2cWrite(address, buffer.length, buffer, cb);
        } else {
          this[getDevice](address).writeWord(address, register, word, cb);
        }
      }
    });

    _defineProperty(_createClass2, "writeWordSync", {
      value: function writeWordSync(address, register, word) {
        this.validateAlive();

        if (arguments.length === 2) {
          word = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkWord(word);

        if (register === undefined) {
          var buffer = new Buffer(2);
          buffer.writeUInt16LE(word, 0);
          this[getDevice](address).i2cWriteSync(address, buffer.length, buffer);
        } else {
          this[getDevice](address).writeWordSync(address, register, word);
        }
      }
    });

    return _createClass2;
  })());

  return I2C;
})(Peripheral);

Object.defineProperty(exports, "__esModule", {
  value: true
});
//# sourceMappingURL=data:application/json;base64,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QUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdkUsTUFBTTtBQUNMLGNBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNqRTtPQUNGOzs7Ozs7U0F0U1UsR0FBRztHQUFTLFVBQVUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNSBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGkyYyBmcm9tICdpMmMtYnVzJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBQZXJpcGhlcmFsIH0gZnJvbSAncmFzcGktcGVyaXBoZXJhbCc7XG5pbXBvcnQgeyBWRVJTSU9OXzFfTU9ERUxfQl9SRVZfMSwgZ2V0Qm9hcmRSZXZpc2lvbiB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcblxuaWYgKHR5cGVvZiBleGVjU3luYyAhPT0gJ2Z1bmN0aW9uJykge1xuICBleGVjU3luYyA9IHJlcXVpcmUoJ2V4ZWNTeW5jJykucnVuO1xufVxuXG5mdW5jdGlvbiBjaGVja0FkZHJlc3MoYWRkcmVzcykge1xuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdudW1iZXInIHx8IGFkZHJlc3MgPCAwIHx8IGFkZHJlc3MgPiAweDdmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBhZGRyZXNzICcgKyBhZGRyZXNzXG4gICAgICArICcuIFZhbGlkIGFkZHJlc3NlcyBhcmUgMCB0aHJvdWdoIDB4N2YuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tSZWdpc3RlcihyZWdpc3Rlcikge1xuICBpZiAocmVnaXN0ZXIgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgKHR5cGVvZiByZWdpc3RlciAhPT0gJ251bWJlcicgfHwgcmVnaXN0ZXIgPCAwIHx8IHJlZ2lzdGVyID4gMHhmZikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIHJlZ2lzdGVyICcgKyByZWdpc3RlclxuICAgICAgKyAnLiBWYWxpZCByZWdpc3RlcnMgYXJlIDAgdGhyb3VnaCAweGZmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrTGVuZ3RoKGxlbmd0aCkge1xuICBpZiAodHlwZW9mIGxlbmd0aCAhPT0gJ251bWJlcicgfHwgbGVuZ3RoIDwgMCB8fCBsZW5ndGggPiAzMikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgbGVuZ3RoICcgKyBsZW5ndGhcbiAgICAgICsgJy4gVmFsaWQgbGVuZ3RocyBhcmUgMCB0aHJvdWdoIDMyLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQ2FsbGJhY2soY2IpIHtcbiAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgY2FsbGJhY2sgJyArIGNiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0J1ZmZlcihidWZmZXIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmZmVyKSB8fCBidWZmZXIubGVuZ3RoIDw9IDAgfHwgYnVmZmVyLmxlbmd0aCA+IDMyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBidWZmZXIgJyArIGJ1ZmZlclxuICAgICAgKyAnLiBWYWxpZCBsZW5ndGhzIGFyZSAwIHRocm91Z2ggMzIuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tCeXRlKGJ5dGUpIHtcbiAgaWYgKHR5cGVvZiBieXRlICE9PSAnbnVtYmVyJyB8fCBieXRlIDwgMCB8fCBieXRlID4gMHhmZikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYnl0ZSAnICsgYnl0ZVxuICAgICAgKyAnLiBWYWxpZCB2YWx1ZXMgYXJlIDAgdGhyb3VnaCAweGZmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrV29yZCh3b3JkKSB7XG4gIGlmICh0eXBlb2Ygd29yZCAhPT0gJ251bWJlcicgfHwgd29yZCA8IDAgfHwgd29yZCA+IDB4ZmZmZikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgd29yZCAnICsgd29yZFxuICAgICAgKyAnLiBWYWxpZCB2YWx1ZXMgYXJlIDAgdGhyb3VnaCAweGZmZmYuJ1xuICAgICk7XG4gIH1cbn1cblxudmFyIGRldmljZXMgPSAnX19yJDM5NjgzNl8xJF9fJztcbnZhciBnZXREZXZpY2UgPSAnX19yJDM5NjgzNl8yJF9fJztcblxuZXhwb3J0IGNsYXNzIEkyQyBleHRlbmRzIFBlcmlwaGVyYWwge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdmFyIHBpbnMgPSBvcHRpb25zO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwaW5zKSkge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBwaW5zID0gb3B0aW9ucy5waW5zIHx8IFsgJ1NEQTAnLCAnU0NMMCcgXTtcbiAgICB9XG4gICAgc3VwZXIocGlucyk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBbZGV2aWNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhlY1N5bmMoJ21vZHByb2JlIGkyYy1kZXYnKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpc1tkZXZpY2VzXS5mb3JFYWNoKGRldmljZSA9PiB7XG4gICAgICBkZXZpY2UuY2xvc2VTeW5jKClcbiAgICB9KTtcblxuICAgIHRoaXNbZGV2aWNlc10gPSBbXTtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIFtnZXREZXZpY2VdKGFkZHJlc3MpIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpc1tkZXZpY2VzXVthZGRyZXNzXTtcblxuICAgIGlmIChkZXZpY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGV2aWNlID0gaTJjLm9wZW5TeW5jKGdldEJvYXJkUmV2aXNpb24oKSA9PT0gVkVSU0lPTl8xX01PREVMX0JfUkVWXzEgPyAwIDogMSk7XG4gICAgICB0aGlzW2RldmljZXNdW2FkZHJlc3NdID0gZGV2aWNlO1xuICAgIH1cblxuICAgIHJldHVybiBkZXZpY2U7XG4gIH1cblxuICByZWFkKGFkZHJlc3MsIHJlZ2lzdGVyLCBsZW5ndGgsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBsZW5ndGg7XG4gICAgICBsZW5ndGggPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0xlbmd0aChsZW5ndGgpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIobGVuZ3RoKTtcbiAgICBmdW5jdGlvbiBjYWxsYmFjayhlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICB9XG4gICAgICBjYihudWxsLCBidWZmZXIpO1xuICAgIH07XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZWFkU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgbGVuZ3RoID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tMZW5ndGgobGVuZ3RoKTtcblxuICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKGxlbmd0aCk7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWRTeW5jKGFkZHJlc3MsIGxlbmd0aCwgYnVmZmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9ja1N5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgcmVhZEJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY2IgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcigxKTtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNSZWFkKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgZXJyID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGNiKG51bGwsIGJ1ZmZlclswXSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRCeXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICAgIHJldHVybiBidWZmZXJbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKTtcbiAgICB9XG4gIH1cblxuICByZWFkV29yZChhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgY2IobnVsbCwgYnVmZmVyLnJlYWRVSW50MTZMRSgwKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRXb3JkKGFkZHJlc3MsIHJlZ2lzdGVyLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcmVhZFdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICAgIHJldHVybiBidWZmZXIucmVhZFVJbnQxNkxFKDApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRXb3JkU3luYyhhZGRyZXNzLCByZWdpc3Rlcik7XG4gICAgfVxuICB9XG5cbiAgd3JpdGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IGJ1ZmZlcjtcbiAgICAgIGJ1ZmZlciA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnVmZmVyKGJ1ZmZlcik7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1dyaXRlKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykud3JpdGVJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfVxuICB9XG5cbiAgd3JpdGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZVN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlSTJjQmxvY2tTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIubGVuZ3RoLCBidWZmZXIpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgYnl0ZSwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IGJ5dGU7XG4gICAgICBieXRlID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tCeXRlKGJ5dGUpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCAxLCBuZXcgQnVmZmVyKFtieXRlXSksIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgYnl0ZSwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBieXRlID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tCeXRlKGJ5dGUpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZVN5bmMoYWRkcmVzcywgMSwgbmV3IEJ1ZmZlcihbYnl0ZV0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlV29yZChhZGRyZXNzLCByZWdpc3Rlciwgd29yZCwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IHdvcmQ7XG4gICAgICB3b3JkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tXb3JkKHdvcmQpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcigyKTtcbiAgICAgIGJ1ZmZlci53cml0ZVVJbnQxNkxFKHdvcmQsIDApO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1dyaXRlU3luYyhhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykud3JpdGVXb3JkU3luYyhhZGRyZXNzLCByZWdpc3Rlciwgd29yZCk7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=