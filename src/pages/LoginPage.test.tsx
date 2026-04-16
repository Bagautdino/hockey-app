import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
} from "@/test/test-utils";
import { LoginPage } from "./LoginPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    login: mockLogin,
    register: mockRegister,
    logout: vi.fn(),
    loadUser: vi.fn(),
  }),
  useCurrentUser: () => null,
  useIsAuthenticated: () => false,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage", () => {
  it("renders login form with role selection", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText("Хоккейный Родитель")).toBeInTheDocument();
    expect(screen.getByText("Вход")).toBeInTheDocument();
    expect(screen.getByLabelText("Роль: Родитель")).toBeInTheDocument();
    expect(screen.getByLabelText("Роль: Скаут")).toBeInTheDocument();
    expect(screen.getByLabelText("Email адрес")).toBeInTheDocument();
    expect(screen.getByLabelText("Пароль")).toBeInTheDocument();
  });

  it("toggles to registration mode", async () => {
    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Зарегистрироваться"));

    expect(screen.getByText("Регистрация")).toBeInTheDocument();
    expect(screen.getByLabelText("Полное имя")).toBeInTheDocument();
  });

  it("navigates to /dashboard when parent logs in", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Роль: Родитель"));
    await user.type(screen.getByLabelText("Email адрес"), "parent@test.com");
    await user.type(screen.getByLabelText("Пароль"), "password123");
    await user.click(screen.getByLabelText("Войти в аккаунт"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "parent@test.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("navigates to /players when scout logs in", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Роль: Скаут"));
    await user.type(screen.getByLabelText("Email адрес"), "scout@test.com");
    await user.type(screen.getByLabelText("Пароль"), "password123");
    await user.click(screen.getByLabelText("Войти в аккаунт"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/players");
    });
  });

  it("displays API error on login failure", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { detail: "Неверный пароль" } },
    });

    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Роль: Родитель"));
    await user.type(screen.getByLabelText("Email адрес"), "user@test.com");
    await user.type(screen.getByLabelText("Пароль"), "wrongpass");
    await user.click(screen.getByLabelText("Войти в аккаунт"));

    await waitFor(() => {
      expect(screen.getByText("Неверный пароль")).toBeInTheDocument();
    });
  });

  it("displays generic error when no detail in response", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Network error"));

    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Роль: Родитель"));
    await user.type(screen.getByLabelText("Email адрес"), "user@test.com");
    await user.type(screen.getByLabelText("Пароль"), "password123");
    await user.click(screen.getByLabelText("Войти в аккаунт"));

    await waitFor(() => {
      expect(
        screen.getByText("Ошибка входа. Проверьте данные.")
      ).toBeInTheDocument();
    });
  });
});
