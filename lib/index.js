'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.I2C = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _i2cBus = require('i2c-bus');

var _i2cBus2 = _interopRequireDefault(_i2cBus);

var _child_process = require('child_process');

var _raspiPeripheral = require('raspi-peripheral');

var _raspiBoard = require('raspi-board');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               The MIT License (MIT)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Copyright (c) 2015 Bryan Hughes <bryan@nebri.us>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
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

function checkAddress(address) {
  if (typeof address !== 'number' || address < 0 || address > 0x7f) {
    throw new Error('Invalid I2C address ' + address + '. Valid addresses are 0 through 0x7f.');
  }
}

function checkRegister(register) {
  if (register !== undefined && (typeof register !== 'number' || register < 0 || register > 0xff)) {
    throw new Error('Invalid I2C register ' + register + '. Valid registers are 0 through 0xff.');
  }
}

function checkLength(length) {
  if (typeof length !== 'number' || length < 0 || length > 32) {
    throw new Error('Invalid I2C length ' + length + '. Valid lengths are 0 through 32.');
  }
}

function checkCallback(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid I2C callback ' + cb);
  }
}

function checkBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length <= 0 || buffer.length > 32) {
    throw new Error('Invalid I2C buffer ' + buffer + '. Valid lengths are 0 through 32.');
  }
}

function checkByte(byte) {
  if (typeof byte !== 'number' || byte < 0 || byte > 0xff) {
    throw new Error('Invalid I2C byte ' + byte + '. Valid values are 0 through 0xff.');
  }
}

function checkWord(word) {
  if (typeof word !== 'number' || word < 0 || word > 0xffff) {
    throw new Error('Invalid I2C word ' + word + '. Valid values are 0 through 0xffff.');
  }
}

var devices = Symbol('devices');
var getDevice = Symbol('getDevice');

