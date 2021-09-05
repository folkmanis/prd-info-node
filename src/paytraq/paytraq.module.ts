import { Module } from '@nestjs/common';
import { PaytraqController } from './paytraq.controller';
import { PaytraqDaoService } from './paytraq-dao/paytraq-dao.service';
import { PreferencesModule } from '../preferences';

@Module({
  imports: [PreferencesModule],
  controllers: [PaytraqController],
  providers: [PaytraqDaoService],
})
export class PaytraqModule {}
