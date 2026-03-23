import TopNavbar from "@/components/navbar/TopNavbar";
import React from "react";
import { Outlet } from "react-router-dom";
import SideNav from "@/components/navbar/SideNav";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useDispatch } from "react-redux";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { useSearch } from "@/contexts/SearchContext";
import Footer from "@/components/footer/footer";

const Layout = () => {
  const dispatch = useDispatch();
  const { isSearching } = useSearch();

  // Fetch user data at layout level so it's cached and available to all child components
  const { data: user } = useGetCurrentUserQuery();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Update Redux state when user data is fetched (for backward compatibility)
  React.useEffect(() => {
    if (user) {
      dispatch(userDetailsFetched(user));
    }
  }, [user, dispatch]);

  return (
    <main className="min-h-screen w-full bg-gray-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-50 flex transition-colors duration-300">
      {/* Sidebar - Fixed on detailed, hidden on mobile */}
      <SideNav
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
        {/* Top Navbar - Sticky */}
        <div className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-[#09090b]/80 border-b border-gray-200/50 dark:border-white/5 supports-[backdrop-filter]:bg-white/60">
          <TopNavbar setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </div>

        {/* Page Content */}
        {!isSearching && (
          <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col overflow-x-hidden max-w-[1600px] w-full mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out flex-1">
              <Outlet />
            </div>
            <div className="mt-auto pt-8">
              <Footer />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Layout;
