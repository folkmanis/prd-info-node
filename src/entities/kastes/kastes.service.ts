import { Injectable } from '@nestjs/common';
import { CreateKasteDto } from './dto/create-kaste.dto';
import { UpdateKasteDto } from './dto/update-kaste.dto';

@Injectable()
export class KastesService {
  create(createKasteDto: CreateKasteDto) {
    return 'This action adds a new kaste';
  }

  findAll() {
    return `This action returns all kastes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kaste`;
  }

  update(id: number, updateKasteDto: UpdateKasteDto) {
    return `This action updates a #${id} kaste`;
  }

  remove(id: number) {
    return `This action removes a #${id} kaste`;
  }
}
