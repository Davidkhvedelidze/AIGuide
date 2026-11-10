import { useCallback } from 'react';

import type { Locale } from '@/data/types';
import { useApp } from '@/store/app';
import { en, type StringKey } from './en';
import { ka } from './ka';

const dictionaries: Record<Locale, Record<StringKey, string>> = { en, ka };

export type { StringKey };
export type Translate = (key: StringKey, params?: Record<string, string | number>) => string;

export function translate(locale: Locale, key: StringKey, params?: Record<string, string | number>): string {
  const template = dictionaries[locale][key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function useT(): Translate {
  const locale = useApp((s) => s.locale);
  return useCallback((key, params) => translate(locale, key, params), [locale]);
}

export const dictionariesForTest = dictionaries;
