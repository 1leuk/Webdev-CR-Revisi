import Navbar from "@/components/Navbar";
import Footer from "@/components/footer"; // ✅ Import Footer

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar /> {/* ✅ Navbar at the top */}
      <main className="flex-grow">{children}</main> {/* ✅ Main content */}
      <Footer /> {/* ✅ Footer at the bottom */}
    </div>
  );
}
