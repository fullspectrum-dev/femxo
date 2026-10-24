import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@femxo/ui/testing/dialog-polyfill";

afterEach(cleanup);
