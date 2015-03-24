"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*
The MIT License (MIT)

Copyright (c) 2015 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

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

var checkAlive = "__r$396836_0$__";
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

    _defineProperty(_createClass2, checkAlive, {
      value: function () {
        if (!this.alive) {
          throw new Error("Attempted to access a destroyed I2C peripheral");
        }
      }
    });

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
        this[checkAlive]();

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
//# sourceMappingURL=data:application/json;base64,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QVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFaEIsWUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLGNBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLGdCQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QixjQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3ZFLE1BQU07QUFDTCxjQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDakU7T0FDRjs7Ozs7O1NBNVNVLEdBQUc7R0FBUyxVQUFVIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTUgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+IChodHRwOi8vdGhlb3JldGljYWxpZGVhdGlvbnMuY29tKVxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgaTJjIGZyb20gJ2kyYy1idXMnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IFBlcmlwaGVyYWwgfSBmcm9tICdyYXNwaS1wZXJpcGhlcmFsJztcbmltcG9ydCB7IFZFUlNJT05fMV9NT0RFTF9CX1JFVl8xLCBnZXRCb2FyZFJldmlzaW9uIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuXG5pZiAodHlwZW9mIGV4ZWNTeW5jICE9PSAnZnVuY3Rpb24nKSB7XG4gIGV4ZWNTeW5jID0gcmVxdWlyZSgnZXhlY1N5bmMnKS5ydW47XG59XG5cbmZ1bmN0aW9uIGNoZWNrQWRkcmVzcyhhZGRyZXNzKSB7XG4gIGlmICh0eXBlb2YgYWRkcmVzcyAhPT0gJ251bWJlcicgfHwgYWRkcmVzcyA8IDAgfHwgYWRkcmVzcyA+IDB4N2YpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGFkZHJlc3MgJyArIGFkZHJlc3NcbiAgICAgICsgJy4gVmFsaWQgYWRkcmVzc2VzIGFyZSAwIHRocm91Z2ggMHg3Zi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKSB7XG4gIGlmIChyZWdpc3RlciAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAodHlwZW9mIHJlZ2lzdGVyICE9PSAnbnVtYmVyJyB8fCByZWdpc3RlciA8IDAgfHwgcmVnaXN0ZXIgPiAweGZmKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgcmVnaXN0ZXIgJyArIHJlZ2lzdGVyXG4gICAgICArICcuIFZhbGlkIHJlZ2lzdGVycyBhcmUgMCB0aHJvdWdoIDB4ZmYuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tMZW5ndGgobGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgbGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBsZW5ndGggPCAwIHx8IGxlbmd0aCA+IDMyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBsZW5ndGggJyArIGxlbmd0aFxuICAgICAgKyAnLiBWYWxpZCBsZW5ndGhzIGFyZSAwIHRocm91Z2ggMzIuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tDYWxsYmFjayhjYikge1xuICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBjYWxsYmFjayAnICsgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQnVmZmVyKGJ1ZmZlcikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWZmZXIpIHx8IGJ1ZmZlci5sZW5ndGggPD0gMCB8fCBidWZmZXIubGVuZ3RoID4gMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGJ1ZmZlciAnICsgYnVmZmVyXG4gICAgICArICcuIFZhbGlkIGxlbmd0aHMgYXJlIDAgdGhyb3VnaCAzMi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0J5dGUoYnl0ZSkge1xuICBpZiAodHlwZW9mIGJ5dGUgIT09ICdudW1iZXInIHx8IGJ5dGUgPCAwIHx8IGJ5dGUgPiAweGZmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBieXRlICcgKyBieXRlXG4gICAgICArICcuIFZhbGlkIHZhbHVlcyBhcmUgMCB0aHJvdWdoIDB4ZmYuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tXb3JkKHdvcmQpIHtcbiAgaWYgKHR5cGVvZiB3b3JkICE9PSAnbnVtYmVyJyB8fCB3b3JkIDwgMCB8fCB3b3JkID4gMHhmZmZmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyB3b3JkICcgKyB3b3JkXG4gICAgICArICcuIFZhbGlkIHZhbHVlcyBhcmUgMCB0aHJvdWdoIDB4ZmZmZi4nXG4gICAgKTtcbiAgfVxufVxuXG52YXIgY2hlY2tBbGl2ZSA9ICdfX3IkMzk2ODM2XzAkX18nO1xudmFyIGRldmljZXMgPSAnX19yJDM5NjgzNl8xJF9fJztcbnZhciBnZXREZXZpY2UgPSAnX19yJDM5NjgzNl8yJF9fJztcblxuZXhwb3J0IGNsYXNzIEkyQyBleHRlbmRzIFBlcmlwaGVyYWwge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdmFyIHBpbnMgPSBvcHRpb25zO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwaW5zKSkge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBwaW5zID0gb3B0aW9ucy5waW5zIHx8IFsgJ1NEQTAnLCAnU0NMMCcgXTtcbiAgICB9XG4gICAgc3VwZXIocGlucyk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBbZGV2aWNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhlY1N5bmMoJ21vZHByb2JlIGkyYy1kZXYnKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpc1tkZXZpY2VzXS5mb3JFYWNoKGRldmljZSA9PiB7XG4gICAgICBkZXZpY2UuY2xvc2VTeW5jKClcbiAgICB9KTtcblxuICAgIHRoaXNbZGV2aWNlc10gPSBbXTtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIFtjaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXMuYWxpdmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGVkIHRvIGFjY2VzcyBhIGRlc3Ryb3llZCBJMkMgcGVyaXBoZXJhbCcpO1xuICAgIH1cbiAgfVxuXG4gIFtnZXREZXZpY2VdKGFkZHJlc3MpIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpc1tkZXZpY2VzXVthZGRyZXNzXTtcblxuICAgIGlmIChkZXZpY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGV2aWNlID0gaTJjLm9wZW5TeW5jKGdldEJvYXJkUmV2aXNpb24oKSA9PT0gVkVSU0lPTl8xX01PREVMX0JfUkVWXzEgPyAwIDogMSk7XG4gICAgICB0aGlzW2RldmljZXNdW2FkZHJlc3NdID0gZGV2aWNlO1xuICAgIH1cblxuICAgIHJldHVybiBkZXZpY2U7XG4gIH1cblxuICByZWFkKGFkZHJlc3MsIHJlZ2lzdGVyLCBsZW5ndGgsIGNiKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgIGNiID0gbGVuZ3RoO1xuICAgICAgbGVuZ3RoID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tMZW5ndGgobGVuZ3RoKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKGxlbmd0aCk7XG4gICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuICAgICAgY2IobnVsbCwgYnVmZmVyKTtcbiAgICB9O1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNSZWFkKGFkZHJlc3MsIGxlbmd0aCwgYnVmZmVyLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkSTJjQmxvY2soYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgYnVmZmVyLCBjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVhZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCkge1xuICAgIHRoaXNbY2hlY2tBbGl2ZV0oKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBsZW5ndGggPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0xlbmd0aChsZW5ndGgpO1xuXG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIobGVuZ3RoKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cblxuICByZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY2IgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcigxKTtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNSZWFkKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgZXJyID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGNiKG51bGwsIGJ1ZmZlclswXSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRCeXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKDEpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWRTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgICByZXR1cm4gYnVmZmVyWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRCeXRlU3luYyhhZGRyZXNzLCByZWdpc3Rlcik7XG4gICAgfVxuICB9XG5cbiAgcmVhZFdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNiID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXIucmVhZFVJbnQxNkxFKDApKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZFdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKTtcbiAgICB9XG4gIH1cblxuICByZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICAgIHJldHVybiBidWZmZXIucmVhZFVJbnQxNkxFKDApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRXb3JkU3luYyhhZGRyZXNzLCByZWdpc3Rlcik7XG4gICAgfVxuICB9XG5cbiAgd3JpdGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlciwgY2IpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBidWZmZXI7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlSTJjQmxvY2soYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGJ1ZmZlciA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnVmZmVyKGJ1ZmZlcik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1dyaXRlU3luYyhhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykud3JpdGVJMmNCbG9ja1N5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfVxuICB9XG5cbiAgd3JpdGVCeXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlLCBjYikge1xuICAgIHRoaXNbY2hlY2tBbGl2ZV0oKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IGJ5dGU7XG4gICAgICBieXRlID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tCeXRlKGJ5dGUpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCAxLCBuZXcgQnVmZmVyKFtieXRlXSksIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgYnl0ZSwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIDEsIG5ldyBCdWZmZXIoW2J5dGVdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgIGNiID0gd29yZDtcbiAgICAgIHdvcmQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja1dvcmQod29yZCk7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgICBidWZmZXIud3JpdGVVSW50MTZMRSh3b3JkLCAwKTtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlV29yZChhZGRyZXNzLCByZWdpc3Rlciwgd29yZCwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcigyKTtcbiAgICAgIGJ1ZmZlci53cml0ZVVJbnQxNkxFKHdvcmQsIDApO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1dyaXRlU3luYyhhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykud3JpdGVXb3JkU3luYyhhZGRyZXNzLCByZWdpc3Rlciwgd29yZCk7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=