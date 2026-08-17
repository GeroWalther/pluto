import { ProductCategory } from '@prisma/client';

export type CategoryConfig = {
  value: ProductCategory;
  label: string;
  blurb: string;
  /** Tailwind classes for the category chip. */
  accent: string;
};

export const PRODUCT_CATEGORIES: CategoryConfig[] = [
  {
    value: ProductCategory.UI_KITS,
    label: 'UI kits',
    blurb: 'Design systems, components and Figma files',
    accent: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
  {
    value: ProductCategory.ICONS,
    label: 'Icons',
    blurb: 'Icon sets in SVG, PNG and font formats',
    accent: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  {
    value: ProductCategory.FONTS,
    label: 'Fonts',
    blurb: 'Typefaces for display, body and code',
    accent: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  {
    value: ProductCategory.TEMPLATES,
    label: 'Templates',
    blurb: 'Landing pages, dashboards and starters',
    accent: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  {
    value: ProductCategory.PHOTOS,
    label: 'Photos',
    blurb: 'Stock photography and texture packs',
    accent: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  {
    value: ProductCategory.EBOOKS,
    label: 'E-books',
    blurb: 'Guides, courses and reference material',
    accent: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
  {
    value: ProductCategory.AUDIO,
    label: 'Audio',
    blurb: 'Loops, samples and sound effects',
    accent: 'bg-teal-50 text-teal-700 ring-teal-200',
  },
];

export const categoryLabel = (value: ProductCategory) =>
  PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export const categoryAccent = (value: ProductCategory) =>
  PRODUCT_CATEGORIES.find((c) => c.value === value)?.accent ??
  'bg-stone-100 text-stone-700 ring-stone-200';

/** Platform commission shown in the UI. Mirrors PLATFORM_FEE_BPS. */
export const PLATFORM_FEE_LABEL = '5%';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Best selling' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
] as const;
