import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { copyFile, rename, rm, writeFile } from 'fs/promises';
import { sanitizeFileName } from '../../lib/filename-functions';
import { FileLocation } from './file-location';


export class JobFile {

    location: FileLocation;

    name: string;

    constructor(
        location: FileLocation,
        name: string,
    ) {
        this.location = location;
        this.name = sanitizeFileName(name);
    }

    resolve(): string {
        return this.location.resolve(this.name);
    }

    async copy(newLocation: FileLocation, newName?: string): Promise<void> {

        newName = sanitizeFileName(newName || this.name);

        try {
            return copyFile(this.resolve(), newLocation.resolve(newName));
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    async move(newLocation: FileLocation, newName?: string) {

        newName = sanitizeFileName(newName || this.name);

        try {
            return rename(this.resolve(), newLocation.resolve(newName));
        } catch (error) {
            throw new NotFoundException(error);
        }

    }

    async remove(): Promise<number> {
        try {
            await rm(this.resolve(), { recursive: true });
            return 1;
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    async write(data: Parameters<typeof writeFile>[1]) {
        try {
            return writeFile(this.resolve(), data);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

}
