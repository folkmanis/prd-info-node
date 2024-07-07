import { Module } from '@nestjs/common';
import { PaytraqController } from './paytraq.controller.js';
import { PaytraqDaoService } from './paytraq-dao/paytraq-dao.service.js';
import { PreferencesModule } from '../preferences/index.js';

@Module({
  imports: [PreferencesModule],
  controllers: [PaytraqController],
  providers: [PaytraqDaoService],
})
export class PaytraqModule { }
