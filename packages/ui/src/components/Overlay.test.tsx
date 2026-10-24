import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../test-utils/axe";
import { Dialog, Sheet } from "./Overlay";

describe.each([
  ["Dialog", Dialog],
  ["Sheet", Sheet],
] as const)("%s", (_, Overlay) => {
  it("opens as a modal named by its title", async () => {
    const { container } = render(
      <Overlay open onClose={() => undefined} title="Choose a variant">
        <p>Body</p>
      </Overlay>
    );
    const dialog = screen.getByRole("dialog", { name: "Choose a variant" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveTextContent("Body");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("renders nothing inside while closed", () => {
    render(
      <Overlay open={false} onClose={() => undefined} title="Choose a variant">
        <p>Body</p>
      </Overlay>
    );
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("closes from its close button", async () => {
    const onClose = vi.fn();
    render(
      <Overlay open onClose={onClose} title="Choose a variant">
        <p>Body</p>
      </Overlay>
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("lets Esc (the dialog's cancel event) close it through onClose", () => {
    const onClose = vi.fn();
    render(
      <Overlay open onClose={onClose} title="Choose a variant">
        <p>Body</p>
      </Overlay>
    );
    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(screen.getByRole("dialog"), cancel);
    expect(onClose).toHaveBeenCalledOnce();
    // React state stays the source of truth: the browser must not close it by itself.
    expect(cancel.defaultPrevented).toBe(true);
  });
});
