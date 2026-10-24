import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../test-utils/axe";
import { Rating } from "./Rating";

describe("Rating", () => {
  it("states the rating in words for screen readers", async () => {
    const { container } = render(<Rating value={4.3} count={1284} />);
    expect(screen.getByRole("img", { name: "Rated 4.3 out of 5 from 1,284 ratings" })).toBeInTheDocument();
    expect(screen.getByText("4.3")).toBeInTheDocument();
    expect(screen.getByText("(1,284)")).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("says when there are no ratings yet", () => {
    render(<Rating value={0} count={0} />);
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
  });
});
