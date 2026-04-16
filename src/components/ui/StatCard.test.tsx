import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("рендерит заголовок и значение", () => {
    render(<StatCard title="Общий рейтинг" value={87} />);
    expect(screen.getByText("Общий рейтинг")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
  });

  it("рендерит единицу измерения", () => {
    render(<StatCard title="Рейтинг" value={87} unit="баллов" />);
    expect(screen.getByText("баллов")).toBeInTheDocument();
  });

  it("показывает зеленую стрелку при положительном delta", () => {
    render(<StatCard title="Рейтинг" value={87} delta={5} deltaLabel="за месяц" />);
    const deltaEl = screen.getByTestId("stat-delta");
    expect(deltaEl).toHaveClass("text-emerald-400");
    expect(screen.getByLabelText("рост")).toBeInTheDocument();
    expect(screen.getByText("+5 за месяц")).toBeInTheDocument();
  });

  it("показывает красную стрелку при отрицательном delta", () => {
    render(<StatCard title="Рейтинг" value={80} delta={-3} />);
    const deltaEl = screen.getByTestId("stat-delta");
    expect(deltaEl).toHaveClass("text-red-400");
    expect(screen.getByLabelText("снижение")).toBeInTheDocument();
  });

  it("не показывает delta если не передан", () => {
    render(<StatCard title="Рейтинг" value={87} />);
    expect(screen.queryByTestId("stat-delta")).not.toBeInTheDocument();
  });
});
