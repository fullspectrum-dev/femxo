import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";

function Trigger({ message, tone }: { message: string; tone?: "success" | "error" }) {
  const toast = useToast();
  return <button onClick={() => toast(message, { tone })}>Show</button>;
}

describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("announces success politely", async () => {
    render(
      <ToastProvider>
        <Trigger message="Added to cart" />
      </ToastProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByRole("status")).toHaveTextContent("Added to cart");
  });

  it("announces errors assertively", async () => {
    render(
      <ToastProvider>
        <Trigger message="Payment failed" tone="error" />
      </ToastProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Payment failed");
  });

  it("can be dismissed, and goes away by itself", async () => {
    render(
      <ToastProvider>
        <Trigger message="Added to cart" />
      </ToastProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "Show" }));
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Added to cart")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Show" }));
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.queryByText("Added to cart")).not.toBeInTheDocument();
  });

  it("throws a clear error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Trigger message="x" />)).toThrow(/ToastProvider/);
  });
});
