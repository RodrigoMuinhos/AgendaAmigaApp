import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AlertsPage } from '../features/alerts/AlertsPage';
import { CareFormPage } from '../features/care/CareFormPage';
import { CareOverviewPage } from '../features/care/CareOverviewPage';
import { HomePage } from '../features/home/HomePage';
import { TodayRoutinePage } from '../features/routine/TodayRoutinePage';
import { TreatmentListPage } from '../features/treatments/TreatmentListPage';
import { ListaCriancasPage } from '../features/criancas/pages/ListaCriancasPage';
import { NovaCriancaPage } from '../features/criancas/pages/NovaCriancaPage';
import { FichaCriancaPage } from '../features/criancas/pages/FichaCriancaPage';
import { EditarCriancaPage } from '../features/criancas/pages/EditarCriancaPage';
import { CadernetaPage } from '../features/criancas/pages/CadernetaPage';
import { TabVisaoGeral } from '../features/criancas/pages/tabs/TabVisaoGeral';
import { TabCrescimento } from '../features/criancas/pages/tabs/TabCrescimento';
import { TabVacinacao } from '../features/criancas/pages/tabs/TabVacinacao';
import { TabConsultas } from '../features/criancas/pages/tabs/TabConsultas';
import { DailyCareReportPage } from '../features/reports/DailyCareReportPage';
import { AppShell } from '../layout/AppShell';
import { LoginPage } from '../pages/Login';
import { LoginSuccessPage } from '../pages/LoginSuccess';
import { NotFoundPage } from '../pages/NotFound';
import DebugApi from '../pages/DebugApi';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/login-success',
    element: <LoginSuccessPage />,
  },
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/criancas" replace />,
      },
      {
        path: '/inicio',
        element: <HomePage />,
      },
      {
        path: '/criancas',
        element: <ListaCriancasPage />,
      },
      {
        path: '/criancas/nova',
        element: <NovaCriancaPage />,
      },
      {
        path: '/criancas/:id',
        element: <FichaCriancaPage />,
      },
      {
        path: '/criancas/:id/editar',
        element: <EditarCriancaPage />,
      },
      {
        path: '/criancas/:id/caderneta',
        element: <CadernetaPage />,
        children: [
          {
            index: true,
            element: <Navigate to="visao" replace />,
          },
          {
            path: 'visao',
            element: <TabVisaoGeral />,
          },
          {
            path: 'crescimento',
            element: <TabCrescimento />,
          },
          {
            path: 'vacinacao',
            element: <TabVacinacao />,
          },
          {
            path: 'consultas',
            element: <TabConsultas />,
          },
        ],
      },
      {
        path: '/care',
        element: <CareOverviewPage />,
      },
      {
        path: '/care/consulta/new',
        element: <CareFormPage defaultType="CONSULTA" />,
      },
      {
        path: '/care/consulta/:id',
        element: <CareFormPage defaultType="CONSULTA" />,
      },
      {
        path: '/care/exame/new',
        element: <CareFormPage defaultType="EXAME" />,
      },
      {
        path: '/care/exame/:id',
        element: <CareFormPage defaultType="EXAME" />,
      },
      {
        path: '/care/terapia/new',
        element: <CareFormPage defaultType="TERAPIA" />,
      },
      {
        path: '/care/terapia/:id',
        element: <CareFormPage defaultType="TERAPIA" />,
      },
      {
        path: '/treatments',
        element: <TreatmentListPage />,
      },
      {
        path: '/routine/today',
        element: <TodayRoutinePage />,
      },
      {
        path: '/reports/daily-care',
        element: <DailyCareReportPage />,
      },
      {
        path: '/alerts',
        element: <AlertsPage />,
      },
      {
        path: '/debug-api',
        element: <DebugApi />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
