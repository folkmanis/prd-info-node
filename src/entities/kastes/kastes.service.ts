import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';
import { JobsDao } from '../jobs/dao/jobs-dao.service';
import { KastesDaoService } from './dao/kastes-dao.service';
import { VeikalsKaste } from './dto/veikals-kaste.dto';
import { COLORS, Colors } from './entities/colors';
import { ObjectId } from 'mongodb';

const PACKAGING_JOBS_COLLECTION = 'packaging_jobs';
const PACKAGES_COLLECTION = 'packages';

@Injectable()
export class KastesService {
  private firestore = getFirestore();

  private packagingJobsCollection = this.firestore.collection(
    PACKAGING_JOBS_COLLECTION,
  );

  constructor(
    private kastesDao: KastesDaoService,
    private readonly jobsDao: JobsDao,
  ) {}

  async copyToFirestore(jobId: number) {
    const docRef = this.packagingJobsCollection.doc(jobId.toString());
    const collectionRef = docRef.collection(PACKAGES_COLLECTION);

    const batch = this.firestore.batch();

    const packages = this.kastesDao.findAllKastesCursor(jobId);

    const packageSizeQuantities: Record<1 | 2 | 3 | 4 | 5, number> = {
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

    const oldDocs = await collectionRef.get();
    oldDocs.forEach((doc) => batch.delete(doc.ref));

    batch.delete(docRef);

    for await (const kaste of packages) {
      packageSizeQuantities[kaste.kastes.total as 1 | 2 | 3 | 4 | 5] += 1;

      for (const color of COLORS) {
        colorTotals[color] += kaste.kastes[color];
      }

      batch.set(collectionRef.doc(), this.boxToObject(kaste));
    }

    const job = await this.jobsDao.getOne(jobId);

    batch.set(this.packagingJobsCollection.doc(jobId.toString()), {
      box_size_quantities: packageSizeQuantities,
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

  async copyFromFirestore(jobId: number) {
    const docRef = this.packagingJobsCollection.doc(jobId.toString());
    const collectionRef = docRef.collection(PACKAGES_COLLECTION);
    const snapshot = await collectionRef
      .select('document_id', 'box_sequence', 'completed')
      .get();
    const updates: { _id: ObjectId; kaste: number; value: boolean }[] =
      snapshot.docs
        .map((doc) => doc.data())
        .filter((data) => this.isDataDefined(data))
        .map((data) => this.objectToUpdate(data));
    return this.kastesDao.setGatavsBulkUpdate(updates);
  }

  private boxToObject(kaste: VeikalsKaste): Record<string, any> {
    return {
      address: kaste.adrese,
      document_id: kaste._id.toString(),
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

  private objectToUpdate(data: Record<string, any>): {
    _id: ObjectId;
    kaste: number;
    value: boolean;
  } {
    return {
      _id: new ObjectId(data['document_id']),
      kaste: data['box_sequence'],
      value: data['completed'] || false,
    };
  }

  private isDataDefined(data: Record<string, any>): boolean {
    return (
      data['document_id'] != undefined &&
      typeof data['box_sequence'] === 'number'
    );
  }
}
