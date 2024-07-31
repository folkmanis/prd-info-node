import { Injectable } from '@nestjs/common';
import { TransportationRouteSheetDaoService } from './dao/route-sheet-dao.service.js';
import { ObjectId } from 'mongodb';
import { UpdateRouteSheetDto } from './dto/update-route-sheet.dto.js';
import { TransportationRouteSheet } from './entities/route-sheet.entity.js';
import { CreateRouteSheetDto } from './dto/create-route-sheet.dto.js';
import { RouteSheetFilterQuery } from './dto/route-sheet-filter.query.js';

@Injectable()
export class TransportationService {
  constructor(private routeSheetDao: TransportationRouteSheetDaoService) {}

  async getAll(
    query: RouteSheetFilterQuery,
  ): Promise<Partial<TransportationRouteSheet>[]> {
    return this.routeSheetDao.findAll(query.toFilter());
  }

  async getOne(id: ObjectId): Promise<TransportationRouteSheet | null> {
    return this.routeSheetDao.getOneById(id);
  }

  async create(
    driver: CreateRouteSheetDto,
  ): Promise<TransportationRouteSheet | null | undefined> {
    return this.routeSheetDao.insertOne(driver);
  }

  async update(
    id: ObjectId,
    routeSheet: UpdateRouteSheetDto,
  ): Promise<TransportationRouteSheet | null> {
    return this.routeSheetDao.updateOne(id, routeSheet);
  }

  async delete(id: ObjectId): Promise<number> {
    return this.routeSheetDao.deleteOneById(id);
  }
}
