import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PercentileBadge } from "./PercentileBadge";

const norm = { p25: 140, p75: 156 };

describe("PercentileBadge", () => {
  it("показывает зеленый бейдж если value > p75", () => {
    render(<PercentileBadge value={160} ageNorm={norm} />);
    const badge = screen.getByTestId("percentile-badge");
    expect(badge).toHaveTextContent("Выше нормы");
    expect(badge).toHaveClass("bg-green-100");
  });

  it("показывает желтый бейдж если value между p25 и p75", () => {
    render(<PercentileBadge value={148} ageNorm={norm} />);
    const badge = screen.getByTestId("percentile-badge");
    expect(badge).toHaveTextContent("Норма");
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("показывает красный бейдж если value < p25", () => {
    render(<PercentileBadge value={135} ageNorm={norm} />);
    const badge = screen.getByTestId("percentile-badge");
    expect(badge).toHaveTextContent("Ниже нормы");
    expect(badge).toHaveClass("bg-red-100");
  });

  it("показывает желтый при value = p25 (граница)", () => {
    render(<PercentileBadge value={140} ageNorm={norm} />);
    const badge = screen.getByTestId("percentile-badge");
    expect(badge).toHaveTextContent("Норма");
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("показывает желтый при value = p75 (граница)", () => {
    render(<PercentileBadge value={156} ageNorm={norm} />);
    const badge = screen.getByTestId("percentile-badge");
    expect(badge).toHaveTextContent("Норма");
    expect(badge).toHaveClass("bg-yellow-100");
  });
});
