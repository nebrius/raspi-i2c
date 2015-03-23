"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _createComputedClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var prop = props[i]; prop.configurable = true; if (prop.value) prop.writable = true; Object.defineProperty(target, prop.key, prop); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

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

  _createComputedClass(I2C, [{
    key: "destroy",
    value: function destroy() {
      this[devices].forEach(function (device) {
        device.closeSync();
      });

      this[devices] = [];

      _get(Object.getPrototypeOf(I2C.prototype), "destroy", this).call(this);
    }
  }, {
    key: checkAlive,
    value: function () {
      if (!this.alive) {
        throw new Error("Attempted to access a destroyed I2C peripheral");
      }
    }
  }, {
    key: getDevice,
    value: function (address) {
      var device = this[devices][address];

      if (device === undefined) {
        device = i2c.openSync(getBoardRevision() === VERSION_1_MODEL_B_REV_1 ? 0 : 1);
        this[devices][address] = device;
      }

      return device;
    }
  }, {
    key: "read",

    // function cb(err, buffer), returns undefined, register is optional
    // Required by J5
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
  }, {
    key: "readSync",

    // Returns a buffer, register is optional
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
  }, {
    key: "readByte",

    // function cb(err, value), returns undefined, register is optional
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
  }, {
    key: "readByteSync",

    // returns the value, register is optional
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
  }, {
    key: "readWord",

    // function cb(err, value), returns undefined, register is optional
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
  }, {
    key: "readWordSync",

    // returns the value, register is optional
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
  }, {
    key: "write",

    // function cb(err), returns undefined, register is optional
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
  }, {
    key: "writeSync",

    // returns undefined, register is optional
    // Required by J5
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
  }, {
    key: "writeByte",

    // function cb(err), returns undefined, register is optional
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
  }, {
    key: "writeByteSync",

    // returns undefined, register is optional
    // Required by J5
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
  }, {
    key: "writeWord",

    // function cb(err), returns undefined, register is optional
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
  }, {
    key: "writeWordSync",

    // returns undefined, register is optional
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
  }]);

  return I2C;
})(Peripheral);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBd0JPLEdBQUcsMkJBQU0sU0FBUzs7SUFDaEIsUUFBUSxXQUFRLGVBQWUsRUFBL0IsUUFBUTs7SUFDUixVQUFVLFdBQVEsa0JBQWtCLEVBQXBDLFVBQVU7OzBCQUN1QyxhQUFhOztJQUE5RCx1QkFBdUIsZUFBdkIsdUJBQXVCO0lBQUUsZ0JBQWdCLGVBQWhCLGdCQUFnQjs7QUFFbEQsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDbEMsVUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUM7Q0FDcEM7O0FBRUQsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzdCLE1BQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLEdBQUksRUFBRTtBQUNoRSxVQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixHQUFHLE9BQU8sR0FDNUMsdUNBQXVDLENBQzFDLENBQUM7R0FDSDtDQUNGOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRTtBQUMvQixNQUFJLFFBQVEsS0FBSyxTQUFTLEtBQ3JCLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLFFBQVEsR0FBRyxHQUFJLENBQUEsQUFBQyxFQUFFO0FBQ3JFLFVBQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLEdBQUcsUUFBUSxHQUM5Qyx1Q0FBdUMsQ0FDMUMsQ0FBQztHQUNIO0NBQ0Y7O0FBRUQsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQzNCLE1BQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxHQUFHLEVBQUUsRUFBRTtBQUMzRCxVQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixHQUFHLE1BQU0sR0FDMUMsbUNBQW1DLENBQ3RDLENBQUM7R0FDSDtDQUNGOztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQUUsRUFBRTtBQUN6QixNQUFJLE9BQU8sRUFBRSxLQUFLLFVBQVUsRUFBRTtBQUM1QixVQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQyxDQUFDO0dBQy9DO0NBQ0Y7O0FBRUQsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQzNCLE1BQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO0FBQ3hFLFVBQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLEdBQUcsTUFBTSxHQUMxQyxtQ0FBbUMsQ0FDdEMsQ0FBQztHQUNIO0NBQ0Y7O0FBRUQsU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLE1BQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLEdBQUksRUFBRTtBQUN2RCxVQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixHQUFHLElBQUksR0FDdEMsb0NBQW9DLENBQ3ZDLENBQUM7R0FDSDtDQUNGOztBQUVELFNBQVMsU0FBUyxDQUFDLElBQUksRUFBRTtBQUN2QixNQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxLQUFNLEVBQUU7QUFDekQsVUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQ3RDLHNDQUFzQyxDQUN6QyxDQUFDO0dBQ0g7Q0FDRjs7QUFFRCxJQUFJLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQztBQUNuQyxJQUFJLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQztBQUNoQyxJQUFJLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQzs7SUFFckIsR0FBRyxXQUFILEdBQUc7QUFDSCxXQURBLEdBQUcsQ0FDRixPQUFPLEVBQUU7MEJBRFYsR0FBRzs7QUFFWixRQUFJLElBQUksR0FBRyxPQUFPLENBQUM7QUFDbkIsUUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDeEIsYUFBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7QUFDeEIsVUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBRSxNQUFNLEVBQUUsTUFBTSxDQUFFLENBQUM7S0FDM0M7QUFDRCwrQkFQUyxHQUFHLDZDQU9OLElBQUksRUFBRTs7QUFFWixVQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxzQkFDekIsT0FBTyxFQUFHO0FBQ1QsY0FBUSxFQUFFLElBQUk7QUFDZCxXQUFLLEVBQUUsRUFBRTtLQUNWLEVBQ0QsQ0FBQzs7QUFFSCxZQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztHQUM5Qjs7WUFqQlUsR0FBRzs7dUJBQUgsR0FBRzs7V0FtQlAsbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQzlCLGNBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtPQUNuQixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsaUNBMUJTLEdBQUcseUNBMEJJO0tBQ2pCOztTQUVBLFVBQVU7V0FBQyxZQUFHO0FBQ2IsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZixjQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7T0FDbkU7S0FDRjs7U0FFQSxTQUFTO1dBQUMsVUFBQyxPQUFPLEVBQUU7QUFDbkIsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVwQyxVQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDeEIsY0FBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyx1QkFBdUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUUsWUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQztPQUNqQzs7QUFFRCxhQUFPLE1BQU0sQ0FBQztLQUNmOzs7Ozs7V0FJRyxjQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUNsQyxVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQzs7QUFFbkIsVUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxQixVQUFFLEdBQUcsTUFBTSxDQUFDO0FBQ1osY0FBTSxHQUFHLFFBQVEsQ0FBQztBQUNsQixnQkFBUSxHQUFHLFNBQVMsQ0FBQztPQUN0Qjs7QUFFRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLG1CQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsaUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixtQkFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVsQixVQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxlQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDckIsWUFBSSxHQUFHLEVBQUU7QUFDUCxpQkFBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDaEI7QUFDRCxVQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ2xCLENBQUM7O0FBRUYsVUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDckUsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ3BGO0tBQ0Y7Ozs7O1dBR08sa0JBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7QUFDbEMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7O0FBRW5CLFVBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsY0FBTSxHQUFHLFFBQVEsQ0FBQztBQUNsQixnQkFBUSxHQUFHLFNBQVMsQ0FBQztPQUN0Qjs7QUFFRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLG1CQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsaUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFcEIsVUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRWhDLFVBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQixZQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDL0QsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztPQUM5RTs7QUFFRCxhQUFPLE1BQU0sQ0FBQztLQUNmOzs7OztXQUdPLGtCQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQzlCLFVBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDOztBQUVuQixVQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFCLFVBQUUsR0FBRyxRQUFRLENBQUM7QUFDZCxnQkFBUSxHQUFHLFNBQVMsQ0FBQztPQUN0Qjs7QUFFRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLG1CQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsbUJBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFbEIsVUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQUEsR0FBRyxFQUFJO0FBQ3RFLGNBQUksR0FBRyxFQUFFO0FBQ1AsbUJBQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1dBQ2hCO0FBQ0QsWUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyQixDQUFDLENBQUM7T0FDSixNQUFNO0FBQ0wsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQzFEO0tBQ0Y7Ozs7O1dBR1csc0JBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUM5QixVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQzs7QUFFbkIsa0JBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixtQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUV4QixVQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDMUIsWUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNyRSxlQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNsQixNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztPQUNqRTtLQUNGOzs7OztXQUdPLGtCQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQzlCLFVBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDOztBQUVuQixVQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFCLFVBQUUsR0FBRyxRQUFRLENBQUM7QUFDZCxnQkFBUSxHQUFHLFNBQVMsQ0FBQztPQUN0Qjs7QUFFRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLG1CQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsbUJBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFbEIsVUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQUEsR0FBRyxFQUFJO0FBQ3RFLGNBQUksR0FBRyxFQUFFO0FBQ1AsbUJBQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1dBQ2hCO0FBQ0QsWUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEMsQ0FBQyxDQUFDO09BQ0osTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUMxRDtLQUNGOzs7OztXQUdXLHNCQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDOUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7O0FBRW5CLGtCQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEIsbUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFeEIsVUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDckUsZUFBTyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQy9CLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ2pFO0tBQ0Y7Ozs7O1dBR0ksZUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDbkMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7O0FBRW5CLFVBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsVUFBRSxHQUFHLE1BQU0sQ0FBQztBQUNaLGNBQU0sR0FBRyxRQUFRLENBQUM7QUFDbEIsZ0JBQVEsR0FBRyxTQUFTLENBQUM7T0FDdEI7O0FBRUQsa0JBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixtQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsbUJBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFbEIsVUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQ3ZFLE1BQU07QUFDTCxZQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDdEY7S0FDRjs7Ozs7O1dBSVEsbUJBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7QUFDbkMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7O0FBRW5CLFVBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsY0FBTSxHQUFHLFFBQVEsQ0FBQztBQUNsQixnQkFBUSxHQUFHLFNBQVMsQ0FBQztPQUN0Qjs7QUFFRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLG1CQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsaUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFcEIsVUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDdkUsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDdEY7S0FDRjs7Ozs7V0FHUSxtQkFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDckMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7O0FBRW5CLFVBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsVUFBRSxHQUFHLElBQUksQ0FBQztBQUNWLFlBQUksR0FBRyxRQUFRLENBQUM7QUFDaEIsZ0JBQVEsR0FBRyxTQUFTLENBQUM7T0FDdEI7O0FBRUQsa0JBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixtQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hCLGVBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQixtQkFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVsQixVQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDMUIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN2RSxNQUFNO0FBQ0wsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztPQUNqRTtLQUNGOzs7Ozs7V0FJWSx1QkFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtBQUNyQyxVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQzs7QUFFbkIsVUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxQixZQUFJLEdBQUcsUUFBUSxDQUFDO0FBQ2hCLGdCQUFRLEdBQUcsU0FBUyxDQUFDO09BQ3RCOztBQUVELGtCQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEIsbUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QixlQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWhCLFVBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQixZQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDdkUsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUNqRTtLQUNGOzs7OztXQUdRLG1CQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUNyQyxVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQzs7QUFFbkIsVUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxQixVQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ1YsWUFBSSxHQUFHLFFBQVEsQ0FBQztBQUNoQixnQkFBUSxHQUFHLFNBQVMsQ0FBQztPQUN0Qjs7QUFFRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLG1CQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsZUFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hCLG1CQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRWxCLFVBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQixZQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixjQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QixZQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN2RSxNQUFNO0FBQ0wsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztPQUNqRTtLQUNGOzs7OztXQUdZLHVCQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ3JDLFVBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDOztBQUVuQixVQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFCLFlBQUksR0FBRyxRQUFRLENBQUM7QUFDaEIsZ0JBQVEsR0FBRyxTQUFTLENBQUM7T0FDdEI7O0FBRUQsa0JBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixtQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hCLGVBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFaEIsVUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLGNBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDdkUsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUNqRTtLQUNGOzs7U0EzVFUsR0FBRztHQUFTLFVBQVUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT4gKGh0dHA6Ly90aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20pXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBpMmMgZnJvbSAnaTJjLWJ1cyc7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgUGVyaXBoZXJhbCB9IGZyb20gJ3Jhc3BpLXBlcmlwaGVyYWwnO1xuaW1wb3J0IHsgVkVSU0lPTl8xX01PREVMX0JfUkVWXzEsIGdldEJvYXJkUmV2aXNpb24gfSBmcm9tICdyYXNwaS1ib2FyZCc7XG5cbmlmICh0eXBlb2YgZXhlY1N5bmMgIT09ICdmdW5jdGlvbicpIHtcbiAgZXhlY1N5bmMgPSByZXF1aXJlKCdleGVjU3luYycpLnJ1bjtcbn1cblxuZnVuY3Rpb24gY2hlY2tBZGRyZXNzKGFkZHJlc3MpIHtcbiAgaWYgKHR5cGVvZiBhZGRyZXNzICE9PSAnbnVtYmVyJyB8fCBhZGRyZXNzIDwgMCB8fCBhZGRyZXNzID4gMHg3Zikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYWRkcmVzcyAnICsgYWRkcmVzc1xuICAgICAgKyAnLiBWYWxpZCBhZGRyZXNzZXMgYXJlIDAgdGhyb3VnaCAweDdmLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpIHtcbiAgaWYgKHJlZ2lzdGVyICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICh0eXBlb2YgcmVnaXN0ZXIgIT09ICdudW1iZXInIHx8IHJlZ2lzdGVyIDwgMCB8fCByZWdpc3RlciA+IDB4ZmYpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEkyQyByZWdpc3RlciAnICsgcmVnaXN0ZXJcbiAgICAgICsgJy4gVmFsaWQgcmVnaXN0ZXJzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0xlbmd0aChsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiBsZW5ndGggIT09ICdudW1iZXInIHx8IGxlbmd0aCA8IDAgfHwgbGVuZ3RoID4gMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGxlbmd0aCAnICsgbGVuZ3RoXG4gICAgICArICcuIFZhbGlkIGxlbmd0aHMgYXJlIDAgdGhyb3VnaCAzMi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0NhbGxiYWNrKGNiKSB7XG4gIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGNhbGxiYWNrICcgKyBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tCdWZmZXIoYnVmZmVyKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcikgfHwgYnVmZmVyLmxlbmd0aCA8PSAwIHx8IGJ1ZmZlci5sZW5ndGggPiAzMikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBJMkMgYnVmZmVyICcgKyBidWZmZXJcbiAgICAgICsgJy4gVmFsaWQgbGVuZ3RocyBhcmUgMCB0aHJvdWdoIDMyLidcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQnl0ZShieXRlKSB7XG4gIGlmICh0eXBlb2YgYnl0ZSAhPT0gJ251bWJlcicgfHwgYnl0ZSA8IDAgfHwgYnl0ZSA+IDB4ZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGJ5dGUgJyArIGJ5dGVcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZi4nXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1dvcmQod29yZCkge1xuICBpZiAodHlwZW9mIHdvcmQgIT09ICdudW1iZXInIHx8IHdvcmQgPCAwIHx8IHdvcmQgPiAweGZmZmYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIHdvcmQgJyArIHdvcmRcbiAgICAgICsgJy4gVmFsaWQgdmFsdWVzIGFyZSAwIHRocm91Z2ggMHhmZmZmLidcbiAgICApO1xuICB9XG59XG5cbnZhciBjaGVja0FsaXZlID0gJ19fciQzOTY4MzZfMCRfXyc7XG52YXIgZGV2aWNlcyA9ICdfX3IkMzk2ODM2XzEkX18nO1xudmFyIGdldERldmljZSA9ICdfX3IkMzk2ODM2XzIkX18nO1xuXG5leHBvcnQgY2xhc3MgSTJDIGV4dGVuZHMgUGVyaXBoZXJhbCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB2YXIgcGlucyA9IG9wdGlvbnM7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBpbnMpKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHBpbnMgPSBvcHRpb25zLnBpbnMgfHwgWyAnU0RBMCcsICdTQ0wwJyBdO1xuICAgIH1cbiAgICBzdXBlcihwaW5zKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIFtkZXZpY2VzXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBleGVjU3luYygnbW9kcHJvYmUgaTJjLWRldicpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzW2RldmljZXNdLmZvckVhY2goZGV2aWNlID0+IHtcbiAgICAgIGRldmljZS5jbG9zZVN5bmMoKVxuICAgIH0pO1xuXG4gICAgdGhpc1tkZXZpY2VzXSA9IFtdO1xuXG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgW2NoZWNrQWxpdmVdKCkge1xuICAgIGlmICghdGhpcy5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gYWNjZXNzIGEgZGVzdHJveWVkIEkyQyBwZXJpcGhlcmFsJyk7XG4gICAgfVxuICB9XG5cbiAgW2dldERldmljZV0oYWRkcmVzcykge1xuICAgIHZhciBkZXZpY2UgPSB0aGlzW2RldmljZXNdW2FkZHJlc3NdO1xuXG4gICAgaWYgKGRldmljZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXZpY2UgPSBpMmMub3BlblN5bmMoZ2V0Qm9hcmRSZXZpc2lvbigpID09PSBWRVJTSU9OXzFfTU9ERUxfQl9SRVZfMSA/IDAgOiAxKTtcbiAgICAgIHRoaXNbZGV2aWNlc11bYWRkcmVzc10gPSBkZXZpY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRldmljZTtcbiAgfVxuXG4gIC8vIGZ1bmN0aW9uIGNiKGVyciwgYnVmZmVyKSwgcmV0dXJucyB1bmRlZmluZWQsIHJlZ2lzdGVyIGlzIG9wdGlvbmFsXG4gIC8vIFJlcXVpcmVkIGJ5IEo1XG4gIHJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgY2IpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBsZW5ndGg7XG4gICAgICBsZW5ndGggPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0xlbmd0aChsZW5ndGgpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIobGVuZ3RoKTtcbiAgICBmdW5jdGlvbiBjYWxsYmFjayhlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICB9XG4gICAgICBjYihudWxsLCBidWZmZXIpO1xuICAgIH07XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRJMmNCbG9jayhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgYnVmZmVyLCByZWdpc3RlciBpcyBvcHRpb25hbFxuICByZWFkU3luYyhhZGRyZXNzLCByZWdpc3RlciwgbGVuZ3RoKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGxlbmd0aCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrTGVuZ3RoKGxlbmd0aCk7XG5cbiAgICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcihsZW5ndGgpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNSZWFkU3luYyhhZGRyZXNzLCBsZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkSTJjQmxvY2tTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBsZW5ndGgsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIC8vIGZ1bmN0aW9uIGNiKGVyciwgdmFsdWUpLCByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgcmVhZEJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNiID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZChhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCBidWZmZXJbMF0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5yZWFkQnl0ZShhZGRyZXNzLCByZWdpc3RlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybnMgdGhlIHZhbHVlLCByZWdpc3RlciBpcyBvcHRpb25hbFxuICByZWFkQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIoMSk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjUmVhZFN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICAgIHJldHVybiBidWZmZXJbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKTtcbiAgICB9XG4gIH1cblxuICAvLyBmdW5jdGlvbiBjYihlcnIsIHZhbHVlKSwgcmV0dXJucyB1bmRlZmluZWQsIHJlZ2lzdGVyIGlzIG9wdGlvbmFsXG4gIHJlYWRXb3JkKGFkZHJlc3MsIHJlZ2lzdGVyLCBjYikge1xuICAgIHRoaXNbY2hlY2tBbGl2ZV0oKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjYiA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1JlYWQoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgY2IobnVsbCwgYnVmZmVyLnJlYWRVSW50MTZMRSgwKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLnJlYWRXb3JkKGFkZHJlc3MsIHJlZ2lzdGVyLCBjYik7XG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJucyB0aGUgdmFsdWUsIHJlZ2lzdGVyIGlzIG9wdGlvbmFsXG4gIHJlYWRXb3JkU3luYyhhZGRyZXNzLCByZWdpc3Rlcikge1xuICAgIHRoaXNbY2hlY2tBbGl2ZV0oKTtcblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcigyKTtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNSZWFkU3luYyhhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIpO1xuICAgICAgcmV0dXJuIGJ1ZmZlci5yZWFkVUludDE2TEUoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzW2dldERldmljZV0oYWRkcmVzcykucmVhZFdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKTtcbiAgICB9XG4gIH1cblxuICAvLyBmdW5jdGlvbiBjYihlcnIpLCByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgd3JpdGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlciwgY2IpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY2IgPSBidWZmZXI7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZShhZGRyZXNzLCBidWZmZXIubGVuZ3RoLCBidWZmZXIsIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlSTJjQmxvY2soYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlciwgY2IpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybnMgdW5kZWZpbmVkLCByZWdpc3RlciBpcyBvcHRpb25hbFxuICAvLyBSZXF1aXJlZCBieSBKNVxuICB3cml0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlcikge1xuICAgIHRoaXNbY2hlY2tBbGl2ZV0oKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBidWZmZXIgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J1ZmZlcihidWZmZXIpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS5pMmNXcml0ZVN5bmMoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLndyaXRlSTJjQmxvY2tTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIubGVuZ3RoLCBidWZmZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGZ1bmN0aW9uIGNiKGVyciksIHJldHVybnMgdW5kZWZpbmVkLCByZWdpc3RlciBpcyBvcHRpb25hbFxuICB3cml0ZUJ5dGUoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUsIGNiKSB7XG4gICAgdGhpc1tjaGVja0FsaXZlXSgpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgIGNiID0gYnl0ZTtcbiAgICAgIGJ5dGUgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNoZWNrQWRkcmVzcyhhZGRyZXNzKTtcbiAgICBjaGVja1JlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICBjaGVja0J5dGUoYnl0ZSk7XG4gICAgY2hlY2tDYWxsYmFjayhjYik7XG5cbiAgICBpZiAocmVnaXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpc1tnZXREZXZpY2VdKGFkZHJlc3MpLmkyY1dyaXRlKGFkZHJlc3MsIDEsIG5ldyBCdWZmZXIoW2J5dGVdKSwgY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykud3JpdGVCeXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlLCBjYik7XG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJucyB1bmRlZmluZWQsIHJlZ2lzdGVyIGlzIG9wdGlvbmFsXG4gIC8vIFJlcXVpcmVkIGJ5IEo1XG4gIHdyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGUpIHtcbiAgICB0aGlzW2NoZWNrQWxpdmVdKCk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgYnl0ZSA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2hlY2tBZGRyZXNzKGFkZHJlc3MpO1xuICAgIGNoZWNrUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIGNoZWNrQnl0ZShieXRlKTtcblxuICAgIGlmIChyZWdpc3RlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIDEsIG5ldyBCdWZmZXIoW2J5dGVdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlKTtcbiAgICB9XG4gIH1cblxuICAvLyBmdW5jdGlvbiBjYihlcnIpLCByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgd3JpdGVXb3JkKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkLCBjYikge1xuICAgIHRoaXNbY2hlY2tBbGl2ZV0oKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICBjYiA9IHdvcmQ7XG4gICAgICB3b3JkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tXb3JkKHdvcmQpO1xuICAgIGNoZWNrQ2FsbGJhY2soY2IpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGUoYWRkcmVzcywgYnVmZmVyLmxlbmd0aCwgYnVmZmVyLCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIHdvcmQsIGNiKTtcbiAgICB9XG4gIH1cblxuICAvLyByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgd3JpdGVXb3JkU3luYyhhZGRyZXNzLCByZWdpc3Rlciwgd29yZCkge1xuICAgIHRoaXNbY2hlY2tBbGl2ZV0oKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICB3b3JkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjaGVja0FkZHJlc3MoYWRkcmVzcyk7XG4gICAgY2hlY2tSZWdpc3RlcihyZWdpc3Rlcik7XG4gICAgY2hlY2tXb3JkKHdvcmQpO1xuXG4gICAgaWYgKHJlZ2lzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUod29yZCwgMCk7XG4gICAgICB0aGlzW2dldERldmljZV0oYWRkcmVzcykuaTJjV3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlci5sZW5ndGgsIGJ1ZmZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbZ2V0RGV2aWNlXShhZGRyZXNzKS53cml0ZVdvcmRTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==