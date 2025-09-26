import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'cate-gennaro-studio',

  projectId: 'wwvjgdhy',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
