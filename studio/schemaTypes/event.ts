import {defineField, defineType} from 'sanity'

const VENUE_OPTIONS = [
  {title: 'Fléda', value: 'fleda'},
  {title: 'Fraktal', value: 'fraktal'},
  {title: 'Spektrum bar', value: 'bar'},
  {title: 'Spektrum galerie', value: 'galerie'},
]

export default defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  initialValue: {
    confirmed: false,
    source: 'manual',
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      options: {
        list: VENUE_OPTIONS,
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'confirmed',
      title: 'Confirmed (show in website calendar)',
      type: 'boolean',
      initialValue: false,
      description:
        'If enabled, this event is included in the website program calendar query.',
    }),
    defineField({
      name: 'startDateTime',
      title: 'Start (datetime)',
      type: 'datetime',
      description: 'Raw event start from Google Calendar (if available).',
    }),
    defineField({
      name: 'endDateTime',
      title: 'End (datetime)',
      type: 'datetime',
      description: 'Raw event end from Google Calendar (if available).',
    }),
    defineField({
      name: 'programDate',
      title: 'Program date',
      type: 'date',
      validation: (rule) => rule.required(),
      description: 'Date used by the website calendar list.',
    }),
    defineField({
      name: 'programTime',
      title: 'Program time',
      type: 'string',
      description: 'Time shown on the website (HH:mm). Keep empty for all-day events.',
    }),
    defineField({
      name: 'description',
      title: 'Popis akce',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Rich text description shown on the event detail page.',
    }),
    defineField({
      name: 'venueNeedsReview',
      title: 'Venue needs review',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
      description:
        'Set by sync when venue could not be confidently mapped from Google Calendar text.',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Google Calendar', value: 'google'},
          {title: 'Manual', value: 'manual'},
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      readOnly: true,
    }),
    defineField({
      name: 'googleEventId',
      title: 'Google event ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'googleCalendarId',
      title: 'Google calendar ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'googleHtmlLink',
      title: 'Google event URL',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'facebookEventLink',
      title: 'Facebook event URL',
      type: 'url',
      description: 'Optional public Facebook event link shown on the website event detail.',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'gooutIframeUrl',
      title: 'goout iframe URL',
      type: 'url',
      description: 'Embed URL used for goout iframe placeholder.',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'smsticketIframeUrl',
      title: 'smsticket iframe URL',
      type: 'url',
      description: 'Embed URL used for smsticket iframe placeholder.',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'youtubeEmbedUrl',
      title: 'YouTube embed URL',
      type: 'url',
      description: 'Optional YouTube embed URL for event detail.',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'spotifyEmbedUrl',
      title: 'Spotify embed URL',
      type: 'url',
      description: 'Optional Spotify embed URL for event detail.',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'googleStatus',
      title: 'Google status',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'lastSyncedAt',
      title: 'Last synced at',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      venue: 'venue',
      date: 'programDate',
      time: 'programTime',
      confirmed: 'confirmed',
    },
    prepare(selection) {
      const venueLabels: Record<string, string> = {
        fleda: 'Fléda',
        fraktal: 'Fraktal',
        bar: 'Spektrum bar',
        galerie: 'Spektrum galerie',
      }

      const venue = selection.venue ? venueLabels[selection.venue] || selection.venue : 'Unknown venue'
      const date = selection.date || 'No date'
      const time = selection.time || 'all-day'
      const confirmed = selection.confirmed ? 'confirmed' : 'not confirmed'

      return {
        title: selection.title || 'Untitled event',
        subtitle: `${date} ${time} - ${venue} - ${confirmed}`,
      }
    },
  },
})
