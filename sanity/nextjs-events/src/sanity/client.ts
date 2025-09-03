import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "8xllh6kc",
  dataset: "production",
  apiVersion: "2025-07-09",
  useCdn: false,
});
