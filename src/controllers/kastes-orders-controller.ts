import {
  ClassErrorMiddleware,
  ClassMiddleware,
  ClassWrapper,
  Controller,
  Get,
  Post,
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { JobsDao, KastesDao } from '../dao';
import {
  Colors,
  ColorTotals,
  JobProduct,
  KastesJob,
  KastesJobResponse,
} from '../interfaces';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

@Controller('data/kastes-orders')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
  Preferences.getUserPreferences,
  PrdSession.validateSession,
  PrdSession.validateModule('kastes'),
])
@ClassWrapper(asyncWrapper)
export class KastesOrderController {
  constructor(private jobsDao: JobsDao, private kastesDao: KastesDao) {}

  @Get(':id')
  private async getOrder(req: Request, res: Response) {
    const jobId = +req.params.id;
    const result: Promise<KastesJobResponse> = Promise.all([
      this.jobsDao.getJob(jobId),
      this.kastesDao.colorTotals(jobId),
      this.kastesDao.apjomiTotals(jobId),
      this.kastesDao.veikaliList(jobId),
    ]).then(([job, colorTotals, apjomiTotals, veikali]) => ({
      error: false,
      data: job
        ? {
            ...job,
            category: 'perforated paper',
            isLocked: false,
            apjomsPlanned:
              job.products instanceof Array
                ? productsTocolorTotals(job.products)
                : [],
            totals: {
              veikali: veikali.length,
              colorTotals,
              apjomiTotals,
            },
            veikali,
          }
        : undefined,
    }));
    res.json(await result);
  }

  @Get('')
  async getKastesJobs(req: Request, res: Response) {
    const veikali: boolean = req.query.veikali === '1';
    res.json(await this.jobsDao.getKastesJobs(veikali));
  }

  @Post(':id')
  private async updatePasutijums(req: Request, res: Response) {
    const jobId = +req.params.id;
    if (isNaN(jobId)) {
      throw new Error('jobId not provided');
    }
    const pas = req.body as Partial<KastesJob>;
    delete pas.jobId;
    res.json({
      error: false,
      modifiedCount: await this.jobsDao.updateJob(jobId, pas),
    });
  }
}

function productsTocolorTotals(products: JobProduct[]): ColorTotals[] {
  const colors: string[] = ['rose', 'white', 'yellow'];
  return products
    .filter((prod) => colors.indexOf(prod.name) > -1)
    .map((prod) => ({ color: prod.name as Colors, total: prod.count }));
}
