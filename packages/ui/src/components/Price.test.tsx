import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../test-utils/axe";
import { Price } from "./Price";

describe("Price (amounts in paise)", () => {
  it("shows the price on its own when there is no MRP", () => {
    render(<Price price={18500} />);
    expect(screen.getByText("₹185")).toBeInTheDocument();
    expect(screen.queryByText(/off/)).not.toBeInTheDocument();
  });

  it("strikes through the MRP, names it for screen readers, and shows the saving", () => {
    render(<Price price={18500} mrp={19900} />);
    const mrp = screen.getByText("₹199").closest("del");
    expect(mrp).toBeInTheDocument();
    expect(mrp).toHaveTextContent("MRP ₹199");
    expect(screen.getByText("7% off")).toBeInTheDocument();
  });

  it("hides the MRP when it equals the price", () => {
    render(<Price price={18500} mrp={18500} />);
    expect(screen.queryByText(/MRP/)).not.toBeInTheDocument();
  });

  it("offers the Prime price to non-members", () => {
    render(<Price price={18500} mrp={19900} primePrice={17200} />);
    expect(screen.getByText("₹185")).toBeInTheDocument();
    expect(screen.getByText(/₹172 with Prime/)).toBeInTheDocument();
  });

  it("charges members the Prime price and says so", () => {
    render(<Price price={18500} mrp={19900} primePrice={17200} member />);
    expect(screen.getByText("₹172")).toBeInTheDocument();
    expect(screen.getByText("Prime price")).toBeInTheDocument();
    expect(screen.queryByText(/with Prime/)).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Price price={18500} mrp={19900} primePrice={17200} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
