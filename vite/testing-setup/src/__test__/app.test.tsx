import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import App from "../App.tsx";

describe("testing", () => {
  it("renders", () => {
    render(<App />);

    screen.debug();
  });
});
