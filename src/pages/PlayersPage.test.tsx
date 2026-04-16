import { describe, it, expect, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
} from "@/test/test-utils";
import { PlayersPage } from "./PlayersPage";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderPage() {
  return renderWithProviders(<PlayersPage />);
}

describe("PlayersPage", () => {
  it("renders the title and player count", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Игроки")).toBeInTheDocument();
    });
    expect(screen.getByText(/из \d+ игроков/)).toBeInTheDocument();
  });

  it("renders player cards from mock data", async () => {
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByLabelText("Открыть профиль Алексей Морозов")
      ).toBeInTheDocument();
    });
  });

  it("filters by search input", async () => {
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText("Поиск игрока по имени")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Поиск игрока по имени"), "Морозов");

    await waitFor(() => {
      expect(
        screen.getByLabelText("Открыть профиль Алексей Морозов")
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByLabelText("Открыть профиль Даниил Козлов")
    ).not.toBeInTheDocument();
  });

  it("shows empty state when no players match filters", async () => {
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText("Поиск игрока по имени")).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText("Поиск игрока по имени"),
      "XXXXXXXXXNOTEXIST"
    );

    await waitFor(() => {
      expect(screen.getByText("Игроки не найдены")).toBeInTheDocument();
    });
  });

  it("renders filter selects for region, position and age", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText("Фильтр по региону")).toBeInTheDocument();
      expect(screen.getByLabelText("Фильтр по позиции")).toBeInTheDocument();
      expect(screen.getByLabelText("Фильтр по возрасту")).toBeInTheDocument();
    });
  });

  it("has 'Добавить игрока' button with correct aria-label", async () => {
    renderPage();
    await waitFor(() => {
      const buttons = screen.getAllByLabelText("Добавить нового игрока");
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
