import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';
import { JobsDao } from '../jobs/dao/jobs-dao.service';
import { KastesDaoService } from './dao/kastes-dao.service';
import { VeikalsKaste } from './dto/veikals-kaste.dto';
import { COLORS, Colors } from './entities/colors';

const PACKAGING_JOBS_COLLECTION = 'packaging_jobs';
const PACKAGES_COLLECTION = 'packages';

@Injectable()
export class KastesService {
  private firestore = getFirestore();

  private kastesCollection = this.firestore.collection(
    PACKAGING_JOBS_COLLECTION,
  );

  constructor(
    private kastesDao: KastesDaoService,
    private readonly jobsDao: JobsDao,
  ) {}

  async copyToFirestore(jobId: number) {
    const kastesCollection = this.kastesCollection
      .doc(jobId.toString())
      .collection(PACKAGES_COLLECTION);

    const batch = this.firestore.batch();

    const packages = this.kastesDao.findAllKastesCursor(jobId);

    const boxSizeQuantities: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const colorTotals: Record<Colors, number> = {
      yellow: 0,
      rose: 0,
      white: 0,
    };

    for await (const kaste of packages) {
      boxSizeQuantities[kaste.kastes.total as 1 | 2 | 3 | 4 | 5] += 1;
      for (const color of COLORS) {
        colorTotals[color] += kaste.kastes[color];
      }
      batch.set(
        kastesCollection.doc(kaste._id.toString() + kaste.kaste.toString()),
        this.boxToObject(kaste),
      );
    }

    const job = await this.jobsDao.getOne(jobId);

    batch.set(this.kastesCollection.doc(jobId.toString()), {
      box_size_quantities: boxSizeQuantities,
      color_totals: colorTotals,
      name: job?.name ?? '',
    });

    const result = await batch.commit();
    return {
      recordsUpdated: result.length,
      jobId,
      collection: PACKAGES_COLLECTION,
    };
  }

  private boxToObject(kaste: VeikalsKaste): Record<string, any> {
    return {
      address: kaste.adrese,
      address_id: kaste.kods,
      box_sequence: kaste.kaste,
      completed: kaste.kastes.gatavs,
      has_label: kaste.kastes.uzlime,
      rose: kaste.kastes.rose,
      yellow: kaste.kastes.yellow,
      white: kaste.kastes.white,
      total: kaste.kastes.total,
    };
  }
}
