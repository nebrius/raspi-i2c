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

import sh from 'execSync';
import { Peripheral } from 'raspi-peripheral';

export class I2C extends Peripheral {
  constructor(baudRate, pins) {
    super(pins || [ 'SDA0', 'SCL0' ]);
    if (baudRate) {
      if (typeof baudRate != number || baudRate % 1000 != 0) {
        throw new Error('Invalid I2C baud rate. Baud rates must be a multiple of 1000');
      }
      sh.run('gpio load i2c ' + baudRate);
    } else {
      sh.run('gpio load i2c'); // Is this still necessary?
    }
  }

  destroy() {
    super.destroy();
  }

  // function cb(err, buffer), returns undefined, register is optional
  i2cRead(address, register, length, cb) {
    throw new Error('Not implemented');
  }

  // Returns a buffer, register is optional
  i2cReadSync(address, register, length) {
    throw new Error('Not implemented');
  }

  // function cb(err, value), returns undefined, register is optional
  readByte(address, register, cb) {
    throw new Error('Not implemented');
  }

  // returns the value, register is optional
  readByteSync(address, register) {
    throw new Error('Not implemented');
  }

  // function cb(err, value), returns undefined, register is optional
  readWord(address, register, cb) {
    throw new Error('Not implemented');
  }

  // returns the value, register is optional
  readWordSync(address, register) {
    throw new Error('Not implemented');
  }

  // function cb(err), returns undefined, register is optional
  i2cWrite(address, register, buffer, cb) {
    throw new Error('Not implemented');
  }

  // returns undefined, register is optional
  i2cWriteSync(address, register, buffer) {
    throw new Error('Not implemented');
  }

  // function cb(err), returns undefined, register is optional
  writeByte(address, register, byte, cb) {
    throw new Error('Not implemented');
  }

  // returns undefined, register is optional
  writeByteSync(address, register, byte) {
    throw new Error('Not implemented');
  }

  // function cb(err), returns undefined, register is optional
  writeWord(address, register, word, cb) {
    throw new Error('Not implemented');
  }

  // returns undefined, register is optional
  writeWordSync(address, register, word) {
    throw new Error('Not implemented');
  }
}
