import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'canvasPage',
  title: 'CANVAS Pagina',
  type: 'document',
  fields: [
    defineField({
      name: 'comingTitle',
      title: 'Coming soon titel',
      type: 'string',
    }),
    defineField({
      name: 'comingBody',
      title: 'Coming soon tekst',
      type: 'text',
    }),
  ],
  preview: { select: { title: 'comingTitle' } },
})
