import { FolderPath } from './folder-path';
import { JobBase } from '../interfaces';

const fileName = ' Etiķetes Tine 8/2 + 8/3 ';
const fileNameSanitized = 'Etiketes Tine 82 + 83';

const obj: JobBase = {
  customer: 'Altavia',
  name: fileName,
  jobStatus: {
    generalStatus: 10,
  },
  receivedDate: new Date('2020-09-12T11:31:18.179Z'),
  jobId: 43132,
  dueDate: new Date('2020-09-14T20:59:59.999Z'),
  custCode: 'ALT',
};

const result: string[] = [
  '2020',
  '09-Septembris',
  'ALT-Input',
  '43132-' + fileNameSanitized,
];

describe('Should create correct path', () => {
  test('path should be correct', () =>
    expect(FolderPath.toArray(obj)).toEqual(result));

  test('should return empty array when not all data provided', () =>
    expect(FolderPath.toArray({} as JobBase)).toEqual([]));
});

describe('should sanitize pathname', () => {
  test('should replace diactrics and remove forbidden symbols', () => {
    expect(FolderPath.sanitizeFileName(fileName)).toEqual(fileNameSanitized);
  });
});
