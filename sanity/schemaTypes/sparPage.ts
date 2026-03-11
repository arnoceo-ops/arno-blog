import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'sparPage',
  title: 'SPAR Pagina',
  type: 'document',
  fields: [
    defineField({
      name: 'taglineTitle',
      title: 'Header titel (bv. 19 jaar blogs. 369.000 woorden.)',
      type: 'string',
    }),
    defineField({
      name: 'taglineSub',
      title: 'Header subtekst',
      type: 'text',
    }),
    defineField({
      name: 'openers',
      title: '12 Openingsvragen',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.max(12),
    }),
  ],
  preview: { select: { title: 'taglineTitle' } },
})
