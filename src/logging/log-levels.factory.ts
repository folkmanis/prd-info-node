import { FactoryProvider, Provider } from '@nestjs/common';
import { z } from 'zod';

const LogLevelSchema = z.enum([
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
]);

export type LogLevel = z.infer<typeof LogLevelSchema>;

export const AppLogLevelsSchema = z.record(LogLevelSchema, z.number());
export type AppLogLevels = z.infer<typeof AppLogLevelsSchema>;

export const LOG_LEVELS: [number, LogLevel][] = [
  [0, 'error'],
  [1, 'warn'],
  [2, 'info'],
  [3, 'http'],
  [4, 'verbose'],
  [5, 'debug'],
  [6, 'silly'],
] as const;

export const logLevelsFactory: Provider = {
  provide: 'LOG_LEVELS',
  useValue: LOG_LEVELS.reduce(
    (acc, level) => ({ ...acc, [level[1]]: level[0] }),
    {} as AppLogLevels,
  ),
};
