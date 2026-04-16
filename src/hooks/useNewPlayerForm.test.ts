import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createWrapper } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/players", () => ({
  createPlayer: vi.fn(),
}));

const mockNavigate = vi.fn();

import { useNewPlayerForm, type Step1Values, type Step2Values, type Step3Values } from "./useNewPlayerForm";
import { createPlayer } from "@/api/players";

const mockedCreatePlayer = vi.mocked(createPlayer);

const validStep1: Step1Values = {
  firstName: "Алексей",
  lastName: "Морозов",
  middleName: "Игоревич",
  birthDate: "2012-03-15",
  position: "forward",
  shootingHand: "left",
  region: "Москва",
  city: "Москва",
  team: "ЦСКА",
  jerseyNumber: 17,
};

const validStep2: Step2Values = {
  height: 152,
  weight: 44,
  armSpan: 148,
  legLength: 70,
  torsoLength: 50,
  sittingHeight: 75,
  shoulderWidth: 35,
  shoeSize: 37,
};

const validStep3: Step3Values = {
  sprint20mFwd: 3.8,
  sprint20mBwd: 5.1,
  standingJump: 165,
  agility: 9.2,
  flexibility: 8,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useNewPlayerForm", () => {
  it("starts at step 1 with empty formData", () => {
    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });
    expect(result.current.step).toBe(1);
    expect(result.current.totalSteps).toBe(4);
    expect(result.current.formData).toEqual({});
  });

  it("saveStep1 stores data and moves to step 2", () => {
    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));

    expect(result.current.step).toBe(2);
    expect(result.current.formData.step1).toEqual(validStep1);
  });

  it("saveStep2 stores data and moves to step 3", () => {
    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));
    act(() => result.current.saveStep2(validStep2));

    expect(result.current.step).toBe(3);
    expect(result.current.formData.step2).toEqual(validStep2);
  });

  it("skipStep2 clears step2 data and moves to step 3", () => {
    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));
    act(() => result.current.skipStep2());

    expect(result.current.step).toBe(3);
    expect(result.current.formData.step2).toBeUndefined();
  });

  it("skipStep3 clears step3 data and moves to step 4", () => {
    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));
    act(() => result.current.skipStep2());
    act(() => result.current.skipStep3());

    expect(result.current.step).toBe(4);
    expect(result.current.formData.step3).toBeUndefined();
  });

  it("goBack decrements step", () => {
    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));
    expect(result.current.step).toBe(2);

    act(() => result.current.goBack());
    expect(result.current.step).toBe(1);
  });

  it("goBack does nothing at step 1", () => {
    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.goBack());
    expect(result.current.step).toBe(1);
  });

  it("submitForm sends correct body without anthropometrics when skipped", async () => {
    mockedCreatePlayer.mockResolvedValueOnce({ id: "new-player-id" } as ReturnType<typeof createPlayer> extends Promise<infer T> ? T : never);

    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));
    act(() => result.current.skipStep2());
    act(() => result.current.saveStep3(validStep3));

    await act(async () => {
      await result.current.submitForm();
    });

    expect(mockedCreatePlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "Алексей",
        last_name: "Морозов",
        birth_date: "2012-03-15",
        position: "forward",
        shooting_hand: "left",
      })
    );
    const callArgs = mockedCreatePlayer.mock.calls[0][0];
    expect(callArgs.anthropometrics).toBeUndefined();
    expect(mockNavigate).toHaveBeenCalledWith("/player/new-player-id");
  });

  it("submitForm includes anthropometrics when provided", async () => {
    mockedCreatePlayer.mockResolvedValueOnce({ id: "p2" } as ReturnType<typeof createPlayer> extends Promise<infer T> ? T : never);

    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));
    act(() => result.current.saveStep2(validStep2));
    act(() => result.current.saveStep3(validStep3));

    await act(async () => {
      await result.current.submitForm();
    });

    const callArgs = mockedCreatePlayer.mock.calls[0][0];
    expect(callArgs.anthropometrics).toMatchObject({
      height: 152,
      weight: 44,
      arm_span: 148,
    });
  });

  it("submitForm sets error on API failure", async () => {
    mockedCreatePlayer.mockRejectedValueOnce({
      response: { data: { detail: "Duplicate player" } },
    });

    const { result } = renderHook(() => useNewPlayerForm(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.saveStep1(validStep1));
    act(() => result.current.skipStep2());
    act(() => result.current.skipStep3());

    await act(async () => {
      try {
        await result.current.submitForm();
      } catch {
        // expected
      }
    });

    expect(result.current.submitError).toBe("Duplicate player");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
