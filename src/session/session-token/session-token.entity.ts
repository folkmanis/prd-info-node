import { SystemModules } from '../../preferences/index.js';
export { SystemModules } from '../../preferences/index.js';

export interface SessionTokenEntity {
  userId: string;
  sessionId: string;
  modules: SystemModules[];
  inst: string;
}
