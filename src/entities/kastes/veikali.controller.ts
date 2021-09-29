import { ParseIntPipe, Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { Modules } from '../../login';
import { VeikaliDaoService } from './dao/veikali-dao.service';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { ObjectId } from 'mongodb';
import { Kaste } from './entities/kaste.entity';
import { Veikals } from './entities/veikals';
import { JobsService } from '../jobs/jobs.service';
import { KastesDaoService } from './dao/kastes-dao.service';

@Controller('kastes')
@Modules('kastes')
export class VeikaliController {

    constructor(
        private readonly veikaliDao: VeikaliDaoService,
        private readonly jobsService: JobsService,
        private readonly kastesDao: KastesDaoService,
    ) { }

    @Put()
    async insertTable(
        @Body() veikali: Veikals[],
    ) {
        const jobIds = [...new Set(veikali.map(veikals => veikals.pasutijums)).values()];
        const resp = await this.veikaliDao.insertMany(
            veikali,
            jobIds,
        );
        await this.jobsService.setProduction(jobIds, { isLocked: true });
    }

    @Get(':jobId/apjomi')
    async getApjomi(
        @Param('jobId', ParseIntPipe) jobId: number
    ) {
        return this.veikaliDao.apjomi(jobId);
    }

    @Get(':jobId')
    async getKastes(
        @Param('jobId', ParseIntPipe) jobId: number
    ) {
        return this.kastesDao.findAllKastes(jobId);
    }



}
 /*
@Post('preferences')
private async postPreferences(req: Request, res: Response) {
req.log.debug('post kastes preferences', req.body);
const username = req.session?.user?.username || '';
const preferences = req.body;
const modifiedCount = await this.usersDao.updateUserPreferences(
username,
'kastes',
preferences,
);
res.json({
error: false,
modifiedCount,
});
}

@Post('label')
private async setLabel(req: Request, res: Response) {
const pasutijumsId = +(req.query.pasutijumsId || 0);
const kods = req.body.kods;
req.log.info('set kastes label', { pasutijumsId, kods });
res.json(await this.kastesDao.setLabel(pasutijumsId, kods));
}

@Post('veikali')
private async updateVeikali(req: Request, res: Response) {
const { veikali } = req.body as { veikali: Veikals[]; };
if (!veikali) {
throw new Error('invalid data');
}
res.json(await this.kastesDao.updateVeikali(veikali));
}

@Post(':id/:kaste/gatavs/:yesno')
private async setGatavs(req: Request, res: Response) {
const params = {
id: new ObjectId(req.params.id as string),
kaste: +req.params.kaste,
yesno: +req.params.yesno ? true : false,
};
req.log.info('post gatavs', params);
// const { field, id, kaste, yesno } = req.body;
res.json(await this.kastesDao.setGatavs(params));
}

@Get('preferences')
private async getPreferences(req: Request, res: Response) {
const username = req.session?.user?.username || '';
res.json({
error: false,
userPreferences: await this.usersDao.getUserPreferences(
username,
'kastes',
),
});
}




@Delete('')
private async deleteKastes(req: Request, res: Response) {
if (!req.query.pasutijumsId || isNaN(+req.query.pasutijumsId)) {
throw new Error('no jobId');
}
const pasutijumsId = +req.query.pasutijumsId;
req.log.info('delete kastes requested', pasutijumsId);
res.json(await this.kastesDao.deleteKastes(pasutijumsId));
}
*/