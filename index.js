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

//import sh from 'execSync';
import i2c from 'i2c-bus';
import { execSync } from 'child_process';
import { Peripheral } from 'raspi-peripheral';
import { VERSION_1_MODEL_B_REV_1, getBoardRevision } from 'raspi-board';

if (typeof execSync !== 'function') {
  execSync = function () {};
}

function checkAlive(alive) {
  if (!alive) {
    throw new Error('Attempted to access a destroyed I2C peripheral');
  }
}

function checkAddress(address) {
  if (typeof address !== 'number' || address < 0 || address > 0x7f) {
    throw new Error('Invalid I2C address ' + address
      + '. Valid addresses are 0 through 0x7f.'
    );
  }
}

function checkRegister(register) {
  if (register !== undefined &&
      (typeof register !== 'number' || register < 0 || register > 0xff)) {
    throw new Error('Invalid I2C register ' + register
      + '. Valid registers are 0 through 0xff.'
    );
  }
}

function checkLength(length) {
  if (typeof length !== 'number' || length < 0 || length > 32) {
    throw new Error('Invalid I2C length ' + length
      + '. Valid lengths are 0 through 32.'
    );
  }
}

function checkCallback(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid I2C callback ' + cb);
  }
}

function checkBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length <= 0 || buffer.length > 32) {
    throw new Error('Invalid I2C buffer ' + buffer
      + '. Valid lengths are 0 through 32.'
    );
  }
}

function checkByte(byte) {
  if (typeof byte !== 'number' || byte < 0 || byte > 0xff) {
    throw new Error('Invalid I2C byte ' + byte
      + '. Valid values are 0 through 0xff.'
    );
  }
}

function checkWord(word) {
  if (typeof word !== 'number' || word < 0 || word > 0xffff) {
    throw new Error('Invalid I2C word ' + word
      + '. Valid values are 0 through 0xffff.'
    );
  }
}

var devices = '__r$396836_0$__';
var getDevice = '__r$396836_1$__';

export class I2C extends Peripheral {
  constructor(baudRate, pins) {
    super(pins || [ 'SDA0', 'SCL0' ]);

    Object.defineProperties(this, {
      [devices]: {
        writable: true,
        value: []
      }
    });

    if (baudRate) {
      if (typeof baudRate != number || baudRate % 1000 != 0) {
        throw new Error('Invalid I2C baud rate. Baud rates must be a multiple of 1000');
      }
      //sh.run('gpio load i2c ' + baudRate);
      execSync('gpio load i2c ' + baudRate);
    } else {
      //sh.run('gpio load i2c'); // Is this still necessary?
      execSync('gpio load i2c');
    }
  }

  destroy() {
    this[devices].forEach(function (device) {
      device.closeSync();
    });

    this[devices] = [];

    super.destroy();
  }

  [getDevice](address) {
    var device = this[devices][address];

    if (device === undefined) {
      device = i2c.openSync(getBoardRevision() === VERSION_1_MODEL_B_REV_1 ? 0 : 1);
      this[devices][address] = device;
    }

    return device;
  }

  // function cb(err, buffer), returns undefined, register is optional
  // Required by J5
  i2cRead(address, register, length, cb) {
    var buffer;
    var callback;

    checkAlive(this.alive);

    if (arguments.length === 3) {
      cb = length;
      length = register;
      register = undefined;
    }

    checkAddress(address);
    checkRegister(register);
    checkLength(length);
    checkCallback(cb);

    buffer = new Buffer(length);
    callback = function (err) {
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

  // Returns a buffer, register is optional
  i2cReadSync(address, register, length) {
    var buffer;

    checkAlive(this.alive);

    if (arguments.length === 2) {
      length = register;
      register = undefined;
    }

    checkAddress(address);
    checkRegister(register);
    checkLength(length);

    buffer = new Buffer(length);

    if (register === undefined) {
      this[getDevice](address).i2cReadSync(address, length, buffer);
    } else {
      this[getDevice](address).readI2cBlockSync(address, register, length, buffer);
    }

    return buffer;
  }

  // function cb(err, value), returns undefined, register is optional
  readByte(address, register, cb) {
    var buffer;

    checkAlive(this.alive);

    if (arguments.length === 2) {
      cb = register;
      register = undefined;
    }

    checkAddress(address);
    checkRegister(register);
    checkCallback(cb);

    if (register === undefined) {
      buffer = new Buffer(1);
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

  // returns the value, register is optional
  readByteSync(address, register) {
    var buffer;

    checkAlive(this.alive);

    checkAddress(address);
    checkRegister(register);

    if (register === undefined) {
      buffer = new Buffer(1);
      this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
      return buffer[0];
    } else {
      return this[getDevice](address).readByteSync(address, register);
    }
  }

  // function cb(err, value), returns undefined, register is optional
  readWord(address, register, cb) {
    var buffer;

    checkAlive(this.alive);

    if (arguments.length === 2) {
      cb = register;
      register = undefined;
    }

    checkAddress(address);
    checkRegister(register);
    checkCallback(cb);

    if (register === undefined) {
      buffer = new Buffer(2);
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

  // returns the value, register is optional
  readWordSync(address, register) {
    var buffer;

    checkAlive(this.alive);

    checkAddress(address);
    checkRegister(register);

    if (register === undefined) {
      buffer = new Buffer(2);
      this[getDevice](address).i2cReadSync(address, buffer.length, buffer);
      return buffer.readUInt16LE(0);
    } else {
      return this[getDevice](address).readWordSync(address, register);
    }
  }

  // function cb(err), returns undefined, register is optional
  i2cWrite(address, register, buffer, cb) {
    checkAlive(this.alive);

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

  // returns undefined, register is optional
  // Required by J5
  i2cWriteSync(address, register, buffer) {
    checkAlive(this.alive);

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

  // function cb(err), returns undefined, register is optional
  writeByte(address, register, byte, cb) {
    checkAlive(this.alive);

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

  // returns undefined, register is optional
  // Required by J5
  writeByteSync(address, register, byte) {
    checkAlive(this.alive);

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

  // function cb(err), returns undefined, register is optional
  writeWord(address, register, word, cb) {
    var buffer;

    checkAlive(this.alive);

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
      buffer = new Buffer(2);
      buffer.writeUInt16LE(word, 0);
      this[getDevice](address).i2cWrite(address, buffer.length, buffer, cb);
    } else {
      this[getDevice](address).writeWord(address, register, word, cb);
    }
  }

  // returns undefined, register is optional
  writeWordSync(address, register, word) {
    var buffer;

    checkAlive(this.alive);

    if (arguments.length === 2) {
      word = register;
      register = undefined;
    }

    checkAddress(address);
    checkRegister(register);
    checkWord(word);

    if (register === undefined) {
      buffer = new Buffer(2);
      buffer.writeUInt16LE(word, 0);
      this[getDevice](address).i2cWriteSync(address, buffer.length, buffer);
    } else {
      this[getDevice](address).writeWordSync(address, register, word);
    }
  }
}
