import { BadRequestException } from '@nestjs/common';
import sanitize from 'sanitize-filename';

export function sanitizeFileName(name: string): string {
  if (typeof name !== 'string') {
    throw new BadRequestException(`Invalid filename ${name}`);
  }
  return sanitize(removeDiactrics(name.trim()));
}

export function removeDiactrics(s: string): string {
  return s.normalize('NFKD').replace(/[\u0300-\u036F]/g, '');
}

export function toMonthNumberName(date: Date): string {
  return (
    new Intl.DateTimeFormat('lv', { month: '2-digit' }).format(date) +
    '-' +
    capitalize(
      removeDiactrics(
        new Intl.DateTimeFormat('lv', { month: 'long' }).format(date),
      ),
    )
  );
}

export function toDateString(date: Date): string {
  return new Intl.DateTimeFormat('lv').format(date);
}

export function capitalize(s: string): string {
  if (typeof s !== 'string') {
    return '';
  }
  return s[0].toUpperCase() + s.slice(1);
}
