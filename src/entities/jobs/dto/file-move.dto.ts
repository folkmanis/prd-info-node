import { IsArray, IsString } from 'class-validator';

export class UserFileMoveDto {
  @IsString({ each: true })
  fileNames: string[];
}

export class FtpFileCopyDto {
  @IsArray({ each: true })
  files: string[][];
}
