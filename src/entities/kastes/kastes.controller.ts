import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { Modules } from '../../login';
import { KastesDaoService } from './dao/kastes-dao.service';
import { VeikalsKaste } from './dto/veikals-kaste.dto';

@Controller('kastes')
@Modules('kastes')
export class KastesController {

  constructor(
    private readonly kastesDao: KastesDaoService,
  ) { }

  @Get('id/:id/:kaste')
  async getKasteById(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Param('kaste', ParseIntPipe) kaste: number,
  ): Promise<VeikalsKaste | undefined> {
    return this.kastesDao.findOneById(id, kaste);
  }

  @Get(':pasutijums/:kods/:kaste')
  async getKasteByPasutijums(
    @Param('pasutijums', ParseIntPipe) pasutijums: number,
    @Param('kods', ParseIntPipe) kods: number,
    @Param('kaste', ParseIntPipe) kaste: number,
  ): Promise<VeikalsKaste | undefined> {
    return this.kastesDao.findOneByPasutijums(pasutijums, kods, kaste);
  }

  @Patch(':pasutijums/:kods/label')
  async setLabel(
    @Param('pasutijums', ParseIntPipe) pasutijums: number,
    @Param('kods', ParseIntPipe) kods: number,
  ): Promise<VeikalsKaste | undefined> {
    return this.kastesDao.setLabel(pasutijums, kods);
  }

  @Patch(':pasutijums/:kods/:kaste/gatavs/:action')
  async setGatavs(
    @Param('pasutijums', ParseIntPipe) pasutijums: number,
    @Param('kods', ParseIntPipe) kods: number,
    @Param('kaste', ParseIntPipe) kaste: number,
    @Param('action', ParseBoolPipe) action: boolean,
  ): Promise<VeikalsKaste | null | undefined> {
    return this.kastesDao.setGatavs(pasutijums, kods, kaste, action);
  }

  @Get(':jobId')
  async getKastes(
    @Param('jobId', ParseIntPipe) jobId: number
  ): Promise<VeikalsKaste[]> {
    return this.kastesDao.findAllKastes(jobId);
  }


}
