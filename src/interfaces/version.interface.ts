import { ResponseBase } from './response-base.interface';

export interface Version {
    apiBuild: number;
    appBuild: number;
}

export interface VersionResponse extends ResponseBase<Version> { }
