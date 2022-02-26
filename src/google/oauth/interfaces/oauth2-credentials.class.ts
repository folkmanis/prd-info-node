import { Expose, Type } from 'class-transformer';
import { IsString, IsUrl, IsDataURI, ValidateNested, Equals } from 'class-validator';

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

export class GoogleConfig {

    @IsString()
    client_id: string;

    @IsUrl()
    redirect_uri: string;

    @IsString()
    response_type = 'code';

    @IsString()
    scope: string;

    @Equals('offline')
    access_type = 'offline';

    @IsString()
    state: string;

}
