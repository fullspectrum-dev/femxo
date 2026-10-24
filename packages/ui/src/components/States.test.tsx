import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../test-utils/axe";
import { EmptyState, ErrorState } from "./States";

describe("EmptyState", () => {
  it("has a heading, a message and an optional action", async () => {
    const { container } = render(<EmptyState title="Your cart is empty" message="Add something you like." action={<a href="/">Start shopping</a>} />);
    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start shopping" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("ErrorState", () => {
  it("is announced, and Try again calls onRetry", async () => {
    const onRetry = vi.fn();
    const { container } = render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(await axeViolations(container)).toEqual([]);
  });
});
