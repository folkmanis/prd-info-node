import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Put, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { Modules } from '../../login';
import { JobsService } from '../jobs/jobs.service';
import { KastesDaoService } from './dao/kastes-dao.service';
import { VeikaliDaoService } from './dao/veikali-dao.service';
import { VeikalsCreateDto } from './dto/veikals-create.dto';
import { VeikalsKaste } from './dto/veikals-kaste.dto';
import { VeikalsUpdateDto } from './dto/veikals-update.dto';
import { Veikals } from './entities/veikals';

@Controller('kastes')
@Modules('kastes')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class VeikaliController {

    constructor(
        private readonly veikaliDao: VeikaliDaoService,
        private readonly jobsService: JobsService,
        private readonly kastesDao: KastesDaoService,
    ) { }

    @Put()
    @UseInterceptors(new ResponseWrapperInterceptor('modifiedCount'))
    async insertTable(
        @Body() veikali: VeikalsCreateDto[],
    ) {
        const jobIds = [...new Set(veikali.map(veikals => veikals.pasutijums)).values()];
        const resp = await this.veikaliDao.insertMany(
            veikali,
            jobIds,
        );
        await this.jobsService.setProduction(jobIds, { isLocked: true });
    }

    @Patch(':jobId/:kods')
    async updateOneOrderVeikals(
        @Param('jobId', ParseIntPipe) jobId: number,
        @Param('kods', ParseIntPipe) kods: number,
        @Body() veikals: VeikalsUpdateDto,
    ): Promise<Veikals | undefined> {
        return this.veikaliDao.updateOne(jobId, kods, veikals);
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
    ): Promise<VeikalsKaste[]> {
        return this.kastesDao.findAllKastes(jobId);
    }

    @Delete(':jobId')
    @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
    async deleteOrder(
        @Param('jobId', ParseIntPipe) jobId: number,
    ) {
        return this.veikaliDao.deleteOrder(jobId);
    }


}
