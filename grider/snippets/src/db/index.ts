import { PrismaClient } from "@/generated/prisma";

export const db = new PrismaClient();

db.snippet.create({
  data: {
    title: "Title!",
    code: "const abc = () => {}",
  },
});
