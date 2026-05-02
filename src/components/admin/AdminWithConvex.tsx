import { AdminDashboard } from "./AdminDashboard";
import { withConvexProvider } from "@/lib/convex";

// Static wrapper so Astro can resolve this component for client:load hydration.
const AdminWithConvex = withConvexProvider(AdminDashboard, "auth");

export default AdminWithConvex;
