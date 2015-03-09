"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var sh = _interopRequire(require("execSync"));

var Peripheral = require("raspi-peripheral").Peripheral;

var I2C = exports.I2C = (function (_Peripheral) {
  function I2C(baudRate, pins) {
    _classCallCheck(this, I2C);

    _get(Object.getPrototypeOf(I2C.prototype), "constructor", this).call(this, pins || ["SDA0", "SCL0"]);
    if (baudRate) {
      if (typeof baudRate != number || baudRate % 1000 != 0) {
        throw new Error("Invalid I2C baud rate. Baud rates must be a multiple of 1000");
      }
      sh.run("gpio load i2c " + baudRate);
    } else {
      sh.run("gpio load i2c"); // Is this still necessary?
    }
  }

  _inherits(I2C, _Peripheral);

  _createClass(I2C, {
    destroy: {
      value: function destroy() {
        _get(Object.getPrototypeOf(I2C.prototype), "destroy", this).call(this);
      }
    },
    i2cRead: {

      // function cb(err, buffer), returns undefined, register is optional

      value: function i2cRead(address, register, length, cb) {
        throw new Error("Not implemented");
      }
    },
    i2cReadSync: {

      // Returns a buffer, register is optional

      value: function i2cReadSync(address, register, length) {
        throw new Error("Not implemented");
      }
    },
    readByte: {

      // function cb(err, value), returns undefined, register is optional

      value: function readByte(address, register, cb) {
        throw new Error("Not implemented");
      }
    },
    readByteSync: {

      // returns the value, register is optional

      value: function readByteSync(address, register) {
        throw new Error("Not implemented");
      }
    },
    readWord: {

      // function cb(err, value), returns undefined, register is optional

      value: function readWord(address, register, cb) {
        throw new Error("Not implemented");
      }
    },
    readWordSync: {

      // returns the value, register is optional

      value: function readWordSync(address, register) {
        throw new Error("Not implemented");
      }
    },
    i2cWrite: {

      // function cb(err), returns undefined, register is optional

      value: function i2cWrite(address, register, buffer, cb) {
        throw new Error("Not implemented");
      }
    },
    i2cWriteSync: {

      // returns undefined, register is optional

      value: function i2cWriteSync(address, register, buffer) {
        throw new Error("Not implemented");
      }
    },
    writeByte: {

      // function cb(err), returns undefined, register is optional

      value: function writeByte(address, register, byte, cb) {
        throw new Error("Not implemented");
      }
    },
    writeByteSync: {

      // returns undefined, register is optional

      value: function writeByteSync(address, register, byte) {
        throw new Error("Not implemented");
      }
    },
    writeWord: {

      // function cb(err), returns undefined, register is optional

      value: function writeWord(address, register, word, cb) {
        throw new Error("Not implemented");
      }
    },
    writeWordSync: {

      // returns undefined, register is optional

      value: function writeWordSync(address, register, word) {
        throw new Error("Not implemented");
      }
    }
  });

  return I2C;
})(Peripheral);

Object.defineProperty(exports, "__esModule", {
  value: true
});
//# sourceMappingURL=data:application/json;base64,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QyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtBQUNyQyxjQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7T0FDcEM7Ozs7U0EzRVUsR0FBRztHQUFTLFVBQVUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT4gKGh0dHA6Ly90aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20pXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBzaCBmcm9tICdleGVjU3luYyc7XG5pbXBvcnQgeyBQZXJpcGhlcmFsIH0gZnJvbSAncmFzcGktcGVyaXBoZXJhbCc7XG5cbmV4cG9ydCBjbGFzcyBJMkMgZXh0ZW5kcyBQZXJpcGhlcmFsIHtcbiAgY29uc3RydWN0b3IoYmF1ZFJhdGUsIHBpbnMpIHtcbiAgICBzdXBlcihwaW5zIHx8IFsgJ1NEQTAnLCAnU0NMMCcgXSk7XG4gICAgaWYgKGJhdWRSYXRlKSB7XG4gICAgICBpZiAodHlwZW9mIGJhdWRSYXRlICE9IG51bWJlciB8fCBiYXVkUmF0ZSAlIDEwMDAgIT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSTJDIGJhdWQgcmF0ZS4gQmF1ZCByYXRlcyBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTAwMCcpO1xuICAgICAgfVxuICAgICAgc2gucnVuKCdncGlvIGxvYWQgaTJjICcgKyBiYXVkUmF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNoLnJ1bignZ3BpbyBsb2FkIGkyYycpOyAvLyBJcyB0aGlzIHN0aWxsIG5lY2Vzc2FyeT9cbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8vIGZ1bmN0aW9uIGNiKGVyciwgYnVmZmVyKSwgcmV0dXJucyB1bmRlZmluZWQsIHJlZ2lzdGVyIGlzIG9wdGlvbmFsXG4gIGkyY1JlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCwgY2IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIGJ1ZmZlciwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgaTJjUmVhZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvLyBmdW5jdGlvbiBjYihlcnIsIHZhbHVlKSwgcmV0dXJucyB1bmRlZmluZWQsIHJlZ2lzdGVyIGlzIG9wdGlvbmFsXG4gIHJlYWRCeXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBjYikge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvLyByZXR1cm5zIHRoZSB2YWx1ZSwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgcmVhZEJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8vIGZ1bmN0aW9uIGNiKGVyciwgdmFsdWUpLCByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgcmVhZFdvcmQoYWRkcmVzcywgcmVnaXN0ZXIsIGNiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8vIHJldHVybnMgdGhlIHZhbHVlLCByZWdpc3RlciBpcyBvcHRpb25hbFxuICByZWFkV29yZFN5bmMoYWRkcmVzcywgcmVnaXN0ZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLy8gZnVuY3Rpb24gY2IoZXJyKSwgcmV0dXJucyB1bmRlZmluZWQsIHJlZ2lzdGVyIGlzIG9wdGlvbmFsXG4gIGkyY1dyaXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBidWZmZXIsIGNiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8vIHJldHVybnMgdW5kZWZpbmVkLCByZWdpc3RlciBpcyBvcHRpb25hbFxuICBpMmNXcml0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIGJ1ZmZlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvLyBmdW5jdGlvbiBjYihlcnIpLCByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgd3JpdGVCeXRlKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlLCBjYikge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvLyByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgd3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgYnl0ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvLyBmdW5jdGlvbiBjYihlcnIpLCByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgd3JpdGVXb3JkKGFkZHJlc3MsIHJlZ2lzdGVyLCB3b3JkLCBjYikge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvLyByZXR1cm5zIHVuZGVmaW5lZCwgcmVnaXN0ZXIgaXMgb3B0aW9uYWxcbiAgd3JpdGVXb3JkU3luYyhhZGRyZXNzLCByZWdpc3Rlciwgd29yZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==