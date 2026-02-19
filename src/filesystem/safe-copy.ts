import { copyFile, stat, utimes } from 'fs/promises';
import fs from 'fs';

export async function safeCopy(src: string, dest: string): Promise<void> {
  try {
    await copyFile(src, dest);
  } catch (err) {
    if ((err as Record<string, any>).code === 'EPERM') {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(src)
          .pipe(fs.createWriteStream(dest))
          .on('finish', resolve)
          .on('error', reject);
      });
    } else {
      throw err;
    }
  }

  try {
    const { atime, mtime } = await stat(src);
    await utimes(dest, atime, mtime);
  } catch (error) {}
}
