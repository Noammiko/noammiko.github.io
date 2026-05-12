import AdminLayout from "./layout";
import { AdminDashboard } from "./AdminDashboard";

// AdminLayout provides ConvexAuthProvider + the Authenticated/Unauthenticated gate.
// AdminDashboard only renders (and fires its seeds/queries) once the user is logged in.
export default function AdminWithConvex() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
