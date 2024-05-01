// this configures the apps product categories
export const PRODUCT_CATEGORIES = [
  {
    label: 'E-books',
    value: 'Ebook' as const,
    featured: [
      {
        name: 'Editor picks',
        href: '#',
        ImageSrc: '/public/eis.jpg',
      },
    ],
  },
  {
    label: 'Icons',
    value: 'Icons' as const,
    featured: [
      {
        name: 'Top Icons',
        href: '#',
        ImageSrc: '/public/pluto_system-design.png',
      },
    ],
  },
  {
    label: 'Ui/Ux Designs',
    value: 'UiUx' as const,
    featured: [
      {
        name: 'Well designed Figma',
        href: '#',
        ImageSrc:
          process.env.NEXT_PUBLIC_SERVER_URL + '/nav/figma/bestsellers.jpg',
      },
    ],
  },
  {
    label: 'Fonts',
    value: 'Font' as const,
    featured: [
      {
        name: 'Classics and modern Fonts',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/fonts/new.jpg',
      },
    ],
  },
  {
    label: 'Image',
    value: 'Image' as const,
    featured: [
      {
        name: 'Classics and modern Fonts',
        href: '#',
        ImageSrc: process.env.NEXT_PUBLIC_SERVER_URL + '/nav/fonts/new.jpg',
      },
    ],
  },
];

export const FEEINPROCENT = 5 / 100;
