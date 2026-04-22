import { describe, it, expect, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
} from "@/test/test-utils";
import { PlayerProfilePage } from "./PlayerProfilePage";

function renderProfile(id = "1") {
  return renderWithProviders(<PlayerProfilePage />, {
    routerProps: { initialEntries: [`/player/${id}`] },
  });
}

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
  };
});

describe("PlayerProfilePage", () => {
  it("все 8 вкладок рендерятся", async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Профиль")).toBeInTheDocument();
    });
    expect(screen.getByText("Антропометрия")).toBeInTheDocument();
    expect(screen.getByText("Тесты")).toBeInTheDocument();
    expect(screen.getByText("Статистика")).toBeInTheDocument();
    expect(screen.getByText("Травмы")).toBeInTheDocument();
    expect(screen.getByText("Оценки")).toBeInTheDocument();
    expect(screen.getByText("Видеотека")).toBeInTheDocument();
    expect(screen.getByText("Отзывы")).toBeInTheDocument();
  });

  it("вкладка Профиль показывает имя", async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Алексей Морозов")).toBeInTheDocument();
    });
  });

  it("переключение на вкладку Антропометрия", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Антропометрия")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Антропометрия"));

    await waitFor(() => {
      const tabContent = screen.getByRole("tabpanel");
      expect(tabContent).toBeInTheDocument();
    });
  });

  it("переключение на вкладку Тесты показывает кнопки категорий", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Тесты")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Тесты"));

    await waitFor(() => {
      expect(screen.getByText("Общая подготовка")).toBeInTheDocument();
    });
  });

  it("переключение на вкладку Травмы показывает данные", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Травмы")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Травмы"));

    await waitFor(() => {
      expect(
        screen.getByText("Растяжение связок колена")
      ).toBeInTheDocument();
    });
  });

  it("переключение на вкладку Видеотека", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Видеотека")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Видеотека"));

    await waitFor(() => {
      expect(screen.getByText("Все")).toBeInTheDocument();
    });
  });
});
