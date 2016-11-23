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

function checkLength(length, register) {
  if (typeof length !== 'number' || length < 0 || register !== undefined && length > 32) {
    // Enforce 32 byte length limit only for SMBus.
    throw new Error('Invalid I2C length ' + length + '. Valid lengths are 0 through 32.');
  }
}

function checkCallback(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid I2C callback ' + cb);
  }
}

function checkBuffer(buffer, register) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 0 || register !== undefined && buffer.length > 32) {
    // Enforce 32 byte length limit only for SMBus.
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

    var _this = _possibleConstructorReturn(this, (I2C.__proto__ || Object.getPrototypeOf(I2C)).call(this, pins));

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

      _get(I2C.prototype.__proto__ || Object.getPrototypeOf(I2C.prototype), 'destroy', this).call(this);
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
      checkLength(length, register);
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
      checkLength(length, register);

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
      checkBuffer(buffer, register);
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
      checkBuffer(buffer, register);

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

//# sourceMappingURL=data:application/json;base64,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bEU7QUFDRCxPQUpELE1BSU87QUFDTCxhQUFLLFNBQUwsRUFBZ0IsT0FBaEIsRUFBeUIsU0FBekIsQ0FBbUMsT0FBbkMsRUFBNEMsUUFBNUMsRUFBc0QsSUFBdEQsRUFBNEQsRUFBNUQ7QUFDRDtBQUNGOzs7a0NBRWEsTyxFQUFTLFEsRUFBVSxJLEVBQU07QUFDckMsV0FBSyxhQUFMOztBQUVBLFVBQUksVUFBVSxNQUFWLEtBQXFCLENBQXpCLEVBQTRCO0FBQzFCLGVBQU8sUUFBUDtBQUNBLG1CQUFXLFNBQVg7QUFDRDs7QUFFRCxtQkFBYSxPQUFiO0FBQ0Esb0JBQWMsUUFBZDtBQUNBLGdCQUFVLElBQVY7O0FBRUEsVUFBSSxhQUFhLFNBQWpCLEVBQTRCO0FBQzFCLFlBQU0sU0FBUyxJQUFJLE1BQUosQ0FBVyxDQUFYLENBQWY7QUFDQSxlQUFPLGFBQVAsQ0FBcUIsSUFBckIsRUFBMkIsQ0FBM0I7QUFDQSxhQUFLLFNBQUwsRUFBZ0IsT0FBaEIsRUFBeUIsWUFBekIsQ0FBc0MsT0FBdEMsRUFBK0MsT0FBTyxNQUF0RCxFQUE4RCxNQUE5RDtBQUNELE9BSkQsTUFJTztBQUNMLGFBQUssU0FBTCxFQUFnQixPQUFoQixFQUF5QixhQUF6QixDQUF1QyxPQUF2QyxFQUFnRCxRQUFoRCxFQUEwRCxJQUExRDtBQUNEO0FBQ0YiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNSBCcnlhbiBIdWdoZXMgPGJyeWFuQG5lYnJpLnVzPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgaTJjIGZyb20gJ2kyYy1idXMnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IFBlcmlwaGVyYWwgfSBmcm9tICdyYXNwaS1wZXJpcGhlcmFsJztcbmltcG9ydCB7IFZFUlNJT05fMV9NT0RFTF9CX1JFVl8xLCBnZXRCb2FyZFJldmlzaW9uIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuXG5mdW5jdGlvbiBjaGVja0FkZHJlc3MoYWRkcmVzcykge1xuICBpZiAodHlwZW9mIGFkZHJlc3MgIT09ICdudW1iZXInIHx8IGFkZHJlc3MgPCAwIHx8IGFkZHJlc3MgPiAweDdmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBhZGRyZXNzICcgKyBhZGRyZXNzXG4gICAgICArICcuIFZhbGlkIGFkZHJlc3NlcyBhcmUgMCB0aHJvdWdoIDB4N2YuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tSZWdpc3RlcihyZWdpc3Rlcikge1xuICBpZiAocmVnaXN0ZXIgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgKHR5cGVvZiByZWdpc3RlciAhPT0gJ251bWJlcicgfHwgcmVnaXN0ZXIgPCAwIHx8IHJlZ2lzdGVyID4gMHhmZikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIHJlZ2lzdGVyICcgKyByZWdpc3RlclxuICAgICAgKyAnLiBWYWxpZCByZWdpc3RlcnMgYXJlIDAgdGhyb3VnaCAweGZmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrTGVuZ3RoKGxlbmd0aCwgcmVnaXN0ZXIpIHtcbiAgaWYgKHR5cGVvZiBsZW5ndGggIT09ICdudW1iZXInIHx8IGxlbmd0aCA8IDAgfHxcbiAgICAgIChyZWdpc3RlciAhPT0gdW5kZWZpbmVkICYmIGxlbmd0aCA+IDMyKSkge1xuICAgIC8vIEVuZm9yY2UgMzIgYnl0ZSBsZW5ndGggbGltaXQgb25seSBmb3IgU01CdXMuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBsZW5ndGggJyArIGxlbmd0aFxuICAgICAgKyAnLiBWYWxpZCBsZW5ndGhzIGFyZSAwIHRocm91Z2ggMzIuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tDYWxsYmFjayhjYikge1xuICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBjYWxsYmFjayAnICsgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQnVmZmVyKGJ1ZmZlciwgcmVnaXN0ZXIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmZmVyKSB8fCBidWZmZXIubGVuZ3RoIDwgMCB8fFxuICAgICAgKHJlZ2lzdGVyICE9PSB1bmRlZmluZWQgJiYgYnVmZmVyLmxlbmd0aCA+IDMyKSkge1xuICAgIC8vIEVuZm9yY2UgMzIgYnl0ZSBsZW5ndGggbGltaXQgb25seSBmb3IgU01CdXMuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyBidWZmZXIgJyArIGJ1ZmZlclxuICAgICAgKyAnLiBWYWxpZCBsZW5ndGhzIGFyZSAwIHRocm91Z2ggMzIuJ1xuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tCeXRlKGJ5dGUpIHtcbiAgaWYgKHR5cGVvZiBieXRlICE9PSAnbnVtYmVyJyB8fCBieXRlIDwgMCB8fCBieXRlID4gMHhmZikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYnl0ZSAnICsgYnl0ZVxuICAgICAgKyAnLiBWYWxpZCB2YWx1ZXMgYXJlIDAgdGhyb3VnaCAweGZmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrV29yZCh3b3JkKSB7XG4gIGlmICh0eXBlb2Ygd29yZCAhPT0gJ251bWJlcicgfHwgd29yZCA8IDAgfHwgd29yZCA+IDB4ZmZmZikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgd29yZCAnICsgd29yZFxuICAgICAgKyAnLiBWYWxpZCB2YWx1ZXMgYXJlIDAgdGhyb3VnaCAweGZmZmYuJ1xuICAgICk7XG4gIH1cbn1cblxuY29uc3QgZGV2aWNlcyA9IFN5bWJvbCgnZGV2aWNlcycpO1xuY29uc3QgZ2V0RGV2aWNlID0gU3ltYm9sKCdnZXREZXZpY2UnKTtcblxuZXhwb3J0IGNsYXNzIEkyQyBleHRlbmRzIFBlcmlwaGVyYWwge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgbGV0IHBpbnMgPSBvcHRpb25zO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwaW5zKSkge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBwaW5zID0gb3B0aW9ucy5waW5zIHx8IFsgJ1NEQTAnLCAnU0NMMCcgXTtcbiAgICB9XG4gICAgc3VwZXIocGlucyk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBbZGV2aWNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhlY1N5bmMoJ21vZHByb2JlIGkyYy1kZXYnKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpc1tkZXZpY2VzXS5mb3JFYWNoKGRldmljZSA9PiB7XG4gICAgICBkZXZpY2UuY2xvc2VTeW5jKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzW2RldmljZXNdID0gW107XG5cbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cblxuICBbZ2V0RGV2aWNlXShhZGRyZXNzKSB7XG4gICAgbGV0IGRldmljZSA9IHRoaXNbZGV2aWNlc11bYWRkcmVzc107XG5cbiAgICBpZiAoZGV2aWNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRldmljZSA9IGkyYy5vcGVuU3luYyhnZXRCb2FyZFJldmlzaW9uKCkgPT09IFZFUlNJT05fMV9NT0RFTF9CX1JFVl8xID8gMCA6IDEpO1xuICAgICAgdGhpc1tkZXZpY2VzXVthZGRyZXNzXSA9IGRldmljZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGV2aWNlO1xuICB9XG5cbiAgcmVhZChhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBjYikge1xuICAgIHRoaXMudmFsaWRhdGVBbGl2ZSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgIGNiID0gbGVuZ3RoO1xuICAgICAgbGVuZ3RoID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tMZW5ndGgobGVuZ3RoLCByZWdpc3Rlcik7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKGxlbmd0aCk7XG4gICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgfVxuICAgICAgY2IobnVsbCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZWFkU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgbGVuZ3RoID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tMZW5ndGgobGVuZ3RoLCByZWdpc3Rlcik7XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKGxlbmd0aCk7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWRTeW5jKGFkZHJlc3MsIGxlbmd0aCwgYnVmZmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9ja1N5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgcmVhZEJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY2IgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDEpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgY2IobnVsbCwgYnVmZmVyWzBdKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKTtcbiAgICB9XG4gIH1cblxuICByZWFkQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcblxuICAgIGxldCBieXRlO1xuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDEpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWRTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgICBieXRlID0gYnVmZmVyWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBieXRlID0gdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRCeXRlU3luYyhhZGRyZXNzLCByZWdpc3Rlcik7XG4gICAgfVxuICAgIHJldHVybiBieXRlO1xuICB9XG5cbiAgcmVhZFdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY2IgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgY2IobnVsbCwgYnVmZmVyLnJlYWRVSW50MTZMRSgwKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRXb3JkKGFkZHJlc3MsIHJlZ2lzdGVyLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcmVhZFdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG5cbiAgICBsZXQgYnl0ZTtcbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcigyKTtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNSZWFkU3luYyhhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIpO1xuICAgICAgYnl0ZSA9IGJ1ZmZlci5yZWFkVUludDE2TEUoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ5dGUgPSB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZFdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGU7XG4gIH1cblxuICB3cml0ZShhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyLCBjYikge1xuICAgIHRoaXMudmFsaWRhdGVBbGl2ZSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgIGNiID0gYnVmZmVyO1xuICAgICAgYnVmZmVyID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tCdWZmZXIoYnVmZmVyLCByZWdpc3Rlcik7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1dyaXRlKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykud3JpdGVJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfVxuICB9XG5cbiAgd3JpdGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpdmUoKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIsIHJlZ2lzdGVyKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUkyY0Jsb2NrU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBieXRlO1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgMSwgbmV3IEJ1ZmZlcihbYnl0ZV0pLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIDEsIG5ldyBCdWZmZXIoW2J5dGVdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSB3b3JkO1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcbiAgICBjaGVja0NhbGxiYWNrKGNiKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKTtcbiAgICB9XG4gIH1cblxuICB3cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaXZlKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgd29yZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrV29yZCh3b3JkKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==