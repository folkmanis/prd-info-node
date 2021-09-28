import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateKasteDto } from './dto/create-kaste.dto';
import { UpdateKasteDto } from './dto/update-kaste.dto';
import { Modules } from '../../login';

@Controller('kastes')
@Modules('kastes')
export class KastesController {
  constructor(

  ) { }

}
