import { Injectable } from '@nestjs/common';
import { CreateXmfSearchDto } from './dto/create-xmf-search.dto';
import { UpdateXmfSearchDto } from './dto/update-xmf-search.dto';

@Injectable()
export class XmfSearchService {
  create(createXmfSearchDto: CreateXmfSearchDto) {
    return 'This action adds a new xmfSearch';
  }

  findAll() {
    return `This action returns all xmfSearch`;
  }

  findOne(id: number) {
    return `This action returns a #${id} xmfSearch`;
  }

  update(id: number, updateXmfSearchDto: UpdateXmfSearchDto) {
    return `This action updates a #${id} xmfSearch`;
  }

  remove(id: number) {
    return `This action removes a #${id} xmfSearch`;
  }
}
