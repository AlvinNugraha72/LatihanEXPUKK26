import AdminSidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-black">
      {/* Sidebar (Client Component) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </div>
  );
}
