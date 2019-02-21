/*
The MIT License (MIT)

Copyright (c) Bryan Hughes <bryan@nebri.us>

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

import { openSync, I2cBus, BufferCallback, ResultCallback } from 'i2c-bus';
import { execSync } from 'child_process';
import { Peripheral } from 'raspi-peripheral';
import { VERSION_1_MODEL_B_REV_1, getBoardRevision } from 'raspi-board';
import { II2C, II2CModule, I2CReadBufferCallback, I2CReadNumberCallback, I2CWriteCallback } from 'j5-io-types';

function checkAddress(address: any) {
  if (typeof address !== 'number' || address < 0 || address > 0x7f) {
    throw new Error(`Invalid I2C address ${address}. Valid addresses are 0 through 0x7f.`);
  }
}

function checkRegister(register: any) {
  if (register !== undefined &&
      (typeof register !== 'number' || register < 0 || register > 0xff)
  ) {
    throw new Error(`Invalid I2C register ${register}. Valid registers are 0 through 0xff.`);
  }
}

function checkLength(length: any, hasRegister: boolean) {
  if (typeof length !== 'number' || length < 0 || (hasRegister && length > 32)) {
    // Enforce 32 byte length limit only for SMBus.
    throw new Error(`Invalid I2C length ${length}. Valid lengths are 0 through 32.`);
  }
}

function checkBuffer(buffer: any, hasRegister: boolean) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 0 || (hasRegister && buffer.length > 32)) {
    // Enforce 32 byte length limit only for SMBus.
    throw new Error(`Invalid I2C buffer. Valid lengths are 0 through 32.`);
  }
}

function checkByte(byte: any) {
  if (typeof byte !== 'number' || byte < 0 || byte > 0xff) {
    throw new Error(`Invalid I2C byte ${byte}. Valid values are 0 through 0xff.`);
  }
}

function checkWord(word: any) {
  if (typeof word !== 'number' || word < 0 || word > 0xffff) {
    throw new Error(`Invalid I2C word ${word}. Valid values are 0 through 0xffff.`);
  }
}

function checkCallback(cb: any) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid I2C callback');
  }
}

function createReadBufferCallback(suppliedCallback?: I2CReadBufferCallback): BufferCallback {
  return (err: any, resultOrBytesRead?: Buffer | number, result?: Buffer) => {
    if (suppliedCallback) {
      if (err) {
        suppliedCallback(err, null);
      } else if (typeof result !== 'undefined') {
        suppliedCallback(null, result);
      } else if (Buffer.isBuffer(resultOrBytesRead)) {
        suppliedCallback(null, resultOrBytesRead);
      }
    }
  };
}

function createReadNumberCallback(suppliedCallback?: I2CReadNumberCallback): ResultCallback<number> {
  return (err: any, result?: number) => {
    if (suppliedCallback) {
      if (err) {
        suppliedCallback(err, null);
      } else if (typeof result !== 'undefined') {
        suppliedCallback(null, result);
      }
    }
  };
}

function createWriteCallback(suppliedCallback?: I2CWriteCallback): any {
  return (err: any) => {
    if (suppliedCallback) {
      suppliedCallback(err || null);
    }
  };
}

export class I2C extends Peripheral implements II2C {

  private _devices: I2cBus[] = [];

  constructor() {
    super([ 'SDA0', 'SCL0' ]);
    execSync('modprobe i2c-dev');
  }

  public destroy() {
    this._devices.forEach((device) => device.closeSync());
    this._devices = [];
    super.destroy();
  }

  public read(address: number, length: number, cb: I2CReadBufferCallback): void;
  public read(address: number, register: number, length: number, cb: I2CReadBufferCallback): void;
  public read(
    address: number,
    registerOrLength: number,
    lengthOrCb: number | I2CReadBufferCallback,
    cb?: I2CReadBufferCallback
  ): void {
    this.validateAlive();

    let length: number;
    let register: number | undefined;
    if (typeof cb === 'function' && typeof lengthOrCb === 'number') {
      length = lengthOrCb;
      register = registerOrLength;
    } else if (typeof lengthOrCb === 'function') {
      cb = lengthOrCb;
      length = registerOrLength;
      register = undefined;
    } else {
      throw new TypeError('Invalid I2C read arguments');
    }

    checkAddress(address);
    checkRegister(register);
    checkLength(length, !!register);
    checkCallback(cb);

    const buffer = new Buffer(length);

    if (register === undefined) {
      this._getDevice(address).i2cRead(address, length, buffer, createReadBufferCallback(cb));
    } else {
      this._getDevice(address).readI2cBlock(address, register, length, buffer, createReadBufferCallback(cb));
    }
  }

  public readSync(address: number, registerOrLength: number | undefined, length?: number): Buffer {
    this.validateAlive();

    let register: number | undefined;
    if (typeof length === 'undefined') {
      length = +(registerOrLength as number);
    } else {
      register = registerOrLength;
      length = +length;
    }

    checkAddress(address);
    checkRegister(register);
    checkLength(length, !!register);

    const buffer = new Buffer(length);

    if (register === undefined) {
      this._getDevice(address).i2cReadSync(address, length, buffer);
    } else {
      this._getDevice(address).readI2cBlockSync(address, register, length, buffer);
    }

    return buffer;
  }

  public readByte(address: number, cb: I2CReadNumberCallback): void;
  public readByte(address: number, register: number, cb: I2CReadNumberCallback): void;
  public readByte(address: number, registerOrCb: number | I2CReadNumberCallback, cb?: I2CReadNumberCallback): void {
    this.validateAlive();

    let register: number | undefined;
    if (typeof registerOrCb === 'function') {
      cb = registerOrCb;
      register = undefined;
    }

    checkAddress(address);
    checkRegister(register);
    checkCallback(cb);

    if (register === undefined) {
      const buffer = new Buffer(1);
      this._getDevice(address).i2cRead(address, buffer.length, buffer, (err) => {
        if (err) {
          if (cb) {
            cb(err, null);
          }
        } else if (cb) {
          cb(null, buffer[0]);
        }
      });
    } else {
      this._getDevice(address).readByte(address, register, createReadNumberCallback(cb));
    }
  }

  public readByteSync(address: number, register?: number) {
    this.validateAlive();

    checkAddress(address);
    checkRegister(register);

    let byte: number;
    if (register === undefined) {
      const buffer = new Buffer(1);
      this._getDevice(address).i2cReadSync(address, buffer.length, buffer);
      byte = buffer[0];
    } else {
      byte = this._getDevice(address).readByteSync(address, register);
    }
    return byte;
  }

  public readWord(address: number, cb: I2CReadNumberCallback): void;
  public readWord(address: number, register: number, cb: I2CReadNumberCallback): void;
  public readWord(address: number, registerOrCb: number | I2CReadNumberCallback, cb?: I2CReadNumberCallback): void {
    this.validateAlive();

    let register: number | undefined;
    if (typeof registerOrCb === 'function') {
      cb = registerOrCb;
    } else {
      register = registerOrCb;
    }

    checkAddress(address);
    checkRegister(register);
    checkCallback(cb);

    if (register === undefined) {
      const buffer = new Buffer(2);
      this._getDevice(address).i2cRead(address, buffer.length, buffer, (err) => {
        if (cb) {
          if (err) {
            return cb(err, null);
          }
          cb(null, buffer.readUInt16LE(0));
        }
      });
    } else {
      this._getDevice(address).readWord(address, register, createReadNumberCallback(cb));
    }
  }

  public readWordSync(address: number, register?: number): number {
    this.validateAlive();

    checkAddress(address);
    checkRegister(register);

    let byte: number;
    if (register === undefined) {
      const buffer = new Buffer(2);
      this._getDevice(address).i2cReadSync(address, buffer.length, buffer);
      byte = buffer.readUInt16LE(0);
    } else {
      byte = this._getDevice(address).readWordSync(address, register);
    }
    return byte;
  }

  public write(address: number, buffer: Buffer, cb?: I2CWriteCallback): void;
  public write(address: number, register: number, buffer: Buffer, cb?: I2CWriteCallback): void;
  public write(
    address: number,
    registerOrBuffer: number | Buffer,
    bufferOrCb?: Buffer | I2CWriteCallback,
    cb?: I2CWriteCallback
  ): void {
    this.validateAlive();

    let buffer: Buffer;
    let register: number | undefined;
    if (Buffer.isBuffer(registerOrBuffer)) {
      cb = bufferOrCb as I2CWriteCallback;
      buffer = registerOrBuffer;
      register = undefined;
    } else if (typeof registerOrBuffer === 'number' && Buffer.isBuffer(bufferOrCb)) {
      register = registerOrBuffer;
      buffer = bufferOrCb;
    } else {
      throw new TypeError('Invalid I2C write arguments');
    }

    checkAddress(address);
    checkRegister(register);
    checkBuffer(buffer, !!register);

    if (register === undefined) {
      this._getDevice(address).i2cWrite(address, buffer.length, buffer, createWriteCallback(cb));
    } else {
      this._getDevice(address).writeI2cBlock(address, register, buffer.length, buffer, createWriteCallback(cb));
    }
  }

  public writeSync(address: number, buffer: Buffer): void;
  public writeSync(address: number, register: number, buffer: Buffer): void;
  public writeSync(address: number, registerOrBuffer: number | Buffer, buffer?: Buffer): void {
    this.validateAlive();

    let register: number | undefined;
    if (Buffer.isBuffer(registerOrBuffer)) {
      buffer = registerOrBuffer;
    } else {
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
    } else {
      this._getDevice(address).writeI2cBlockSync(address, register, buffer.length, buffer);
    }
  }

  public writeByte(address: number, byte: number, cb?: I2CWriteCallback): void;
  public writeByte(address: number, register: number, byte: number, cb?: I2CWriteCallback): void;
  public writeByte(
    address: number,
    registerOrByte: number,
    byteOrCb?: number | I2CWriteCallback,
    cb?: I2CWriteCallback
  ): void {
    this.validateAlive();

    let byte: number;
    let register: number | undefined;
    if (typeof byteOrCb === 'number') {
      byte = byteOrCb;
      register = registerOrByte;
    } else {
      cb = byteOrCb;
      byte = registerOrByte;
    }

    checkAddress(address);
    checkRegister(register);
    checkByte(byte);

    if (register === undefined) {
      this._getDevice(address).i2cWrite(address, 1, new Buffer([byte]), createWriteCallback(cb));
    } else {
      this._getDevice(address).writeByte(address, register, byte, createWriteCallback(cb));
    }
  }

  public writeByteSync(address: number, registerOrByte: number, byte?: number): void {
    this.validateAlive();

    let register: number | undefined;
    if (byte === undefined) {
      byte = registerOrByte;
    } else {
      register = registerOrByte;
    }

    checkAddress(address);
    checkRegister(register);
    checkByte(byte);

    if (register === undefined) {
      this._getDevice(address).i2cWriteSync(address, 1, new Buffer([byte]));
    } else {
      this._getDevice(address).writeByteSync(address, register, byte);
    }
  }

  public writeWord(address: number, word: number, cb?: I2CWriteCallback): void;
  public writeWord(address: number, register: number, word: number, cb?: I2CWriteCallback): void;
  public writeWord(
    address: number,
    registerOrWord: number,
    wordOrCb?: number | I2CWriteCallback,
    cb?: I2CWriteCallback
  ): void {
    this.validateAlive();

    let register: number | undefined;
    let word: number;
    if (typeof wordOrCb === 'number') {
      register = registerOrWord;
      word = wordOrCb;
    } else if (typeof wordOrCb === 'function') {
      word = registerOrWord;
      cb = wordOrCb;
    } else {
      throw new Error('Invalid I2C write arguments');
    }

    checkAddress(address);
    checkRegister(register);
    checkWord(word);

    if (register === undefined) {
      const buffer = new Buffer(2);
      buffer.writeUInt16LE(word, 0);
      this._getDevice(address).i2cWrite(address, buffer.length, buffer, createWriteCallback(cb));
    } else {
      this._getDevice(address).writeWord(address, register, word, createWriteCallback(cb));
    }
  }

  public writeWordSync(address: number, registerOrWord: number, word?: number): void {
    this.validateAlive();

    let register: number | undefined;
    if (word === undefined) {
      word = registerOrWord;
    } else {
      register = registerOrWord;
    }

    checkAddress(address);
    checkRegister(register);
    checkWord(word);

    if (register === undefined) {
      const buffer = new Buffer(2);
      buffer.writeUInt16LE(word, 0);
      this._getDevice(address).i2cWriteSync(address, buffer.length, buffer);
    } else {
      this._getDevice(address).writeWordSync(address, register, word);
    }
  }

  private _getDevice(address: number) {
    let device = this._devices[address];

    if (device === undefined) {
      device = openSync(getBoardRevision() === VERSION_1_MODEL_B_REV_1 ? 0 : 1);
      this._devices[address] = device;
    }

    return device;
  }
}

export const module: II2CModule = {
  createI2C() {
    return new I2C();
  }
};
