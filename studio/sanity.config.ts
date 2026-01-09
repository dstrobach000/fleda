// sanity.config.ts
import {defineConfig} from 'sanity';
import {deskTool} from 'sanity/desk';
import {visionTool} from '@sanity/vision';

// Your schema index should export `schemaTypes` (array of types)
import {schemaTypes} from './schemaTypes';

// Custom Desk structure (adds defaultOrdering for "Výstavy")
import {structure} from './structure';

export default defineConfig({
  name: 'default',
  title: 'Fleda',

  // ⬇️ keep the same values you already had here
  projectId: 'rw346rj2',
  dataset: 'production',

  // For managed Studio at spektrumgalerie.sanity.studio this is fine:
  basePath: '/',

  schema: {
    types: schemaTypes,
  },

  plugins: [
    deskTool({ structure }),
    visionTool(), // optional; remove if you don't want Vision
  ],

  // Configure file uploads to accept video files and PDFs
  file: {
    accept: 'video/*,.mov,.mp4,.webm,.ogg,.avi,.mkv,.pdf',
  },

  // Disable document creation for single-document types
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      const restrictedTypes = ['contact', 'upcomingExhibition', 'press'];
      const { type, schemaType } = creationContext;

      // Hide the create button in the structure pane for restricted types
      if (type === 'structure' && restrictedTypes.includes(schemaType)) {
        return [];
      }

      // Remove restricted types from the global create menu
      if (type === 'global') {
        return prev.filter((template) => !restrictedTypes.includes(template.templateId));
      }

      return prev;
    },
  },
});
