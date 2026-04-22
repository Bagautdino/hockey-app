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

  it("показывает ключевые метрики дашборда", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Общий рейтинг")).toBeInTheDocument();
    });
    expect(screen.getByText("Сыграно матчей")).toBeInTheDocument();
    expect(screen.getByText("Активные травмы")).toBeInTheDocument();
    expect(screen.getByText("Дней с последнего теста")).toBeInTheDocument();
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

  it("лента активности отображается", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Недавняя активность")).toBeInTheDocument();
    });
  });

  it("кнопка «Обновить показатели» доступна", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByLabelText("Обновить показатели")
      ).toBeInTheDocument();
    });
  });
});
