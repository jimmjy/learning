import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "mvhekjq6",
  dataset: "production",
  apiVersion: "2025-07-09",
  useCdn: false,
});
