// app/admin/layout.js

import Navbar from "@/components/ui/navbar";

export default function AdminLayout({ children }) {
  return (
    <>
      <Navbar/>
      <main>{children}</main>
    </>
  );
}
