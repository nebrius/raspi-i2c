/// <reference types="node" />
import { Peripheral } from 'raspi-peripheral';
export interface IConfig {
    pins?: Array<any>;
}
export interface IReadCallback {
    (err: null | Error | string, data: null | Buffer | number): void;
}
export interface IWriteCallback {
    (err: null | Error | string): void;
}
export declare class I2C extends Peripheral {
    private _devices;
    constructor(config?: Array<number> | IConfig);
    destroy(): void;
    private _getDevice(address);
    read(address: number, length: number, cb: IReadCallback): void;
    read(address: number, register: number, length: number, cb: IReadCallback): void;
    readSync(address: number, length: number): Buffer;
    readSync(address: number, register: number, length: number): Buffer;
    readByte(address: number, cb: IReadCallback): void;
    readByte(address: number, register: number, cb: IReadCallback): void;
    readByteSync(address: number, register?: number): number;
    readWord(address: number, cb: IReadCallback): void;
    readWord(address: number, register: number, cb: IReadCallback): void;
    readWordSync(address: number, register?: number): number;
    write(address: number, buffer: Buffer, cb?: IWriteCallback): void;
    write(address: number, register: number, buffer: Buffer, cb?: IWriteCallback): void;
    writeSync(address: number, buffer: Buffer): void;
    writeSync(address: number, register: number, buffer: Buffer): void;
    writeByte(address: number, byte: number, cb?: IWriteCallback): void;
    writeByte(address: number, register: number, byte: number, cb?: IWriteCallback): void;
    writeByteSync(address: number, byte: number): void;
    writeByteSync(address: number, register: number, byte: number): void;
    writeWord(address: number, word: number, cb?: IWriteCallback): void;
    writeWord(address: number, register: number, word: number, cb?: IWriteCallback): void;
    writeWordSync(address: number, word: number): void;
    writeWordSync(address: number, register: number, word: number): void;
}
