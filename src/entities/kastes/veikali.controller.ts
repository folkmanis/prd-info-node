import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { JobsService } from '../jobs/jobs.service.js';
import { VeikaliDaoService } from './dao/veikali-dao.service.js';
import { VeikalsCreateDto } from './dto/veikals-create.dto.js';
import { VeikalsUpdateDto } from './dto/veikals-update.dto.js';
import { Veikals } from './entities/veikals.js';

@Controller('kastes')
@Modules('kastes')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class VeikaliController {
  constructor(
    private readonly veikaliDao: VeikaliDaoService,
    private readonly jobsService: JobsService,
  ) {}

  @Put()
  @UseInterceptors(new ResponseWrapperInterceptor('modifiedCount'))
  async insertTable(@Body() veikali: VeikalsCreateDto[]) {
    const jobIds = [
      ...new Set(veikali.map((veikals) => veikals.pasutijums)).values(),
    ];
    return this.veikaliDao.insertMany(veikali, jobIds);
  }

  @Get('veikali/:jobId')
  async getVeikali(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.veikaliDao.pasutijums(jobId);
  }

  @Patch('veikals')
  async updateOneOrderVeikals(
    @Body() veikals: VeikalsUpdateDto,
  ): Promise<Veikals | null> {
    return this.veikaliDao.updateOne(veikals);
  }

  @Get(':jobId/apjomi')
  async getApjomi(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.veikaliDao.apjomi(jobId);
  }

  @Delete(':jobId')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteOrder(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.veikaliDao.deleteOrder(jobId);
  }
}
