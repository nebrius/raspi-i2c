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

// Hacky quick Symbol polyfill, since es6-symbol refuses to install with Node 0.10 from http://node-arm.herokuapp.com/
if (typeof global.Symbol != "function") {
  global.Symbol = function (name) {
    return "__$raspi_symbol_" + name + "_" + Math.round(Math.random() * 268435455) + "$__";
  };
}

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

var devices = Symbol("devices");
var getDevice = Symbol("getDevice");

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
        }

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
        var _this = this;

        this.validateAlive();

        if (arguments.length === 2) {
          cb = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);

        if (register === undefined) {
          (function () {
            var buffer = new Buffer(1);
            _this[getDevice](address).i2cRead(address, buffer.length, buffer, function (err) {
              if (err) {
                return cb(err);
              }
              cb(null, buffer[0]);
            });
          })();
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

        var byte = undefined;
        if (register === undefined) {
          var buffer = new Buffer(1);
          this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
          byte = buffer[0];
        } else {
          byte = this[getDevice](address).readByteSync(address, register);
        }
        return byte;
      }
    });

    _defineProperty(_createClass2, "readWord", {
      value: function readWord(address, register, cb) {
        var _this = this;

        this.validateAlive();

        if (arguments.length === 2) {
          cb = register;
          register = undefined;
        }

        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);

        if (register === undefined) {
          (function () {
            var buffer = new Buffer(2);
            _this[getDevice](address).i2cRead(address, buffer.length, buffer, function (err) {
              if (err) {
                return cb(err);
              }
              cb(null, buffer.readUInt16LE(0));
            });
          })();
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

        var byte = undefined;
        if (register === undefined) {
          var buffer = new Buffer(2);
          this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
          byte = buffer.readUInt16LE(0);
        } else {
          byte = this[getDevice](address).readWordSync(address, register);
        }
        return byte;
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsRUFBRTtBQUMxQixjQUFJLEdBQUcsUUFBUSxDQUFDO0FBQ2hCLGtCQUFRLEdBQUcsU0FBUyxDQUFDO1NBQ3RCOztBQUVELG9CQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEIscUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QixpQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVoQixZQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDMUIsY0FBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzlCLGNBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdkUsTUFBTTtBQUNMLGNBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNqRTtPQUNGOzs7Ozs7U0ExU1UsR0FBRztHQUFTLFVBQVUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNSBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGkyYyBmcm9tICdpMmMtYnVzJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBQZXJpcGhlcmFsIH0gZnJvbSAncmFzcGktcGVyaXBoZXJhbCc7XG5pbXBvcnQgeyBWRVJTSU9OXzFfTU9ERUxfQl9SRVZfMSwgZ2V0Qm9hcmRSZXZpc2lvbiB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcblxuLy8gSGFja3kgcXVpY2sgU3ltYm9sIHBvbHlmaWxsLCBzaW5jZSBlczYtc3ltYm9sIHJlZnVzZXMgdG8gaW5zdGFsbCB3aXRoIE5vZGUgMC4xMCBmcm9tIGh0dHA6Ly9ub2RlLWFybS5oZXJva3VhcHAuY29tL1xuaWYgKHR5cGVvZiBnbG9iYWwuU3ltYm9sICE9ICdmdW5jdGlvbicpIHtcbiAgZ2xvYmFsLlN5bWJvbCA9IChuYW1lKSA9PiB7XG4gICAgcmV0dXJuICdfXyRyYXNwaV9zeW1ib2xfJyArIG5hbWUgKyAnXycgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAweEZGRkZGRkYpICsgJyRfXyc7XG4gIH07XG59XG5cbmlmICh0eXBlb2YgZXhlY1N5bmMgIT09ICdmdW5jdGlvbicpIHtcbiAgZXhlY1N5bmMgPSByZXF1aXJlKCdleGVjU3luYycpLnJ1bjtcbn1cblxuZnVuY3Rpb24gY2hlY2tBZGRyZXNzKGFkZHJlc3MpIHtcbiAgaWYgKHR5cGVvZiBhZGRyZXNzICE9PSAnbnVtYmVyJyB8fCBhZGRyZXNzIDwgMCB8fCBhZGRyZXNzID4gMHg3Zikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYWRkcmVzcyAnICsgYWRkcmVzc1xuICAgICAgKyAnLiBWYWxpZCBhZGRyZXNzZXMgYXJlIDAgdGhyb3VnaCAweDdmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpIHtcbiAgaWYgKHJlZ2lzdGVyICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICh0eXBlb2YgcmVnaXN0ZXIgIT09ICdudW1iZXInIHx8IHJlZ2lzdGVyIDwgMCB8fCByZWdpc3RlciA+IDB4ZmYpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyByZWdpc3RlciAnICsgcmVnaXN0ZXJcbiAgICAgICsgJy4gVmFsaWQgcmVnaXN0ZXJzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0xlbmd0aChsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiBsZW5ndGggIT09ICdudW1iZXInIHx8IGxlbmd0aCA8IDAgfHwgbGVuZ3RoID4gMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGxlbmd0aCAnICsgbGVuZ3RoXG4gICAgICArICcuIFZhbGlkIGxlbmd0aHMgYXJlIDAgdGhyb3VnaCAzMi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0NhbGxiYWNrKGNiKSB7XG4gIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGNhbGxiYWNrICcgKyBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tCdWZmZXIoYnVmZmVyKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcikgfHwgYnVmZmVyLmxlbmd0aCA8PSAwIHx8IGJ1ZmZlci5sZW5ndGggPiAzMikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYnVmZmVyICcgKyBidWZmZXJcbiAgICAgICsgJy4gVmFsaWQgbGVuZ3RocyBhcmUgMCB0aHJvdWdoIDMyLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQnl0ZShieXRlKSB7XG4gIGlmICh0eXBlb2YgYnl0ZSAhPT0gJ251bWJlcicgfHwgYnl0ZSA8IDAgfHwgYnl0ZSA+IDB4ZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGJ5dGUgJyArIGJ5dGVcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1dvcmQod29yZCkge1xuICBpZiAodHlwZW9mIHdvcmQgIT09ICdudW1iZXInIHx8IHdvcmQgPCAwIHx8IHdvcmQgPiAweGZmZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIHdvcmQgJyArIHdvcmRcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZmZmLidcbiAgICApO1xuICB9XG59XG5cbmNvbnN0IGRldmljZXMgPSBTeW1ib2woJ2RldmljZXMnKTtcbmNvbnN0IGdldERldmljZSA9IFN5bWJvbCgnZ2V0RGV2aWNlJyk7XG5cbmV4cG9ydCBjbGFzcyBJMkMgZXh0ZW5kcyBQZXJpcGhlcmFsIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGxldCBwaW5zID0gb3B0aW9ucztcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGlucykpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgcGlucyA9IG9wdGlvbnMucGlucyB8fCBbICdTREEwJywgJ1NDTDAnIF07XG4gICAgfVxuICAgIHN1cGVyKHBpbnMpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgW2RldmljZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4ZWNTeW5jKCdtb2Rwcm9iZSBpMmMtZGV2Jyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXNbZGV2aWNlc10uZm9yRWFjaChkZXZpY2UgPT4ge1xuICAgICAgZGV2aWNlLmNsb3NlU3luYygpO1xuICAgIH0pO1xuXG4gICAgdGhpc1tkZXZpY2VzXSA9IFtdO1xuXG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgW2dldERldmljZV0oYWRkcmVzcykge1xuICAgIGxldCBkZXZpY2UgPSB0aGlzW2RldmljZXNdW2FkZHJlc3NdO1xuXG4gICAgaWYgKGRldmljZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXZpY2UgPSBpMmMub3BlblN5bmMoZ2V0Qm9hcmRSZXZpc2lvbigpID09PSBWRVJTSU9OXzFfTU9ERUxfQl9SRVZfMSA/IDAgOiAxKTtcbiAgICAgIHRoaXNbZGV2aWNlc11bYWRkcmVzc10gPSBkZXZpY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRldmljZTtcbiAgfVxuXG4gIHJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IGxlbmd0aDtcbiAgICAgIGxlbmd0aCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrTGVuZ3RoKGxlbmd0aCk7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKGxlbmd0aCk7XG4gICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuICAgICAgY2IobnVsbCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZWFkU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgbGVuZ3RoID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tMZW5ndGgobGVuZ3RoKTtcblxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIobGVuZ3RoKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cblxuICByZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXJbMF0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHJlYWRCeXRlU3luYyhhZGRyZXNzLCByZWdpc3Rlcikge1xuICAgIHRoaXMudmFsaWRhdGVBbGl2ZSgpO1xuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuXG4gICAgbGV0IGJ5dGU7XG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICAgIGJ5dGUgPSBidWZmZXJbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ5dGUgPSB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGU7XG4gIH1cblxuICByZWFkV29yZChhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXIucmVhZFVJbnQxNkxFKDApKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZFdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKTtcbiAgICB9XG4gIH1cblxuICByZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcblxuICAgIGxldCBieXRlO1xuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWRTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgICBieXRlID0gYnVmZmVyLnJlYWRVSW50MTZMRSgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnl0ZSA9IHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZTtcbiAgfVxuXG4gIHdyaXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBidWZmZXI7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlSTJjQmxvY2soYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnVmZmVyID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tCdWZmZXIoYnVmZmVyKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBieXRlO1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgMSwgbmV3IEJ1ZmZlcihbYnl0ZV0pLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIDEsIG5ldyBCdWZmZXIoW2J5dGVdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSB3b3JkO1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==