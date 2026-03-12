import studio from '@sanity/eslint-config-studio'

export default [
  ...studio,
  {
    files: ['list-assets.js', 'query-assets.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/**', '.sanity/**'],
  },
]
