import {defineConfig} from "sanity"
import {structureTool} from "sanity/structure"
import {visionTool} from "@sanity/vision"
import {schemaTypes} from "./schemaTypes"
// adding tools to modify the structure of the the structure view on localhost

export default defineConfig({
  name: "default",
  title: "Day One Content Operations",

  projectId: "mvhekjq6",
  dataset: "production",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
