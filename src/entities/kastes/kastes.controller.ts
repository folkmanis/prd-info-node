import { ParseIntPipe, Controller, UseInterceptors, Get, Post, Body, Patch, Param, Delete, ParseBoolPipe } from '@nestjs/common';
import { VeikalsCreateDto } from './dto/veikals-create.dto';
import { VeikalsUpdateDto } from './dto/veikals-update.dto';
import { Modules } from '../../login';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { ObjectId } from 'mongodb';
import { Kaste } from './entities/kaste.entity';
import { KastesDaoService } from './dao/kastes-dao.service';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { Veikals } from './entities/veikals';
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
  ): Promise<VeikalsKaste | undefined> {
    return this.kastesDao.setGatavs(pasutijums, kods, kaste, action);
  }

}
