import type { Qualification } from '@/types';

export type CompanyAbilityId =
  | 'automation'
  | 'talent_network'
  | 'brand_engine'
  | 'cost_optimizer'
  | 'research_lab';

export type CompanyStatId =
  | 'management'
  | 'sales'
  | 'tech'
  | 'finance'
  | 'brand';

export type QualificationCategory = Qualification['category'];

export type CompanyTypeBase =
  | 'large_enterprise'
  | 'sme'
  | 'start_up'
  | 'venture'
  | 'mega_venture'
  | 'growth_company'
  | 'listed_company'
  | 'unlisted_company'
  | 'public_company'
  | 'private_company'
  | 'domestic_company'
  | 'foreign_company'
  | 'parent_company'
  | 'subsidiary'
  | 'affiliate'
  | 'group_company'
  | 'established_company'
  | 'emerging_company'
  | 'mature_company'
  | 'white_company'
  | 'black_company'
  | 'sole_proprietorship'
  | 'corporation'
  | 'small_business'
  | 'global_enterprise';

export const COMPANY_ABILITIES: {
  id: CompanyAbilityId;
  name: string;
  description: string;
  salaryBonusPercent: number;
}[] = [
  { id: 'automation', name: '自動化ライン', description: '業務効率が上がり給与が伸びやすい', salaryBonusPercent: 6 },
  { id: 'talent_network', name: '人材ネットワーク', description: '優秀な人材確保で安定収益', salaryBonusPercent: 5 },
  { id: 'brand_engine', name: 'ブランド加速', description: '知名度が収益に直結', salaryBonusPercent: 4 },
  { id: 'cost_optimizer', name: 'コスト最適化', description: '無駄を削減し利益率向上', salaryBonusPercent: 5 },
  { id: 'research_lab', name: '研究開発特化', description: '技術力で高収益を狙う', salaryBonusPercent: 7 }
];

export const COMPANY_STATS: {
  id: CompanyStatId;
  name: string;
  description: string;
  salaryBonusPercent: number;
}[] = [
  { id: 'management', name: '経営力', description: '組織運営が強い', salaryBonusPercent: 6 },
  { id: 'sales', name: '営業力', description: '売上が伸びやすい', salaryBonusPercent: 5 },
  { id: 'tech', name: '技術力', description: '高付加価値で利益率アップ', salaryBonusPercent: 6 },
  { id: 'finance', name: '資金力', description: '投資余力で安定収益', salaryBonusPercent: 4 },
  { id: 'brand', name: 'ブランド力', description: '信頼と人気で収益増', salaryBonusPercent: 5 }
];

export const COMPANY_ABILITY_QUAL_CATEGORIES: Record<CompanyAbilityId, QualificationCategory[]> = {
  automation: ['business', 'special'],
  talent_network: ['language', 'business'],
  brand_engine: ['creative', 'business'],
  cost_optimizer: ['business'],
  research_lab: ['medical', 'special', 'creative']
};

export const COMPANY_STAT_QUAL_CATEGORIES: Record<CompanyStatId, QualificationCategory[]> = {
  management: ['business'],
  sales: ['language', 'business'],
  tech: ['special', 'medical'],
  finance: ['business'],
  brand: ['creative', 'language']
};

export const COMPANY_BASE_SALARY: Record<CompanyTypeBase, number> = {
  start_up: 140000,
  venture: 180000,
  sme: 200000,
  small_business: 160000,
  sole_proprietorship: 120000,
  corporation: 220000,
  large_enterprise: 320000,
  mega_venture: 380000,
  growth_company: 260000,
  listed_company: 420000,
  unlisted_company: 260000,
  public_company: 280000,
  private_company: 240000,
  global_enterprise: 400000,
  domestic_company: 220000,
  foreign_company: 300000,
  parent_company: 300000,
  subsidiary: 220000,
  affiliate: 200000,
  group_company: 240000,
  established_company: 260000,
  emerging_company: 190000,
  mature_company: 280000,
  white_company: 260000,
  black_company: 140000
};
