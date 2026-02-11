import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'

import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Fleda Studio',
  projectId: 'rw346rj2',
  dataset: 'production',
  basePath: '/',
  schema: {
    types: schemaTypes,
  },
  plugins: [deskTool({structure}), visionTool()],
})
