import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import type { ReactElement } from "react";

interface WrapperOptions {
  routerProps?: MemoryRouterProps;
}

export function createWrapper({ routerProps }: WrapperOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & WrapperOptions
) {
  const { routerProps, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper({ routerProps }),
    ...renderOptions,
  });
}

export { screen, waitFor, within } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
