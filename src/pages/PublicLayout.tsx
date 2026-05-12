import { Outlet } from "react-router-dom";
import { PublicHeader } from "@/shared/components/PublicHeader";

export function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
    </>
  );
}
