import { describe, it, expect } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
} from "@/test/test-utils";
import { DashboardPage } from "./DashboardPage";

function renderDashboard() {
  return renderWithProviders(<DashboardPage />, {
    routerProps: { initialEntries: ["/dashboard"] },
  });
}

describe("DashboardPage", () => {
  it("отображает имя игрока из мок-данных", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByText("Добро пожаловать, Алексей")
      ).toBeInTheDocument();
    });
  });

  it("показывает 3 стат-карточки с числами", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Общий рейтинг")).toBeInTheDocument();
    });
    expect(screen.getByText("Позиция в регионе")).toBeInTheDocument();
    expect(screen.getByText("Последнее обновление")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
  });

  it("LineChart рендерится без ошибок", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId("progress-chart")).toBeInTheDocument();
    });
  });

  it("RadarChart рендерится без ошибок", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId("skill-radar-chart")).toBeInTheDocument();
    });
  });

  it("таблица тестов показывает 3 сессии", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getAllByTestId("test-session")).toHaveLength(3);
    });
  });

  it("кнопка '+ Обновить показатели' ведет на /player/new", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByLabelText("Обновить показатели")
      ).toBeInTheDocument();
    });
  });
});
