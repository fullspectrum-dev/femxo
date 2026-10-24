import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../test-utils/axe";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

describe("Card", () => {
  it("renders its content in the element asked for", () => {
    render(
      <Card as="article" aria-label="Edible oil 1 L">
        Content
      </Card>
    );
    expect(screen.getByRole("article", { name: "Edible oil 1 L" })).toHaveTextContent("Content");
  });
});

describe("Badge", () => {
  it("always carries text, never colour alone", async () => {
    const { container } = render(<Badge tone="success">In stock</Badge>);
    expect(screen.getByText("In stock")).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Skeleton", () => {
  it("is hidden from screen readers (the loading region announces itself)", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