var I2C = exports.I2C = function (_Peripheral) {
  _inherits(I2C, _Peripheral);

  function I2C(options) {
    _classCallCheck(this, I2C);

    var pins = options;
    if (!Array.isArray(pins)) {
      options = options || {};
      pins = options.pins || ['SDA0', 'SCL0'];
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(I2C).call(this, pins));

    Object.defineProperties(_this, _defineProperty({}, devices, {
      writable: true,
      value: []
    }));

    (0, _child_process.execSync)('modprobe i2c-dev');
    return _this;
  }

  _createClass(I2C, [{
    key: 'destroy',
    value: function destroy() {
      this[devices].forEach(function (device) {
        device.closeSync();
      });

      this[devices] = [];

      _get(Object.getPrototypeOf(I2C.prototype), 'destroy', this).call(this);
    }
  }, {
    key: getDevice,
    value: function value(address) {
      var device = this[devices][address];

      if (device === undefined) {
        device = _i2cBus2.default.openSync((0, _raspiBoard.getBoardRevision)() === _raspiBoard.VERSION_1_MODEL_B_REV_1 ? 0 : 1);
        this[devices][address] = device;
      }

      return device;
    }
  }, {
    key: 'read',
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
  }, {
    key: 'readSync',
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
  }, {
    key: 'readByte',
    value: function readByte(address, register, cb) {
      var _this2 = this;

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
          _this2[getDevice](address).i2cRead(address, buffer.length, buffer, function (err) {
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
  }, {
    key: 'readByteSync',
    value: function readByteSync(address, register) {
      this.validateAlive();

      checkAddress(address);
      checkRegister(register);

      var byte = void 0;
      if (register === undefined) {
        var buffer = new Buffer(1);
        this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
        byte = buffer[0];
      } else {
        byte = this[getDevice](address).readByteSync(address, register);
      }
      return byte;
    }
  }, {
    key: 'readWord',
    value: function readWord(address, register, cb) {
      var _this3 = this;

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
          _this3[getDevice](address).i2cRead(address, buffer.length, buffer, function (err) {
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
  }, {
    key: 'readWordSync',
    value: function readWordSync(address, register) {
      this.validateAlive();

      checkAddress(address);
      checkRegister(register);

      var byte = void 0;
      if (register === undefined) {
        var buffer = new Buffer(2);
        this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
        byte = buffer.readUInt16LE(0);
      } else {
        byte = this[getDevice](address).readWordSync(address, register);
      }
      return byte;
    }
  }, {
    key: 'write',
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
  }, {
    key: 'writeSync',
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
  }, {
    key: 'writeByte',
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
  }, {
    key: 'writeByteSync',
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
  }, {
    key: 'writeWord',
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
  }, {
    key: 'writeWordSync',
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
  }]);

  return I2C;
}(_raspiPeripheral.Peripheral);

//# sourceMappingURL=data:application/json;base64,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VCxDQURvQjtBQUUxQixlQUFPLGFBQVAsQ0FBcUIsSUFBckIsRUFBMkIsQ0FBM0IsRUFGMEI7QUFHMUIsYUFBSyxTQUFMLEVBQWdCLE9BQWhCLEVBQXlCLFlBQXpCLENBQXNDLE9BQXRDLEVBQStDLE9BQU8sTUFBUCxFQUFlLE1BQTlELEVBSDBCO09BQTVCLE1BSU87QUFDTCxhQUFLLFNBQUwsRUFBZ0IsT0FBaEIsRUFBeUIsYUFBekIsQ0FBdUMsT0FBdkMsRUFBZ0QsUUFBaEQsRUFBMEQsSUFBMUQsRUFESztPQUpQOzs7O1NBblNTIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTUgQnJ5YW4gSHVnaGVzIDxicnlhbkBuZWJyaS51cz5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGkyYyBmcm9tICdpMmMtYnVzJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBQZXJpcGhlcmFsIH0gZnJvbSAncmFzcGktcGVyaXBoZXJhbCc7XG5pbXBvcnQgeyBWRVJTSU9OXzFfTU9ERUxfQl9SRVZfMSwgZ2V0Qm9hcmRSZXZpc2lvbiB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcblxuZnVuY3Rpb24gY2hlY2tBZGRyZXNzKGFkZHJlc3MpIHtcbiAgaWYgKHR5cGVvZiBhZGRyZXNzICE9PSAnbnVtYmVyJyB8fCBhZGRyZXNzIDwgMCB8fCBhZGRyZXNzID4gMHg3Zikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYWRkcmVzcyAnICsgYWRkcmVzc1xuICAgICAgKyAnLiBWYWxpZCBhZGRyZXNzZXMgYXJlIDAgdGhyb3VnaCAweDdmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpIHtcbiAgaWYgKHJlZ2lzdGVyICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICh0eXBlb2YgcmVnaXN0ZXIgIT09ICdudW1iZXInIHx8IHJlZ2lzdGVyIDwgMCB8fCByZWdpc3RlciA+IDB4ZmYpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyByZWdpc3RlciAnICsgcmVnaXN0ZXJcbiAgICAgICsgJy4gVmFsaWQgcmVnaXN0ZXJzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0xlbmd0aChsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiBsZW5ndGggIT09ICdudW1iZXInIHx8IGxlbmd0aCA8IDAgfHwgbGVuZ3RoID4gMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGxlbmd0aCAnICsgbGVuZ3RoXG4gICAgICArICcuIFZhbGlkIGxlbmd0aHMgYXJlIDAgdGhyb3VnaCAzMi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0NhbGxiYWNrKGNiKSB7XG4gIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGNhbGxiYWNrICcgKyBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tCdWZmZXIoYnVmZmVyKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcikgfHwgYnVmZmVyLmxlbmd0aCA8PSAwIHx8IGJ1ZmZlci5sZW5ndGggPiAzMikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYnVmZmVyICcgKyBidWZmZXJcbiAgICAgICsgJy4gVmFsaWQgbGVuZ3RocyBhcmUgMCB0aHJvdWdoIDMyLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQnl0ZShieXRlKSB7XG4gIGlmICh0eXBlb2YgYnl0ZSAhPT0gJ251bWJlcicgfHwgYnl0ZSA8IDAgfHwgYnl0ZSA+IDB4ZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGJ5dGUgJyArIGJ5dGVcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1dvcmQod29yZCkge1xuICBpZiAodHlwZW9mIHdvcmQgIT09ICdudW1iZXInIHx8IHdvcmQgPCAwIHx8IHdvcmQgPiAweGZmZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIHdvcmQgJyArIHdvcmRcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZmZmLidcbiAgICApO1xuICB9XG59XG5cbmNvbnN0IGRldmljZXMgPSBTeW1ib2woJ2RldmljZXMnKTtcbmNvbnN0IGdldERldmljZSA9IFN5bWJvbCgnZ2V0RGV2aWNlJyk7XG5cbmV4cG9ydCBjbGFzcyBJMkMgZXh0ZW5kcyBQZXJpcGhlcmFsIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGxldCBwaW5zID0gb3B0aW9ucztcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGlucykpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgcGlucyA9IG9wdGlvbnMucGlucyB8fCBbICdTREEwJywgJ1NDTDAnIF07XG4gICAgfVxuICAgIHN1cGVyKHBpbnMpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgW2RldmljZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4ZWNTeW5jKCdtb2Rwcm9iZSBpMmMtZGV2Jyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXNbZGV2aWNlc10uZm9yRWFjaChkZXZpY2UgPT4ge1xuICAgICAgZGV2aWNlLmNsb3NlU3luYygpO1xuICAgIH0pO1xuXG4gICAgdGhpc1tkZXZpY2VzXSA9IFtdO1xuXG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgW2dldERldmljZV0oYWRkcmVzcykge1xuICAgIGxldCBkZXZpY2UgPSB0aGlzW2RldmljZXNdW2FkZHJlc3NdO1xuXG4gICAgaWYgKGRldmljZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXZpY2UgPSBpMmMub3BlblN5bmMoZ2V0Qm9hcmRSZXZpc2lvbigpID09PSBWRVJTSU9OXzFfTU9ERUxfQl9SRVZfMSA/IDAgOiAxKTtcbiAgICAgIHRoaXNbZGV2aWNlc11bYWRkcmVzc10gPSBkZXZpY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRldmljZTtcbiAgfVxuXG4gIHJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IGxlbmd0aDtcbiAgICAgIGxlbmd0aCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrTGVuZ3RoKGxlbmd0aCk7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKGxlbmd0aCk7XG4gICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuICAgICAgY2IobnVsbCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZWFkU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgbGVuZ3RoID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tMZW5ndGgobGVuZ3RoKTtcblxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIobGVuZ3RoKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cblxuICByZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXJbMF0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHJlYWRCeXRlU3luYyhhZGRyZXNzLCByZWdpc3Rlcikge1xuICAgIHRoaXMudmFsaWRhdGVBbGl2ZSgpO1xuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuXG4gICAgbGV0IGJ5dGU7XG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICAgIGJ5dGUgPSBidWZmZXJbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ5dGUgPSB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGU7XG4gIH1cblxuICByZWFkV29yZChhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXIucmVhZFVJbnQxNkxFKDApKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZFdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKTtcbiAgICB9XG4gIH1cblxuICByZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcblxuICAgIGxldCBieXRlO1xuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWRTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgICBieXRlID0gYnVmZmVyLnJlYWRVSW50MTZMRSgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnl0ZSA9IHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZTtcbiAgfVxuXG4gIHdyaXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBidWZmZXI7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlSTJjQmxvY2soYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnVmZmVyID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tCdWZmZXIoYnVmZmVyKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBieXRlO1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgMSwgbmV3IEJ1ZmZlcihbYnl0ZV0pLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIDEsIG5ldyBCdWZmZXIoW2J5dGVdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSB3b3JkO1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==