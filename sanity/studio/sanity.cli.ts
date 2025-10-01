import {defineCliConfig} from "sanity/cli"

export default defineCliConfig({
  api: {
    projectId: "wwvjgdhy",
    dataset: "production",
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
    appId: "jec51qacae22a0zaomh5wu91",
  },
})
