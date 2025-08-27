import {CalendarIcon} from "@sanity/icons"
import {defineField, defineType} from "sanity"
import {DoorsOpenInput} from "./components/DoorsOpenInput"

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  groups: [
    // can use sets for side-by-side, look at docs not in tutorial
    // We have to have groups assigned to fields for this to work
    {name: "details", title: "Details"},
    {name: "editorial", title: "Editorial"},
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "details",
      options: {
        source: "name",
      },
      validation: (rule) => rule.required().error(`Required to generate a page on the website`), // this could also be a rule.warning or .info
      hidden: ({document}) => !document?.name,
      readOnly: ({value, currentUser}) => {
        // Anyone can set the initial slug
        if (!value) {
          return false
        }

        const isAdmin = currentUser?.roles.some((role) => role.name === "administrator")

        // Only admins can change the slug
        return !isAdmin
      },
    }),
    defineField({
      name: "eventType",
      type: "string",
      group: "details",
      options: {
        list: ["in-person", "virtual"],
        layout: "radio",
      },
    }),
    defineField({
      name: "date",
      type: "datetime",
      group: "details",
    }),
    defineField({
      name: "doorsOpen",
      description: "Number of minutes before the start time for admission",
      type: "number",
      initialValue: 60,
      group: "details",
      components: {
        input: DoorsOpenInput,
      },
    }),
    defineField({
      name: "venue",
      type: "reference",
      group: "editorial",
      to: [{type: "venue"}],
      readOnly: ({value, document}) => !value && document?.eventType === "virtual",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (value && context?.document?.eventType === "virtual") {
            return "Only in-person events can have a venue"
          }

          return true
        }),
    }),
    defineField({
      name: "headline",
      type: "reference",
      group: "editorial",
      to: [{type: "artist"}],
    }),
    defineField({
      name: "image",
      type: "image",
      group: "editorial",
    }),
    defineField({
      name: "details",
      type: "array",
      group: "editorial",
      of: [{type: "block"}],
    }),
    defineField({
      name: "tickets",
      description: "A URL where tickets can be purchased", // You can use the below but will have to change the filetype to .jsx/.tsx
      // description: (
      // <details>
      //   <summary>Why is this important?</summary>
      //   The Googlebot is an indexer of...
      // </details>
      // ),
      group: "editorial",
      type: "url",
    }),
  ],
  preview: {
    select: {
      name: "name",
      venue: "venue.name",
      artist: "headline.name",
      date: "date",
      image: "image",
    },
    prepare({name, venue, artist, date, image}) {
      const nameFormatted = name || "Untitled event"
      const dateFormatted = date
        ? new Date(date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
        : ""

      return {
        title: artist ? `${nameFormatted} (${artist})` : nameFormatted,
        subtitle: venue ? `${dateFormatted} @ ${venue}` : dateFormatted,
        media: image || CalendarIcon,
      }
    },
  },
})
