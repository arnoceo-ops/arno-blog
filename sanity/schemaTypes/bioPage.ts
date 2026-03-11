import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'bioPage',
  title: 'BIO Pagina',
  type: 'document',
  fields: [
    defineField({
      name: 'taglineTitle',
      title: 'Tagline titel (bv. Rainmaker. Mentor. Schrijver.)',
      type: 'string',
    }),
    defineField({
      name: 'taglineSub',
      title: 'Tagline subtekst (bv. Winstgeving is mijn zingeving.)',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Bodytekst',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: { select: { title: 'taglineTitle' } },
})
