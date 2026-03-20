import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Historia',
      href: getPermalink('/about'),
    },
    {
      text: 'Servicios',
      links: [
        {
          text: 'Guardería',
          href: getPermalink('/servicios#guarderia'),
        },
        {
          text: 'Hotel',
          href: getPermalink('/servicios#hotel'),
        },
        {
          text: 'Membresías',
          href: getPermalink('/servicios#membresias'),
        },
      ],
    },
    {
      text: 'Instalaciones',
      href: getPermalink('/instalaciones'),
    },
    {
      text: 'Contacto',
      href: getPermalink('/contact'),
    },
    {
      text: 'Tienda',
      href: getPermalink('/tienda'),
    },
  ],
  actions: [{ text: 'Reservar', href: '#reservar', target: '_self' }],
};

export const footerData = {
  links: [
    {
      title: 'Servicios',
      links: [
        { text: 'Guardería', href: '/servicios' },
        { text: 'Hotel Canino', href: '/servicios' },
        { text: 'Membresías', href: '/servicios' },
      ],
    },
    {
      title: 'Compañía',
      links: [
        { text: 'Historia', href: '/about' },
        { text: 'Instalaciones', href: '/instalaciones' },
        { text: 'Contacto', href: '/contact' },
      ],
    },
    {
      title: 'Legales',
      links: [
        { text: 'Términos y Condiciones', href: '/terms' },
        { text: 'Aviso de Privacidad', href: '/privacy' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Términos', href: getPermalink('/terms') },
    { text: 'Privacidad', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'WhatsApp', icon: 'tabler:brand-whatsapp', href: '#' },
  ],
  footNote: `
    Hecho con ❤️ para lomitos felices · Todos los derechos reservados.
  `,
};
