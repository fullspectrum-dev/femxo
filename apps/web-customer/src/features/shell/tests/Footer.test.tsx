import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "../components/Footer";

describe("Footer", () => {
  it("labels the store as demo data while it runs on the mock API", () => {
    render(<Footer mode="mock" />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Demo data");
  });

  it("drops the label once connected to the real API", () => {
    render(<Footer mode="http" />);
    expect(screen.getByRole("contentinfo")).not.toHaveTextContent("Demo data");
  });
});
