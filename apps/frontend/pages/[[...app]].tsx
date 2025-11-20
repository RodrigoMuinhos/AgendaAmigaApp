'use client';

// Next handles all routes through this single entry point because React Router
// manages navigation on the client. The component itself renders nothing because
// the RouterProvider is mounted from `pages/_app.tsx`, but having this catch-all
// route prevents Next from returning a 404 for `/login`, `/alerts`, etc.
export default function AppEntryPoint() {
  return null;
}
