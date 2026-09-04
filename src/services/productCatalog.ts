import { PriceItem, ApiPriceItem } from '../types';

export interface CatalogProductDefinition {
  id: string;
  apiId?: string;
  name: string;
  displayName?: string;
  category: 'gold' | 'coin' | 'currency' | 'global';
  unit: 'تومان' | 'دلار';
  purity?: string;
  weight?: string;
  isHot?: boolean;
  matchTitles?: string[];
  sortOrder: number;
}

/**
 * Standard product catalog definitions for all gold, coin, and silver items.
 * Maps stable API UUIDs and titles to frontend presentation products.
 */
export const PRODUCT_CATALOG: CatalogProductDefinition[] = [
  // ================= GOLD CATEGORY =================
  {
    id: 'gold-18k',
    name: 'طلای ۱۸ عیار',
    displayName: 'طلای ۱۸ عیار',
    category: 'gold',
    unit: 'تومان',
    purity: '۷۵۰/۱۰۰۰',
    weight: '۱ گرم',
    matchTitles: ['طلای ۱۸ عیار', 'طلا 18 عیار', 'طلای 18 عیار', '18k'],
    sortOrder: 1,
  },
  {
    id: 'gold-24k',
    name: 'طلای ۲۴ عیار',
    displayName: 'طلای ۲۴ عیار',
    category: 'gold',
    unit: 'تومان',
    purity: '۹۹۹/۱۰۰۰',
    weight: '۱ گرم',
    matchTitles: ['طلای ۲۴ عیار', 'طلا 24 عیار', 'طلای 24 عیار', '24k'],
    sortOrder: 2,
  },
  {
    id: 'gold-mesghal',
    name: 'مثقال طلا (مظنه)',
    displayName: 'مثقال طلا',
    category: 'gold',
    unit: 'تومان',
    purity: '۷۰۵/۱۰۰۰ (۱۷ عیار)',
    weight: '۴.۶۰۸ گرم',
    matchTitles: ['مثقال طلا', 'مظنه', 'مثقال طلا (مظنه)'],
    sortOrder: 3,
  },
  {
    id: 'gold-abshodeh',
    name: 'طلای آبشده نقدی',
    displayName: 'طلای آبشده',
    category: 'gold',
    unit: 'تومان',
    purity: 'شمش/آبشده استاندارد',
    matchTitles: ['طلای آبشده نقدی', 'آبشده نقدی', 'آبشده'],
    sortOrder: 4,
  },
  {
    id: 'gold-18k-750',
    name: 'طلای ۱۸ عیار / ۷۵۰',
    displayName: 'طلای ۱۸ عیار ۷۵۰',
    category: 'gold',
    unit: 'تومان',
    purity: '۷۵۰ استاندارد',
    matchTitles: ['طلای ۱۸ عیار / ۷۵۰', 'طلا 750', '۱۸ عیار ۷۵۰'],
    sortOrder: 5,
  },
  {
    id: 'gold-18k-740',
    name: 'طلای ۱۸ عیار / ۷۴۰',
    displayName: 'طلای ۱۸ عیار ۷۴۰',
    category: 'gold',
    unit: 'تومان',
    purity: '۷۴۰ کارگاهی',
    matchTitles: ['طلای ۱۸ عیار / ۷۴۰', 'طلا 740', '۱۸ عیار ۷۴۰'],
    sortOrder: 6,
  },
  {
    id: 'gold-used',
    name: 'طلای دست دوم (بدون اجرت)',
    displayName: 'طلای دست دوم',
    category: 'gold',
    unit: 'تومان',
    purity: '۷۵۰ مستعمل',
    matchTitles: ['طلای دست دوم (بدون اجرت)', 'دست دوم', 'طلای مستعمل'],
    sortOrder: 7,
  },
  {
    id: 'gold-ounce',
    name: 'اونس جهانی طلا',
    displayName: 'اونس جهانی طلا',
    category: 'global',
    unit: 'دلار',
    weight: '۳۱.۱۰۳ گرم (۲۴ عیار)',
    matchTitles: ['اونس جهانی طلا', 'اونس جهانی', 'اونس طلا', 'XAU/USD'],
    sortOrder: 8,
  },

  // ================= COIN & PRECIOUS METAL CATEGORY =================
  {
    id: 'coin-emami',
    apiId: 'e4fc8a24-9cea-48d8-897e-696e3c6cedeb',
    name: 'تمام سکه ۸۶ (امامی)',
    displayName: 'سکه امامی',
    category: 'coin',
    unit: 'تومان',
    weight: '۸.۱۳۳ گرم',
    purity: '۹۰۰/۱۰۰۰ (۲۱.۶ عیار)',
    isHot: true,
    matchTitles: ['تمام سکه 86', 'تمام سکه ۸۶', 'سکه امامی (طرح جدید)', 'سکه امامی', 'تمام سکه طرح جدید'],
    sortOrder: 10,
  },
  {
    id: 'coin-bahar-azadi',
    apiId: 'ec73c538-9d68-4099-a537-3aa31f6013ee',
    name: 'تمام سکه تاریخ پایین (طرح قدیم)',
    displayName: 'سکه بهار آزادی',
    category: 'coin',
    unit: 'تومان',
    weight: '۸.۱۳۳ گرم',
    purity: '۹۰۰/۱۰۰۰',
    matchTitles: ['تمام سکه تاریخ پایین', 'تمام سکه بهار آزادی (طرح قدیم)', 'تمام سکه بهار آزادی', 'سکه بهار آزادی'],
    sortOrder: 11,
  },
  {
    id: 'coin-nim',
    apiId: '31e3e205-2ab7-49b4-a96a-b614944390a4',
    name: 'نیم سکه ۸۶',
    displayName: 'نیم سکه',
    category: 'coin',
    unit: 'تومان',
    weight: '۴.۰۶۶ گرم',
    purity: '۹۰۰/۱۰۰۰',
    matchTitles: ['نیم سکه 86', 'نیم سکه ۸۶', 'نیم سکه بهار آزادی', 'نیم سکه'],
    sortOrder: 12,
  },
  {
    id: 'coin-rob',
    apiId: 'a554e4b0-dfc3-421e-ac4d-4660a117f525',
    name: 'ربع سکه ۸۶',
    displayName: 'ربع سکه',
    category: 'coin',
    unit: 'تومان',
    weight: '۲.۰۳۳ گرم',
    purity: '۹۰۰/۱۰۰۰',
    matchTitles: ['ربع سکه 86', 'ربع سکه ۸۶', 'ربع سکه بهار آزادی', 'ربع سکه'],
    sortOrder: 13,
  },
  {
    id: 'coin-naqd-farda',
    apiId: 'c781493f-b43c-4604-a4d6-479d3309bcbe',
    name: 'سکه نقد فردا',
    displayName: 'سکه نقد فردا',
    category: 'coin',
    unit: 'تومان',
    weight: '۸.۱۳۳ گرم',
    purity: '۹۰۰/۱۰۰۰ (معامله فردا)',
    matchTitles: ['نقد فردا', 'سکه نقد فردا'],
    sortOrder: 14,
  },
  {
    id: 'coin-pas-fardayi',
    apiId: '57d71a72-15c6-4e75-9913-7e4d1a2c76ee',
    name: 'سکه پس فردایی',
    displayName: 'سکه پسفردایی',
    category: 'coin',
    unit: 'تومان',
    weight: '۸.۱۳۳ گرم',
    purity: '۹۰۰/۱۰۰۰ (معامله پس‌فردا)',
    matchTitles: ['پس فردایی', 'سکه پس فردایی'],
    sortOrder: 15,
  },
  {
    id: 'silver-nadir-1000',
    apiId: 'a1985fec-0626-4c80-b6d8-5f30d32e725a',
    name: 'شمش نقره ۱۰۰۰ گرمی نادیر',
    displayName: 'شمش نقره نادیر ۱ کیلویی',
    category: 'coin',
    unit: 'تومان',
    weight: '۱۰۰۰ گرم (۱ کیلو)',
    purity: '۹۹۹.۹ خالص',
    matchTitles: ['شمش نقره 1000گرمی نادیر', 'شمش نقره ۱۰۰۰ گرمی نادیر', 'شمش نقره نادیر'],
    sortOrder: 16,
  },
  {
    id: 'silver-emarati-1000',
    apiId: 'a1181a60-ef56-4bf8-8660-10d53dbd0c2a',
    name: 'شمش نقره ۱۰۰۰ گرمی اماراتی',
    displayName: 'شمش نقره اماراتی ۱ کیلویی',
    category: 'coin',
    unit: 'تومان',
    weight: '۱۰۰۰ گرم (۱ کیلو)',
    purity: '۹۹۹.۰ استاندارد',
    matchTitles: ['شمش نقره1000گرمی اماراتی', 'شمش نقره ۱۰۰۰ گرمی اماراتی', 'شمش نقره اماراتی'],
    sortOrder: 17,
  },
  {
    id: 'coin-gerami',
    name: 'سکه یک گرمی',
    displayName: 'سکه گرمی',
    category: 'coin',
    unit: 'تومان',
    weight: '۱.۰۱ گرم',
    purity: '۹۰۰/۱۰۰۰',
    matchTitles: ['سکه یک گرمی', 'سکه ۱ گرمی', 'سکه گرمی'],
    sortOrder: 18,
  },
  {
    id: 'coin-gerami-banki',
    name: 'سکه گرمی پارسیان (۱ گرم)',
    displayName: 'سکه پارسیان ۱ گرمی',
    category: 'coin',
    unit: 'تومان',
    weight: '۱.۰۰۰ گرم',
    purity: '۷۵۰ عیار',
    matchTitles: ['سکه گرمی پارسیان (۱ گرم)', 'سکه پارسیان', 'پارسیان ۱ گرمی'],
    sortOrder: 19,
  },
];

