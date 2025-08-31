import { describe, expect, it } from "vitest";
import { Cat } from "./publicPrivate.js";

describe("testing tests", () => {
  it("testing", () => {
    const cat = new Cat("James");
    console.log("CATT:", cat);
    expect(cat.name).toEqual("James");
  });
});
