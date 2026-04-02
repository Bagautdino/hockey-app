import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressChart } from "./ProgressChart";

const mockData = [
  { month: "Февраль", rating: 72 },
  { month: "Март", rating: 75 },
  { month: "Апрель", rating: 79 },
  { month: "Май", rating: 82 },
  { month: "Июнь", rating: 85 },
  { month: "Июль", rating: 87 },
];

describe("ProgressChart", () => {
  it("рендерится с моковыми данными без ошибок", () => {
    render(<ProgressChart data={mockData} />);
    expect(screen.getByTestId("progress-chart")).toBeInTheDocument();
  });

  it("рендерится с пустым массивом без ошибок", () => {
    render(<ProgressChart data={[]} />);
    expect(screen.getByTestId("progress-chart")).toBeInTheDocument();
  });
});
