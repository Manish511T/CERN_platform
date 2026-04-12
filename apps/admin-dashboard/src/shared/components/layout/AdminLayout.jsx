import { DesktopSidebar, MobileNav } from './Sidebar'

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DesktopSidebar />
      <MobileNav />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout