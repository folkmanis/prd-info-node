import { SystemModules } from '../../preferences';
export { SystemModules } from '../../preferences';

export interface SessionTokenEntity {
    userId: string;
    sessionId: string;
    modules: SystemModules[];
    inst: string;
}