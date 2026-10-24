import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemoBadge } from "./DemoBadge";

describe("DemoBadge", () => {
  it("says the figures are demo data, in text (not colour alone)", () => {
    render(<DemoBadge />);
    expect(screen.getByText("Demo data")).toBeInTheDocument();
  });

  it("explains itself to screen readers and on hover", () => {
    render(<DemoBadge />);
    expect(screen.getByText("Demo data").closest("[title]")).toHaveAttribute(
      "title",
      expect.stringMatching(/sample/i)
    );
  });
});
