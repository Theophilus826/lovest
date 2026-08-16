import { Outlet } from "react-router-dom";

import Header from "../component/Header";
import BottomNav from "../component/ButtomNarve";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="pt-10 pb-20">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}