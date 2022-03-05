import { IsString, IsNumber, IsOptional } from 'class-validator';

export class Attachment {

    @IsString()
    filename: string;

    @IsString()
    attachmentId: string;

    @IsNumber()
    @IsOptional()
    size?: number;

}
