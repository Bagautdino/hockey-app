import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillRadarChart } from "./SkillRadarChart";

const mockSkills = {
  skating: 88,
  shooting: 85,
  passing: 82,
  physical: 79,
  vision: 86,
  defense: 70,
};

describe("SkillRadarChart", () => {
  it("рендерится с 6 осями без ошибок", () => {
    render(<SkillRadarChart skills={mockSkills} />);
    expect(screen.getByTestId("skill-radar-chart")).toBeInTheDocument();
  });

  it("рендерится с пустым объектом без ошибок", () => {
    render(<SkillRadarChart skills={{}} />);
    expect(screen.getByTestId("skill-radar-chart")).toBeInTheDocument();
  });
});
