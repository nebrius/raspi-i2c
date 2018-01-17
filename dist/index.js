"use strict";
/*
The MIT License (MIT)

Copyright (c) 2014-2017 Bryan Hughes <bryan@nebri.us>

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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var i2c_bus_1 = require("i2c-bus");
var child_process_1 = require("child_process");
var raspi_peripheral_1 = require("raspi-peripheral");
var raspi_board_1 = require("raspi-board");
function checkAddress(address) {
    if (typeof address !== 'number' || address < 0 || address > 0x7f) {
        throw new Error("Invalid I2C address " + address + ". Valid addresses are 0 through 0x7f.");
    }
}
function checkRegister(register) {
    if (register !== undefined &&
        (typeof register !== 'number' || register < 0 || register > 0xff)) {
        throw new Error("Invalid I2C register " + register + ". Valid registers are 0 through 0xff.");
    }
}
function checkLength(length, hasRegister) {
    if (typeof length !== 'number' || length < 0 || (hasRegister && length > 32)) {
        // Enforce 32 byte length limit only for SMBus.
        throw new Error("Invalid I2C length " + length + ". Valid lengths are 0 through 32.");
    }
}
function checkBuffer(buffer, hasRegister) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 0 || (hasRegister && buffer.length > 32)) {
        // Enforce 32 byte length limit only for SMBus.
        throw new Error("Invalid I2C buffer. Valid lengths are 0 through 32.");
    }
}
function checkByte(byte) {
    if (typeof byte !== 'number' || byte < 0 || byte > 0xff) {
        throw new Error("Invalid I2C byte " + byte + ". Valid values are 0 through 0xff.");
    }
}
function checkWord(word) {
    if (typeof word !== 'number' || word < 0 || word > 0xffff) {
        throw new Error("Invalid I2C word " + word + ". Valid values are 0 through 0xffff.");
    }
}
function checkCallback(cb) {
    if (typeof cb !== 'function') {
        throw new Error('Invalid I2C callback');
    }
}
function createReadCallback(suppliedCallback) {
    return function (err, resultOrBytesRead, result) {
        if (suppliedCallback) {
            if (err) {
                suppliedCallback(err, null);
            }
            else if (typeof result !== 'undefined') {
                suppliedCallback(null, result);
            }
            else {
                suppliedCallback(null, resultOrBytesRead);
            }
        }
    };
}
function createWriteCallback(suppliedCallback) {
    return function (err) {
        if (suppliedCallback) {
            suppliedCallback(err || null);
        }
    };
}
var I2C = /** @class */ (function (_super) {
    __extends(I2C, _super);
    function I2C() {
        var _this = _super.call(this, ['SDA0', 'SCL0']) || this;
        _this._devices = [];
        child_process_1.execSync('modprobe i2c-dev');
        return _this;
    }
    I2C.prototype.destroy = function () {
        this._devices.forEach(function (device) { return device.closeSync(); });
        this._devices = [];
        _super.prototype.destroy.call(this);
    };
    I2C.prototype.read = function (address, registerOrLength, lengthOrCb, cb) {
        this.validateAlive();
        var length;
        var register;
        if (typeof cb === 'function' && typeof lengthOrCb === 'number') {
            length = lengthOrCb;
            register = registerOrLength;
        }
        else if (typeof lengthOrCb === 'function') {
            cb = lengthOrCb;
            length = registerOrLength;
            register = undefined;
        }
        else {
            throw new TypeError('Invalid I2C read arguments');
        }
        checkAddress(address);
        checkRegister(register);
        checkLength(length, !!register);
        checkCallback(cb);
        var buffer = new Buffer(length);
        if (register === undefined) {
            this._getDevice(address).i2cRead(address, length, buffer, createReadCallback(cb));
        }
        else {
            this._getDevice(address).readI2cBlock(address, register, length, buffer, createReadCallback(cb));
        }
    };
    I2C.prototype.readSync = function (address, registerOrLength, length) {
        this.validateAlive();
        var register;
        if (typeof length === 'undefined') {
            length = +registerOrLength;
        }
        else {
            register = registerOrLength;
            length = +length;
        }
        checkAddress(address);
        checkRegister(register);
        checkLength(length, !!register);
        var buffer = new Buffer(length);
        if (register === undefined) {
            this._getDevice(address).i2cReadSync(address, length, buffer);
        }
        else {
            this._getDevice(address).readI2cBlockSync(address, register, length, buffer);
        }
        return buffer;
    };
    I2C.prototype.readByte = function (address, registerOrCb, cb) {
        this.validateAlive();
        var register;
        if (typeof registerOrCb === 'function') {
            cb = registerOrCb;
            register = undefined;
        }
        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);
        if (register === undefined) {
            var buffer_1 = new Buffer(1);
            this._getDevice(address).i2cRead(address, buffer_1.length, buffer_1, function (err) {
                if (err) {
                    if (cb) {
                        cb(err, null);
                    }
                }
                else if (cb) {
                    cb(null, buffer_1[0]);
                }
            });
        }
        else {
            this._getDevice(address).readByte(address, register, createReadCallback(cb));
        }
    };
    I2C.prototype.readByteSync = function (address, register) {
        this.validateAlive();
        checkAddress(address);
        checkRegister(register);
        var byte;
        if (register === undefined) {
            var buffer = new Buffer(1);
            this._getDevice(address).i2cReadSync(address, buffer.length, buffer);
            byte = buffer[0];
        }
        else {
            byte = this._getDevice(address).readByteSync(address, register);
        }
        return byte;
    };
    I2C.prototype.readWord = function (address, registerOrCb, cb) {
        this.validateAlive();
        var register;
        if (typeof registerOrCb === 'function') {
            cb = registerOrCb;
        }
        else {
            register = registerOrCb;
        }
        checkAddress(address);
        checkRegister(register);
        checkCallback(cb);
        if (register === undefined) {
            var buffer_2 = new Buffer(2);
            this._getDevice(address).i2cRead(address, buffer_2.length, buffer_2, function (err) {
                if (cb) {
                    if (err) {
                        return cb(err, null);
                    }
                    cb(null, buffer_2.readUInt16LE(0));
                }
            });
        }
        else {
            this._getDevice(address).readWord(address, register, createReadCallback(cb));
        }
    };
    I2C.prototype.readWordSync = function (address, register) {
        this.validateAlive();
        checkAddress(address);
        checkRegister(register);
        var byte;
        if (register === undefined) {
            var buffer = new Buffer(2);
            this._getDevice(address).i2cReadSync(address, buffer.length, buffer);
            byte = buffer.readUInt16LE(0);
        }
        else {
            byte = this._getDevice(address).readWordSync(address, register);
        }
        return byte;
    };
    I2C.prototype.write = function (address, registerOrBuffer, bufferOrCb, cb) {
        this.validateAlive();
        var buffer;
        var register;
        if (Buffer.isBuffer(registerOrBuffer)) {
            cb = bufferOrCb;
            buffer = registerOrBuffer;
            register = undefined;
        }
        else if (typeof registerOrBuffer === 'number' && Buffer.isBuffer(bufferOrCb)) {
            register = registerOrBuffer;
            buffer = bufferOrCb;
        }
        else {
            throw new TypeError('Invalid I2C write arguments');
        }
        checkAddress(address);
        checkRegister(register);
        checkBuffer(buffer, !!register);
        if (register === undefined) {
            this._getDevice(address).i2cWrite(address, buffer.length, buffer, createWriteCallback(cb));
        }
        else {
            this._getDevice(address).writeI2cBlock(address, register, buffer.length, buffer, createWriteCallback(cb));
        }
    };
    I2C.prototype.writeSync = function (address, registerOrBuffer, buffer) {
        this.validateAlive();
        var register;
        if (Buffer.isBuffer(registerOrBuffer)) {
            buffer = registerOrBuffer;
        }
        else {
            if (!buffer) {
                throw new Error('Invalid I2C write arguments');
            }
            register = registerOrBuffer;
        }
        checkAddress(address);
        checkRegister(register);
        checkBuffer(buffer, !!register);
        if (register === undefined) {
            this._getDevice(address).i2cWriteSync(address, buffer.length, buffer);
        }
        else {
            this._getDevice(address).writeI2cBlockSync(address, register, buffer.length, buffer);
        }
    };
    I2C.prototype.writeByte = function (address, registerOrByte, byteOrCb, cb) {
        this.validateAlive();
        var byte;
        var register;
        if (typeof byteOrCb === 'number') {
            byte = byteOrCb;
            register = registerOrByte;
        }
        else {
            cb = byteOrCb;
            byte = registerOrByte;
        }
        checkAddress(address);
        checkRegister(register);
        checkByte(byte);
        if (register === undefined) {
            this._getDevice(address).i2cWrite(address, 1, new Buffer([byte]), createWriteCallback(cb));
        }
        else {
            this._getDevice(address).writeByte(address, register, byte, createWriteCallback(cb));
        }
    };
    I2C.prototype.writeByteSync = function (address, registerOrByte, byte) {
        this.validateAlive();
        var register;
        if (byte === undefined) {
            byte = registerOrByte;
        }
        else {
            register = registerOrByte;
        }
        checkAddress(address);
        checkRegister(register);
        checkByte(byte);
        if (register === undefined) {
            this._getDevice(address).i2cWriteSync(address, 1, new Buffer([byte]));
        }
        else {
            this._getDevice(address).writeByteSync(address, register, byte);
        }
    };
    I2C.prototype.writeWord = function (address, registerOrWord, wordOrCb, cb) {
        this.validateAlive();
        var register;
        var word;
        if (typeof wordOrCb === 'number') {
            register = registerOrWord;
            word = wordOrCb;
        }
        else if (typeof wordOrCb === 'function') {
            word = registerOrWord;
            cb = wordOrCb;
        }
        else {
            throw new Error('Invalid I2C write arguments');
        }
        checkAddress(address);
        checkRegister(register);
        checkWord(word);
        if (register === undefined) {
            var buffer = new Buffer(2);
            buffer.writeUInt16LE(word, 0);
            this._getDevice(address).i2cWrite(address, buffer.length, buffer, createWriteCallback(cb));
        }
        else {
            this._getDevice(address).writeWord(address, register, word, createWriteCallback(cb));
        }
    };
    I2C.prototype.writeWordSync = function (address, registerOrWord, word) {
        this.validateAlive();
        var register;
        if (word === undefined) {
            word = registerOrWord;
        }
        else {
            register = registerOrWord;
        }
        checkAddress(address);
        checkRegister(register);
        checkWord(word);
        if (register === undefined) {
            var buffer = new Buffer(2);
            buffer.writeUInt16LE(word, 0);
            this._getDevice(address).i2cWriteSync(address, buffer.length, buffer);
        }
        else {
            this._getDevice(address).writeWordSync(address, register, word);
        }
    };
    I2C.prototype._getDevice = function (address) {
        var device = this._devices[address];
        if (device === undefined) {
            device = i2c_bus_1.openSync(raspi_board_1.getBoardRevision() === raspi_board_1.VERSION_1_MODEL_B_REV_1 ? 0 : 1);
            this._devices[address] = device;
        }
        return device;
    };
    return I2C;
}(raspi_peripheral_1.Peripheral));
exports.I2C = I2C;
//# sourceMappingURL=index.js.map