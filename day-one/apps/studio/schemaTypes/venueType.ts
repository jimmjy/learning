import {PinIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"

export const venueType = defineType({
  name: "venue",
  title: "Venue",
  type: "document",
  icon: PinIcon,
  fields: [
    defineField({
      name: "venue",
      type: "string",
    }),
    defineField({
      name: "city",
      type: "string",
    }),
    defineField({
      name: "country",
      type: "string",
    }),
  ],
})
