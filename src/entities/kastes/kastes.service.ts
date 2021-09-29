import { Injectable } from '@nestjs/common';
import { VeikalsCreateDto } from './dto/veikals-create.dto';
import { VeikalsUpdateDto } from './dto/veikals-update.dto';

@Injectable()
export class KastesService {
  create(createKasteDto: VeikalsCreateDto) {
    return 'This action adds a new kaste';
  }

  findAll() {
    return `This action returns all kastes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kaste`;
  }

  update(id: number, updateKasteDto: VeikalsUpdateDto) {
    return `This action updates a #${id} kaste`;
  }

  remove(id: number) {
    return `This action removes a #${id} kaste`;
  }
}
