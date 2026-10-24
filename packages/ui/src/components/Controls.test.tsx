import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../test-utils/axe";
import { OfflineBanner } from "./OfflineBanner";
import { QuantityStepper } from "./QuantityStepper";
import { Stepper } from "./Stepper";
import { Tabs } from "./Tabs";

describe("Tabs", () => {
  function Example() {
    const [value, setValue] = useState("details");
    return (
      <Tabs
        label="Product information"
        value={value}
        onChange={setValue}
        items={[
          { key: "details", label: "Details", content: <p>Details body</p> },
          { key: "reviews", label: "Reviews", content: <p>Reviews body</p> },
          { key: "returns", label: "Returns", content: <p>Returns body</p> },
        ]}
      />
    );
  }

  it("shows the selected panel, labelled by its tab", async () => {
    const { container } = render(<Example />);
    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Details" })).toHaveTextContent("Details body");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("moves with arrow keys, Home and End (roving focus)", async () => {
    render(<Example />);
    screen.getByRole("tab", { name: "Details" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Reviews" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Reviews body");
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Returns" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Details" })).toHaveFocus();
    await userEvent.keyboard("{Home}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Returns" })).toHaveFocus();
  });
});

describe("Stepper", () => {
  it("marks the current step and says which are done", async () => {
    const { container } = render(<Stepper label="Checkout progress" steps={["Address", "Delivery", "Payment"]} current={1} />);
    const list = screen.getByRole("list", { name: "Checkout progress" });
    const items = screen.getAllByRole("listitem");
    expect(list).toBeInTheDocument();
    expect(items[0]).toHaveTextContent(/Address.*completed/);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[2]).not.toHaveAttribute("aria-current");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("QuantityStepper", () => {
  it("steps up and down within its limits", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<QuantityStepper value={1} max={5} onChange={onChange} itemName="Edible oil 1 L" />);
    expect(screen.getByRole("button", { name: "Decrease quantity of Edible oil 1 L" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity of Edible oil 1 L" }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(await axeViolations(container)).toEqual([]);

    rerender(<QuantityStepper value={5} max={5} onChange={onChange} itemName="Edible oil 1 L" />);
    expect(screen.getByRole("button", { name: "Increase quantity of Edible oil 1 L" })).toBeDisabled();
    expect(screen.getByText("Max 5 per order")).toBeInTheDocument();
  });

  it("announces the quantity and blocks presses while saving", () => {
    render(<QuantityStepper value={3} max={5} busy onChange={() => undefined} itemName="Edible oil 1 L" />);
    expect(screen.getByRole("status")).toHaveTextContent("3");
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });
});

describe("OfflineBanner", () => {
  function setOnline(online: boolean) {
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => online });
    act(() => {
      window.dispatchEvent(new Event(online ? "online" : "offline"));
    });
  }

  it("appears while offline and leaves when the connection returns", () => {
    setOnline(true);
    render(<OfflineBanner />);
    const region = screen.getByRole("status");
    expect(region).toBeEmptyDOMElement();
    setOnline(false);
    expect(region).toHaveTextContent(/offline/i);
    setOnline(true);
    expect(region).toBeEmptyDOMElement();
  });
});
