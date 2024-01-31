import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ObjectIdPipe } from '../../lib/object-id.pipe';
import { Modules } from '../../login';
import { KastesDaoService } from './dao/kastes-dao.service';
import { VeikalsKaste } from './dto/veikals-kaste.dto';
import { KastesService } from './kastes.service';

@Controller('kastes')
@Modules('kastes')
export class KastesController {
  constructor(
    private readonly kastesDao: KastesDaoService,
    private readonly kastesService: KastesService,
  ) {}

  @Patch(':id/:kaste/gatavs/:action')
  async setGatavs(
    @Param('id', ObjectIdPipe) id: ObjectId,
    @Param('kaste', ParseIntPipe) kaste: number,
    @Param('action', ParseBoolPipe) action: boolean,
  ): Promise<VeikalsKaste | null | undefined> {
    return this.kastesDao.setGatavs(id, kaste, action);
  }

  @Patch(':pasutijums/:kods/label')
  async setLabel(
    @Param('pasutijums', ParseIntPipe) pasutijums: number,
    @Param('kods', ParseIntPipe) kods: number,
  ): Promise<VeikalsKaste | undefined> {
    return this.kastesDao.setLabel(pasutijums, kods);
  }

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

  @Get(':jobId')
  async getKastes(
    @Param('jobId', ParseIntPipe) jobId: number,
  ): Promise<VeikalsKaste[]> {
    return this.kastesDao.findAllKastes(jobId);
  }

  @Post(':jobId/firestore')
  async firestoreUpload(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.kastesService.copyToFirestore(jobId);
  }
}
