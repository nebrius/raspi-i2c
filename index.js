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
import addon from '../build/Release/addon';

export class I2C extends Peripheral {
  constructor(address, baudRate) {
    super([ 'SDA', 'SCL' ]);
    if (baudRate) {
      if (typeof baudRate != number || baudRate % 1000 != 0) {
        throw new Error('Invalid I2C baud rate. Baud rates must be a multiple of 1000');
      }
      sh.run('gpio load i2c ' + baudRate);
    } else {
      sh.run('gpio load i2c');
    }
    this.address = address;
    this.fd = addon.init(this.address);
  }

  read() {
    if (!this.alive) {
      throw new Error('Attempted to read from a destroyed peripheral');
    }
    return addon.read();
  }

  readReg8() {
    if (!this.alive) {
      throw new Error('Attempted to read from a destroyed peripheral');
    }
    return addon.readReg8();
  }

  readReg16() {
    if (!this.alive) {
      throw new Error('Attempted to read from a destroyed peripheral');
    }
    return addon.readReg16();
  }

  write(value) {
    if (!this.alive) {
      throw new Error('Attempted to write to a destroyed peripheral');
    }
    addon.write(value);
  }

  writeReg8(value) {
    if (!this.alive) {
      throw new Error('Attempted to write to a destroyed peripheral');
    }
    addon.writeReg8(value);
  }

  writeReg16(value) {
    if (!this.alive) {
      throw new Error('Attempted to write to a destroyed peripheral');
    }
    addon.writeReg16(value);
  }
}
