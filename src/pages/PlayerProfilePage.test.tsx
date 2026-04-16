import { describe, it, expect } from "vitest";
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
  it("все 4 вкладки рендерятся", async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Профиль")).toBeInTheDocument();
    });
    expect(screen.getByText("Антропометрия")).toBeInTheDocument();
    expect(screen.getByText("Физтесты")).toBeInTheDocument();
    expect(screen.getByText("Видео")).toBeInTheDocument();
  });

  it("вкладка Профиль показывает имя и bio поля", async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Алексей Морозов")).toBeInTheDocument();
    });
    expect(screen.getByText("Нападающий")).toBeInTheDocument();
    expect(screen.getByText("Левый")).toBeInTheDocument();
    expect(screen.getByText("ЦСКА Юниоры")).toBeInTheDocument();
    expect(screen.getByText("#17")).toBeInTheDocument();
  });

  it("переключение на вкладку Антропометрия показывает таблицу", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Антропометрия")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Антропометрия"));

    await waitFor(() => {
      expect(screen.getByTestId("anthro-table")).toBeInTheDocument();
    });
    expect(screen.getByText("152 см")).toBeInTheDocument();
    expect(screen.getByText("44 кг")).toBeInTheDocument();
  });

  it("percentile бейджи отображаются (green/yellow/red)", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Антропометрия")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Антропометрия"));

    await waitFor(() => {
      const badges = screen.getAllByTestId("percentile-badge");
      expect(badges.length).toBeGreaterThan(0);

      const texts = badges.map((b) => b.textContent);
      const hasAnyLabel = texts.some(
        (t) =>
          t === "Выше нормы" || t === "Норма" || t === "Ниже нормы"
      );
      expect(hasAnyLabel).toBe(true);
    });
  });

  it("переключение на вкладку Физтесты показывает группы тестов", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Физтесты")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Физтесты"));

    await waitFor(() => {
      const titles = screen.getAllByTestId("test-group-title");
      expect(titles.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("Скоростные качества")).toBeInTheDocument();
      expect(
        screen.getByText("Координация и гибкость")
      ).toBeInTheDocument();
    });
  });

  it("переключение на вкладку Видео показывает grid карточек", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Видео")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Видео"));

    await waitFor(() => {
      expect(screen.getByTestId("video-grid")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Тренировка — скоростной бег на льду")
    ).toBeInTheDocument();
  });

  it("клик на видео открывает Dialog с YouTube embed", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Видео")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Видео"));

    await waitFor(() => {
      expect(screen.getByTestId("video-grid")).toBeInTheDocument();
    });

    await user.click(
      screen.getByLabelText("Открыть видео Тренировка — скоростной бег на льду")
    );

    await waitFor(() => {
      expect(screen.getByTitle("Video player")).toBeInTheDocument();
    });
  });

  it("вкладка Видео показывает все 4 видео для игрока 1", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Видео")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Видео"));

    await waitFor(() => {
      expect(screen.getByTestId("video-grid")).toBeInTheDocument();
    });
    expect(screen.getByText("Бросок по воротам — кистевой")).toBeInTheDocument();
    expect(screen.getByText("Обводка защитника — финты")).toBeInTheDocument();
    expect(screen.getByText("Матч ЦСКА Юниоры — Спартак Юниоры")).toBeInTheDocument();
  });
});
