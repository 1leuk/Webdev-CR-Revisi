import { AdminGuard } from "@/components/AdminGuard";

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Admin Controls</h2>
          {/* Add admin-specific controls */}
          <ul>
            <li>Manage Users</li>
            <li>Product Management</li>
            <li>Order Tracking</li>
          </ul>
        </div>
      </div>
    </AdminGuard>
  );
}