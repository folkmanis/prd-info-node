import { z } from 'zod';

export const AppConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SESSION_EXPIRES: z.coerce.number().default(86400),
  DB_SRV: z.string(),
  LOGFILE: z.string().default('./error.log'),
  BODY_SIZE_LIMIT: z.string().default('5mb'),
  DEBUG: z.stringbool({ truthy: ['1', 'Y'], falsy: ['0', 'N'] }).default(false),
  JOBS_INPUT: z.string(),
  FTP_FOLDER: z.string(),
  DROP_FOLDER: z.string(),
  FIREBASE_ADMIN_CREDENTIALS: z.string(),
  GOOGLE_OAUTH2_CREDENTIALS: z.string(),
  GOOGLE_OAUTH2_REDIRECT: z.string(),
  JWT_SECRET: z.string(),
});
export type AppConfig = z.infer<typeof AppConfigSchema>;

export const validate = (config: Record<string, string>): AppConfig =>
  AppConfigSchema.parse(config);
