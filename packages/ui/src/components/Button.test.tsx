import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../test-utils/axe";
import { Button, buttonClasses, IconButton } from "./Button";

describe("Button", () => {
  it("is a real button that never submits a form by accident", () => {
    render(<Button>Add to cart</Button>);
    expect(screen.getByRole("button", { name: "Add to cart" })).toHaveAttribute("type", "button");
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("while busy, keeps its name, says it is busy and can't be pressed twice", async () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Pay ₹499
      </Button>
    );
    const button = screen.getByRole("button", { name: /Pay ₹499/ });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("primary and gold variants get the 3D key shelf", () => {
    expect(buttonClasses({ variant: "primary" })).toContain("shadow-key");
    expect(buttonClasses({ variant: "gold" })).toContain("shadow-key-gold");
  });

  it("buttonClasses styles a link the same way", () => {
    render(
      <a href="/cart" className={buttonClasses({ variant: "secondary", block: true })}>
        Go to cart
      </a>
    );
    expect(screen.getByRole("link", { name: "Go to cart" }).className).toContain("w-full");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button variant="gold">Join Prime</Button>);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("IconButton", () => {
  it("is named by its label, since it shows only an icon", async () => {
    const { container } = render(<IconButton label="Open cart" icon={<svg aria-hidden="true" />} />);
    expect(screen.getByRole("button", { name: "Open cart" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
