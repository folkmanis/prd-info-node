import { ResponseBase } from './response-base.interface';

export interface Version {
  apiBuild: number;
  appBuild: number;
}

export type VersionResponse = ResponseBase<Version>;
