import { Expose } from 'class-transformer';
import { IsString, IsUrl, IsDataURI } from 'class-validator';

export class OAuth2Credentials {

    @IsString()
    client_id: string;

    @IsString()
    project_id: string;

    @IsUrl()
    auth_uri: string;

    @IsUrl()
    token_uri: string;

    @IsUrl()
    auth_provider_x509_cert_url: string;

    @IsString()
    client_secret: string;

    @IsString({ each: true })
    redirect_uris: string[];
};
