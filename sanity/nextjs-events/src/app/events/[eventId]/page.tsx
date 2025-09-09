import { sanityFetch } from "@/sanity/live";
import { defineQuery } from "next-sanity";

type EventIdProps = {
  params: Promise<{ eventId: string }>;
};

const EVENT_QUERY = defineQuery(
  `*[_type == 'event' && defined(slug.current) && slug.current == $slug]{name, venue->{name, city}, headline->{name, description, photo}}`,
);

export default async function Events({ params }: EventIdProps) {
  const eventId = (await params).eventId;

  const { data: event } = await sanityFetch({
    query: EVENT_QUERY,
    params: { slug: eventId },
  });
  console.log(eventId, event);
  return (
    <div className="bg-white h-screen w-screen flex flex-col text-black items-center py-20">
      <h1 className="underline">Event Details</h1>
      <p>{event[0].name}</p>
      <div className="flex mx-5 my-10 border-1 border-green-500 p-5">
        <div className="flex flex-col gap-3">
          <div>
            <p>Artist: {event[0].headline.name}</p>
          </div>

          <p>Description: {event[0].headline.description}</p>
        </div>
        <div></div>
        {/* <h1></h1> */}
        {/* <h2>name: {event[0].venue.name}</h2> */}
        {/* <h2>city: {event[0].venue.city}</h2> */}
      </div>
    </div>
  );
}
