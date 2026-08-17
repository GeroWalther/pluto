/**
 * Seeds a believable demo catalogue: an admin, a handful of sellers, and
 * products across every category. Safe to run repeatedly — everything is
 * upserted on a stable key.
 *
 *   npm run db:seed
 */
import { hash } from 'bcryptjs';
import {
  AuthProvider,
  PrismaClient,
  ProductCategory,
  ProductStatus,
  Role,
} from '@prisma/client';

const prisma = new PrismaClient();

const image = (seed: string, w = 900, h = 700) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

type SeedProduct = {
  name: string;
  description: string;
  priceCents: number;
  category: ProductCategory;
  status?: ProductStatus;
  seed: string;
  files: string[];
  soldCount?: number;
};

const sellers: { name: string; email: string; bio: string; products: SeedProduct[] }[] = [
  {
    name: 'Mara Lindqvist',
    email: 'mara@pluto.test',
    bio: 'Product designer in Stockholm. I make design systems that survive contact with real engineering teams.',
    products: [
      {
        name: 'Nebula UI — Dashboard Design System',
        description:
          'A complete dashboard design system for Figma, built around a 4px grid and semantic colour tokens.\n\nIncludes 180+ components with variants, light and dark themes, 24 prebuilt dashboard screens, and a documented token layer that maps one-to-one onto Tailwind config. Every component uses auto-layout, so resizing a card does not fall apart.\n\nDelivered as a single Figma file plus a JSON token export you can feed straight into your build.',
        priceCents: 4900,
        category: ProductCategory.UI_KITS,
        seed: 'nebula-ui',
        files: ['nebula-ui-v2.fig', 'design-tokens.json'],
        soldCount: 34,
      },
      {
        name: 'Orbit — 640 Interface Icons',
        description:
          'A pixel-perfect icon set drawn on a 24px grid at three weights: light, regular and bold.\n\nEvery icon is a single compound path with no strokes to expand, so they scale cleanly and drop into any build without cleanup. Ships as SVG sprites, individual SVGs, a webfont, and a ready-made React component library with TypeScript types.',
        priceCents: 2400,
        category: ProductCategory.ICONS,
        seed: 'orbit-icons',
        files: ['orbit-icons-svg.zip', 'orbit-react.zip'],
        soldCount: 51,
      },
    ],
  },
  {
    name: 'Tobias Renner',
    email: 'tobias@pluto.test',
    bio: 'Type designer. Drawing letterforms since 2011, mostly for screens.',
    products: [
      {
        name: 'Halden Grotesk — Variable Typeface',
        description:
          'A neo-grotesque family with a variable weight axis from Thin to Black, plus a matching italic.\n\nDrawn specifically for interface work: open apertures, a tall x-height and disambiguated 1/l/I. Includes tabular figures, four stylistic sets, and full Latin Extended coverage across 219 languages.\n\nDesktop, web and app licences included for teams up to 20 people.',
        priceCents: 7900,
        category: ProductCategory.FONTS,
        seed: 'halden-type',
        files: ['halden-grotesk-otf.zip', 'halden-grotesk-web.zip', 'licence.pdf'],
        soldCount: 18,
      },
      {
        name: 'Monaco Mono — Coding Typeface',
        description:
          'A monospaced typeface for long editing sessions. Six weights, true italics, and 340 programming ligatures that can be switched off per-editor.\n\nDesigned at 13px first and scaled up rather than the other way round, so it stays crisp at the size you actually read code at. Includes Powerline and Nerd Font patched builds.',
        priceCents: 5400,
        category: ProductCategory.FONTS,
        seed: 'monaco-mono',
        files: ['monaco-mono.zip', 'nerd-font-patched.zip'],
        soldCount: 27,
      },
    ],
  },
  {
    name: 'Priya Raghunathan',
    email: 'priya@pluto.test',
    bio: 'Front-end engineer writing about the boring parts of shipping software.',
    products: [
      {
        name: 'Shipping Next.js to Production',
        description:
          'A 240-page practical guide to running Next.js applications that real users depend on.\n\nCovers caching semantics that actually match the docs, database connection pooling on serverless, webhook idempotency, background jobs, observability, and the deployment mistakes that only show up under load.\n\nWritten against the App Router. Includes a companion repository with every example as a runnable branch.',
        priceCents: 3400,
        category: ProductCategory.EBOOKS,
        seed: 'nextjs-book',
        files: ['shipping-nextjs.pdf', 'shipping-nextjs.epub'],
        soldCount: 62,
      },
      {
        name: 'SaaS Starter — Auth, Billing and Teams',
        description:
          'A production-shaped starter kit: authentication, Stripe subscriptions, team invitations, role-based access control and an admin panel.\n\nNot a demo. It has migrations, seed data, webhook handling with idempotency, transactional email templates and a test suite that covers the billing edge cases people usually discover in production.',
        priceCents: 8900,
        category: ProductCategory.TEMPLATES,
        seed: 'saas-starter',
        files: ['saas-starter.zip', 'setup-guide.pdf'],
        soldCount: 41,
      },
    ],
  },
  {
    name: 'Jonas Beck',
    email: 'jonas@pluto.test',
    bio: 'Photographer and sound designer. Northern light, mostly.',
    products: [
      {
        name: 'Nordic Coastline — 80 Photographs',
        description:
          'Eighty high-resolution photographs shot along the Norwegian and Icelandic coast over two winters.\n\nAll images are 6000×4000 or larger, delivered as both edited JPEGs and unprocessed RAW files so you can take your own pass at them. Royalty-free for commercial and editorial use, no attribution required.',
        priceCents: 3900,
        category: ProductCategory.PHOTOS,
        seed: 'nordic-photos',
        files: ['nordic-coastline-jpg.zip', 'nordic-coastline-raw.zip'],
        soldCount: 23,
      },
      {
        name: 'Room Tone — Ambient Field Recordings',
        description:
          'Ninety minutes of clean field recordings: empty offices, night trains, rain on different surfaces, distant traffic, forest at dawn.\n\nRecorded at 96kHz/24-bit with a matched stereo pair, edited to remove clicks and handling noise, and loop-prepared where it makes sense. Ships as WAV and as a ready-to-drop Ableton pack.',
        priceCents: 2900,
        category: ProductCategory.AUDIO,
        seed: 'room-tone',
        files: ['room-tone-wav.zip', 'room-tone-ableton.alp'],
        soldCount: 15,
      },
      {
        name: 'Grain — 40 Analogue Film Overlays',
        description:
          'Scanned grain and light-leak overlays from real 35mm stock, cleaned up and tiled seamlessly at 4K.\n\nDrop one on a screen-blend layer and a flat digital render immediately stops looking flat. Includes a short guide on which stocks suit which palettes.',
        priceCents: 1900,
        category: ProductCategory.PHOTOS,
        // Left in the queue so the admin dashboard has something to moderate.
        status: ProductStatus.PENDING,
        seed: 'film-grain',
        files: ['grain-overlays-4k.zip'],
      },
    ],
  },
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@pluto.test').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'password123';
  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, passwordHash, emailVerifiedAt: new Date() },
    create: {
      email: adminEmail,
      name: 'Pluto Admin',
      passwordHash,
      role: Role.ADMIN,
      provider: AuthProvider.CREDENTIALS,
      emailVerifiedAt: new Date(),
      bio: 'Keeping the catalogue honest.',
    },
  });

  console.log(`✔ admin: ${admin.email} / ${adminPassword}`);

  // A demo buyer, so the sign-in flow can be shown without registering.
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@pluto.test' },
    update: { passwordHash, emailVerifiedAt: new Date() },
    create: {
      email: 'buyer@pluto.test',
      name: 'Demo Buyer',
      passwordHash,
      provider: AuthProvider.CREDENTIALS,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✔ buyer: ${buyer.email} / ${adminPassword}`);

  let productCount = 0;

  for (const seller of sellers) {
    const user = await prisma.user.upsert({
      where: { email: seller.email },
      update: { bio: seller.bio, passwordHash, emailVerifiedAt: new Date() },
      create: {
        email: seller.email,
        name: seller.name,
        bio: seller.bio,
        passwordHash,
        provider: AuthProvider.CREDENTIALS,
        emailVerifiedAt: new Date(),
        image: image(`avatar-${seller.email}`, 200, 200),
      },
    });

    for (const product of seller.products) {
      const slug = slugify(product.name);

      await prisma.product.upsert({
        where: { slug },
        update: {
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          category: product.category,
          status: product.status ?? ProductStatus.APPROVED,
        },
        create: {
          slug,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          category: product.category,
          status: product.status ?? ProductStatus.APPROVED,
          soldCount: product.soldCount ?? 0,
          sellerId: user.id,
          imageUrls: [
            image(product.seed),
            image(`${product.seed}-2`),
            image(`${product.seed}-3`),
          ],
          imageKeys: [],
          // Seeded "deliverables" point at placeholder assets so the download
          // route has something real to stream in a demo.
          fileUrls: product.files.map((_, i) => image(`${product.seed}-file-${i}`, 1600, 1200)),
          fileKeys: [],
          fileNames: product.files,
        },
      });

      productCount += 1;
    }

    console.log(`✔ seller: ${seller.email} (${seller.products.length} products)`);
  }

  console.log(`\nSeeded ${productCount} products across ${sellers.length} sellers.`);
  console.log('Sign in at /sign-in — every seeded account uses the same password.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
