import { Navigate, createBrowserRouter } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";
import { WelcomeScreen } from "./screens/auth/Welcome";
import { LoginScreen } from "./screens/auth/Login";
import { SignupScreen } from "./screens/auth/Signup";
import { OnboardingScreen } from "./screens/auth/Onboarding";
import HomeScreen from "./screens/Home";
import PacientesListScreen from "./screens/pacientes/List";
import TratamentosListScreen from "./screens/tratamentos/List";
import AgendaScreen from "./screens/Agenda";
import ConfigScreen from "./screens/Config";
import NotFoundScreen from "./screens/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <WelcomeScreen /> },
      { path: "login", element: <LoginScreen /> },
      { path: "cadastro", element: <SignupScreen /> },
      { path: "onboarding", element: <OnboardingScreen /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "familia", element: <PacientesListScreen /> },
      {
        path: "familia/:id",
        lazy: async () => {
          const module = await import("./screens/pacientes/Detalhe");
          return { Component: module.PacienteDetalheScreen };
        },
      },
      { path: "tratamentos", element: <TratamentosListScreen /> },
      { path: "agenda", element: <AgendaScreen /> },
      {
        path: "insights",
        lazy: async () => {
          const module = await import("./screens/Relatorios");
          return { Component: module.RelatoriosScreen };
        },
      },
      { path: "configuracoes", element: <ConfigScreen /> },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
