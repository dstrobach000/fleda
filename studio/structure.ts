import type {StructureResolver} from 'sanity/desk'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('Upcoming')
        .id('upcoming')
        .child(S.document().schemaType('upcoming').documentId('upcoming')),
      S.divider(),
      S.documentTypeListItem('event').title('Events'),
      S.documentTypeListItem('page').title('Pages'),
    ])
