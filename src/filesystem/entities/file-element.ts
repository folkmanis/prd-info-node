import { Dirent } from 'fs';

export interface FileElement {
    id?: string;
    isFolder: boolean;
    name: string;
    parent: string[];
}

export function fromDirent(parent: string[]): (dirent: Dirent) => FileElement {
    return (dirent) => ({
        isFolder: dirent.isDirectory(),
        name: dirent.name,
        parent,
    });
}