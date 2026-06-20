import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

interface Options extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  wrapper?: (children: ReactNode) => ReactElement;
}

/**
 * Lightweight render helper used by sticky-header + quiz-deeplink tests.
 * Wraps in MemoryRouter at the requested route; optional extra wrapper for
 * providers (e.g. CartProvider).
 */
export function renderWithRouter(ui: ReactElement, { route = "/", wrapper, ...rest }: Options = {}) {
  const inner = wrapper ? wrapper(ui) : ui;
  return render(<MemoryRouter initialEntries={[route]}>{inner}</MemoryRouter>, rest);
}
