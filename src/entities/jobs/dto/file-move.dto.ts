import { IsEnum, IsString } from 'class-validator';

export enum FileMoveActions {
    USER_TO_JOB
}

export class FileMoveDto {

    @IsEnum(FileMoveActions)
    action: FileMoveActions;

    @IsString({ each: true })
    fileNames: string[];
}