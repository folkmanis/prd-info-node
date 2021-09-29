import { ParseIntPipe, Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateKasteDto } from './dto/create-kaste.dto';
import { UpdateKasteDto } from './dto/update-kaste.dto';
import { Modules } from '../../login';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { ObjectId } from 'mongodb';
import { Kaste } from './entities/kaste.entity';
import { KastesDaoService } from './dao/kastes-dao.service';

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
  ) {
    return this.kastesDao.findOneById(id, kaste);
  }

  @Get(':pasutijums/:kods/:kaste')
  async getKasteByPasutijums(
    @Param('pasutijums', ParseIntPipe) pasutijums: number,
    @Param('kods', ParseIntPipe) kods: number,
    @Param('kaste', ParseIntPipe) kaste: number,
  ) {
    return this.kastesDao.findOneByPasutijums(pasutijums, kods, kaste);
  }


}
