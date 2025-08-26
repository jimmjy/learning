import {UsersIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"

export const artistType = defineType({
  name: "artist",
  title: "Artist",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "photo",
      type: "image",
    }),
  ],
})
