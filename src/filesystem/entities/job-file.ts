import { BadRequestException, NotFoundException } from '@nestjs/common';
import { rename, rm, writeFile } from 'fs/promises';
import { sanitizeFileName } from '../../lib/filename-functions.js';
import { safeCopy } from '../safe-copy.js';
import { FileElement } from './file-element.js';
import { FileLocation } from './file-location.js';

export class JobFile {
  location: FileLocation;

  name: string;

  get fileElement(): FileElement {
    return {
      isFolder: false,
      name: this.name,
      parent: this.location.path,
    };
  }

  constructor(location: FileLocation, name: string) {
    this.location = location;
    this.name = sanitizeFileName(name);
  }

  resolve(): string {
    return this.location.resolve(this.name);
  }

  async copy(newLocation: FileLocation, newName?: string): Promise<void> {
    newName = sanitizeFileName(newName || this.name);

    try {
      await safeCopy(this.resolve(), newLocation.resolve(newName));
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async move(newLocation: FileLocation, newName?: string) {
    const sanitizedName = sanitizeFileName(newName || this.name);

    try {
      await rename(this.resolve(), newLocation.resolve(sanitizedName));
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
    await this.location.createFolder();
    try {
      return writeFile(this.resolve(), data);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
