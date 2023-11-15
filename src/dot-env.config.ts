import Joi from 'joi';

export interface AppConfig {
  PORT: number;
  SESSION_EXPIRES: number;
  DB_SRV: string;
  LOGFILE: string;
  BODY_SIZE_LIMIT: string;
  DEBUG: boolean;
  JOBS_INPUT: string;
  FTP_FOLDER: string;
  DROP_FOLDER: string;
}

export const dotEnvConfig = Joi.object<AppConfig>({
  PORT: Joi.number().default(3000),
  SESSION_EXPIRES: Joi.number().default(86400),
  DB_SRV: Joi.string().required(),
  LOGFILE: Joi.string().default('./error.log'),
  BODY_SIZE_LIMIT: Joi.string().default('5mb'),
  DEBUG: Joi.boolean().truthy('1', 'Y').falsy('0', 'N'),
  JOBS_INPUT: Joi.string().required(),
  FTP_FOLDER: Joi.string().required(),
  DROP_FOLDER: Joi.string().required(),
});
