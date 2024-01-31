import { Inject, Injectable } from '@nestjs/common';
import { KastesDaoService } from './dao/kastes-dao.service';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { instanceToPlain } from 'class-transformer';
import { VeikalsKaste } from './dto/veikals-kaste.dto';

const KASTES_JOB_COLLECTION = 'kastes_job';
const KASTES_COLLECTION = 'kastes';

@Injectable()
export class KastesService {
  private firestore = getFirestore();

  private kastesCollection = this.firestore.collection(KASTES_JOB_COLLECTION);

  constructor(private kastesDao: KastesDaoService) {}

  async copyToFirestore(jobId: number) {
    const kastesCollection = this.kastesCollection
      .doc(jobId.toString())
      .collection(KASTES_COLLECTION);

    const batch = this.firestore.batch();

    const kastes = this.kastesDao.findAllKastesCursor(jobId);

    const apjomi: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for await (const kaste of kastes) {
      apjomi[kaste.kastes.total as 1 | 2 | 3 | 4 | 5] += 1;
      batch.set(
        kastesCollection.doc(kaste._id.toString()),
        this.kasteToObject(kaste),
      );
    }

    batch.set(this.kastesCollection.doc(jobId.toString()), {
      apjomi,
    });

    const result = await batch.commit();
    return {
      recordsUpdated: result.length,
      jobId,
      collection: KASTES_COLLECTION,
    };
  }

  private kasteToObject(kaste: VeikalsKaste): Record<string, any> {
    return {
      adrese: kaste.adrese,
      kods: kaste.kods,
      kaste: kaste.kaste,
      gatavs: kaste.kastes.gatavs,
      uzlime: kaste.kastes.uzlime,
      rose: kaste.kastes.rose,
      yellow: kaste.kastes.yellow,
      white: kaste.kastes.white,
      total: kaste.kastes.total,
    };
  }
}
