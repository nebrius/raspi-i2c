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

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _i2cBus = require('i2c-bus');

var _i2cBus2 = _interopRequireDefault(_i2cBus);

var _child_process = require('child_process');

var _raspiPeripheral = require('raspi-peripheral');

var _raspiBoard = require('raspi-board');

// Hacky quick Symbol polyfill, since es6-symbol refuses to install with Node 0.10 from http://node-arm.herokuapp.com/
if (typeof global.Symbol != 'function') {
  global.Symbol = function (name) {
    return '__$raspi_symbol_' + name + '_' + Math.round(Math.random() * 0xFFFFFFF) + '$__';
  };
}

var execSync = _child_process.execSync;
if (typeof execSync !== 'function') {
  execSync = require('execSync').run;
}

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

var I2C = (function (_Peripheral) {
  _inherits(I2C, _Peripheral);

  function I2C(options) {
    _classCallCheck(this, I2C);

    var pins = options;
    if (!Array.isArray(pins)) {
      options = options || {};
      pins = options.pins || ['SDA0', 'SCL0'];
    }
    _get(Object.getPrototypeOf(I2C.prototype), 'constructor', this).call(this, pins);

    Object.defineProperties(this, _defineProperty({}, devices, {
      writable: true,
      value: []
    }));

    execSync('modprobe i2c-dev');
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
        device = _i2cBus2['default'].openSync((0, _raspiBoard.getBoardRevision)() === _raspiBoard.VERSION_1_MODEL_B_REV_1 ? 0 : 1);
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
  }, {
    key: 'readByteSync',
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
  }, {
    key: 'readWord',
    value: function readWord(address, register, cb) {
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
          var buffer = new Buffer(2);
          _this2[getDevice](address).i2cRead(address, buffer.length, buffer, function (err) {
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
})(_raspiPeripheral.Peripheral);

exports.I2C = I2C;
//# sourceMappingURL=data:application/json;base64,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USxDQUFDLENBQUM7QUFDeEIsZUFBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVoQixVQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDMUIsWUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsY0FBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztPQUN2RSxNQUFNO0FBQ0wsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ2pFO0tBQ0Y7OztTQTFTVSxHQUFHIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTUgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBpMmMgZnJvbSAnaTJjLWJ1cyc7XG5pbXBvcnQgeyBleGVjU3luYyBhcyBuYXRpdmVFeGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgUGVyaXBoZXJhbCB9IGZyb20gJ3Jhc3BpLXBlcmlwaGVyYWwnO1xuaW1wb3J0IHsgVkVSU0lPTl8xX01PREVMX0JfUkVWXzEsIGdldEJvYXJkUmV2aXNpb24gfSBmcm9tICdyYXNwaS1ib2FyZCc7XG5cbi8vIEhhY2t5IHF1aWNrIFN5bWJvbCBwb2x5ZmlsbCwgc2luY2UgZXM2LXN5bWJvbCByZWZ1c2VzIHRvIGluc3RhbGwgd2l0aCBOb2RlIDAuMTAgZnJvbSBodHRwOi8vbm9kZS1hcm0uaGVyb2t1YXBwLmNvbS9cbmlmICh0eXBlb2YgZ2xvYmFsLlN5bWJvbCAhPSAnZnVuY3Rpb24nKSB7XG4gIGdsb2JhbC5TeW1ib2wgPSAobmFtZSkgPT4ge1xuICAgIHJldHVybiAnX18kcmFzcGlfc3ltYm9sXycgKyBuYW1lICsgJ18nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMHhGRkZGRkZGKSArICckX18nO1xuICB9O1xufVxuXG5sZXQgZXhlY1N5bmMgPSBuYXRpdmVFeGVjU3luYztcbmlmICh0eXBlb2YgZXhlY1N5bmMgIT09ICdmdW5jdGlvbicpIHtcbiAgZXhlY1N5bmMgPSByZXF1aXJlKCdleGVjU3luYycpLnJ1bjtcbn1cblxuZnVuY3Rpb24gY2hlY2tBZGRyZXNzKGFkZHJlc3MpIHtcbiAgaWYgKHR5cGVvZiBhZGRyZXNzICE9PSAnbnVtYmVyJyB8fCBhZGRyZXNzIDwgMCB8fCBhZGRyZXNzID4gMHg3Zikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYWRkcmVzcyAnICsgYWRkcmVzc1xuICAgICAgKyAnLiBWYWxpZCBhZGRyZXNzZXMgYXJlIDAgdGhyb3VnaCAweDdmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpIHtcbiAgaWYgKHJlZ2lzdGVyICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICh0eXBlb2YgcmVnaXN0ZXIgIT09ICdudW1iZXInIHx8IHJlZ2lzdGVyIDwgMCB8fCByZWdpc3RlciA+IDB4ZmYpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyByZWdpc3RlciAnICsgcmVnaXN0ZXJcbiAgICAgICsgJy4gVmFsaWQgcmVnaXN0ZXJzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0xlbmd0aChsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiBsZW5ndGggIT09ICdudW1iZXInIHx8IGxlbmd0aCA8IDAgfHwgbGVuZ3RoID4gMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGxlbmd0aCAnICsgbGVuZ3RoXG4gICAgICArICcuIFZhbGlkIGxlbmd0aHMgYXJlIDAgdGhyb3VnaCAzMi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0NhbGxiYWNrKGNiKSB7XG4gIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGNhbGxiYWNrICcgKyBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tCdWZmZXIoYnVmZmVyKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcikgfHwgYnVmZmVyLmxlbmd0aCA8PSAwIHx8IGJ1ZmZlci5sZW5ndGggPiAzMikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYnVmZmVyICcgKyBidWZmZXJcbiAgICAgICsgJy4gVmFsaWQgbGVuZ3RocyBhcmUgMCB0aHJvdWdoIDMyLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQnl0ZShieXRlKSB7XG4gIGlmICh0eXBlb2YgYnl0ZSAhPT0gJ251bWJlcicgfHwgYnl0ZSA8IDAgfHwgYnl0ZSA+IDB4ZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGJ5dGUgJyArIGJ5dGVcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1dvcmQod29yZCkge1xuICBpZiAodHlwZW9mIHdvcmQgIT09ICdudW1iZXInIHx8IHdvcmQgPCAwIHx8IHdvcmQgPiAweGZmZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIHdvcmQgJyArIHdvcmRcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZmZmLidcbiAgICApO1xuICB9XG59XG5cbmNvbnN0IGRldmljZXMgPSBTeW1ib2woJ2RldmljZXMnKTtcbmNvbnN0IGdldERldmljZSA9IFN5bWJvbCgnZ2V0RGV2aWNlJyk7XG5cbmV4cG9ydCBjbGFzcyBJMkMgZXh0ZW5kcyBQZXJpcGhlcmFsIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGxldCBwaW5zID0gb3B0aW9ucztcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGlucykpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgcGlucyA9IG9wdGlvbnMucGlucyB8fCBbICdTREEwJywgJ1NDTDAnIF07XG4gICAgfVxuICAgIHN1cGVyKHBpbnMpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgW2RldmljZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4ZWNTeW5jKCdtb2Rwcm9iZSBpMmMtZGV2Jyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXNbZGV2aWNlc10uZm9yRWFjaChkZXZpY2UgPT4ge1xuICAgICAgZGV2aWNlLmNsb3NlU3luYygpO1xuICAgIH0pO1xuXG4gICAgdGhpc1tkZXZpY2VzXSA9IFtdO1xuXG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgW2dldERldmljZV0oYWRkcmVzcykge1xuICAgIGxldCBkZXZpY2UgPSB0aGlzW2RldmljZXNdW2FkZHJlc3NdO1xuXG4gICAgaWYgKGRldmljZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXZpY2UgPSBpMmMub3BlblN5bmMoZ2V0Qm9hcmRSZXZpc2lvbigpID09PSBWRVJTSU9OXzFfTU9ERUxfQl9SRVZfMSA/IDAgOiAxKTtcbiAgICAgIHRoaXNbZGV2aWNlc11bYWRkcmVzc10gPSBkZXZpY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRldmljZTtcbiAgfVxuXG4gIHJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IGxlbmd0aDtcbiAgICAgIGxlbmd0aCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrTGVuZ3RoKGxlbmd0aCk7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKGxlbmd0aCk7XG4gICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuICAgICAgY2IobnVsbCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZWFkU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgbGVuZ3RoID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tMZW5ndGgobGVuZ3RoKTtcblxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIobGVuZ3RoKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cblxuICByZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXJbMF0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHJlYWRCeXRlU3luYyhhZGRyZXNzLCByZWdpc3Rlcikge1xuICAgIHRoaXMudmFsaWRhdGVBbGl2ZSgpO1xuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuXG4gICAgbGV0IGJ5dGU7XG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICAgIGJ5dGUgPSBidWZmZXJbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ5dGUgPSB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGU7XG4gIH1cblxuICByZWFkV29yZChhZGRyZXNzLCByZWdpc3RlciwgY2IpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXIucmVhZFVJbnQxNkxFKDApKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZFdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKTtcbiAgICB9XG4gIH1cblxuICByZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcblxuICAgIGxldCBieXRlO1xuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWRTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgICBieXRlID0gYnVmZmVyLnJlYWRVSW50MTZMRSgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnl0ZSA9IHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZTtcbiAgfVxuXG4gIHdyaXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBidWZmZXI7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlSTJjQmxvY2soYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnVmZmVyID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tCdWZmZXIoYnVmZmVyKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBieXRlO1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgMSwgbmV3IEJ1ZmZlcihbYnl0ZV0pLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIDEsIG5ldyBCdWZmZXIoW2J5dGVdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSB3b3JkO1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
