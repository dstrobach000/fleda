import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'upcoming',
  title: 'Upcoming',
  type: 'document',
  fields: [
    defineField({
      name: 'event',
      title: 'Header event',
      type: 'reference',
      to: [{type: 'event'}],
      options: {
        filter: 'defined(programDate) && confirmed == true',
      },
      description: 'Pick the confirmed calendar event shown in the website header upcoming bar.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'event.title',
      date: 'event.programDate',
    },
    prepare({title, date}: {title?: string; date?: string}) {
      return {
        title: 'Upcoming',
        subtitle: title ? `${title}${date ? ` (${date})` : ''}` : 'No event selected',
      }
    },
  },
})
