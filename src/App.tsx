 import { Routes, Route, Navigate } from "react-router-dom";
  import AppShell from "./components/layout/AppShell";
  import Protected from "./components/Protected";
  import RequireRole from "./components/RequireRole";
  import Home from "./routes/Home";
  import SignIn from "./routes/SignIn";
  import SuperAdmin from "./routes/SuperAdmin";

  export default function App() {
    return (
      <AppShell>
        <Routes>
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    );
  }