/**
 * Safely parses API price values (strings or numbers) into positive numbers or null.
 * Handles -1 as unavailable/null, handles strings with commas, empty strings, and non-numeric inputs.
 */
export function parseApiPrice(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (value <= 0 || isNaN(value) || value === -1) return null;
    return value;
  }
  const cleanStr = String(value).trim().replace(/,/g, '');
  if (!cleanStr || cleanStr === '-1' || cleanStr === '0') return null;
  const parsed = parseFloat(cleanStr);
  if (isNaN(parsed) || parsed <= 0 || parsed === -1) return null;
  return parsed;
}

/**
 * Normalizes title string for robust matching
 */
function normalizeTitle(t: string): string {
  return t
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * Finds a matching API item for a given catalog product definition
 */
export function findMatchingApiItem(
  definition: CatalogProductDefinition,
  apiItems: ApiPriceItem[]
): ApiPriceItem | undefined {
  // 1. Exact API ID match (highest priority)
  if (definition.apiId) {
    const matchById = apiItems.find((api) => api.id === definition.apiId);
    if (matchById) return matchById;
  }

  // 2. Exact Title match or listed match titles
  const candidates = [definition.name, ...(definition.matchTitles || [])];
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeTitle(candidate);
    const match = apiItems.find((api) => {
      const normApiTitle = normalizeTitle(api.title);
      return normApiTitle === normalizedCandidate;
    });
    if (match) return match;
  }

  // 3. Substring match
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeTitle(candidate);
    const match = apiItems.find((api) => {
      const normApiTitle = normalizeTitle(api.title);
      return (
        normApiTitle.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normApiTitle)
      );
    });
    if (match) return match;
  }

  return undefined;
}
