// this configures the apps product categories
export const PRODUCT_CATEGORIES = [
  {
    label: 'E-books',
    value: 'e-books' as const,
    featured: [
      {
        name: 'Editor picks',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/e-books/mixed.jpg',
      },
      {
        name: 'New Arrivals',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/e-books/blue.jpg',
      },
      {
        name: 'Best Sellers',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/e-book/purple.jpg',
      },
    ],
  },
  {
    label: 'Icons',
    value: 'icons' as const,
    featured: [
      {
        name: 'Favorite Icon Picks',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/icons/picks.jpg',
      },
      {
        name: 'New Arrivals',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/icons/new.jpg',
      },
      {
        name: 'Best selling Icons',
        href: '#',
        ImageSrc:
          process.env.NEXT_PUBLIC_SERVER_URL + '/nav/icons/bestsellers.jpg',
      },
    ],
  },
  {
    label: 'Figma Designs',
    value: 'figma' as const,
    featured: [
      {
        name: 'Favorite Icon Picks',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/figma/picks.jpg',
      },
      {
        name: 'New Arrivals',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/figma/new.jpg',
      },
      {
        name: 'Best selling figma',
        href: '#',
        ImageSrc:
          process.env.NEXT_PUBLIC_SERVER_URL + '/nav/figma/bestsellers.jpg',
      },
    ],
  },
  {
    label: 'Fonts',
    value: 'fonts' as const,
    featured: [
      {
        name: 'Favorite Icon Picks',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/fonts/picks.jpg',
      },
      {
        name: 'New Arrivals',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/fonts/new.jpg',
      },
      {
        name: 'Best selling fonts',
        href: '#',
        ImageSrc:
          process.env.NEXT_PUBLIC_SERVER_URL + '/nav/fonts/bestsellers.jpg',
      },
    ],
  },
];

export const FEE = 1;
