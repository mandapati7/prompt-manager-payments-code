"use client";

import { useMembership } from "@/hooks/use-membership";
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { BookMarked, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

// Get the subscription link from env
const subscriptionLink = process.env.NEXT_PUBLIC_MONTHLY_SUBSCRIPTION_LINK;

export const Header = () => {
  // Get current pathname for active link styling
  const pathname = usePathname();
  const { isPro, loading } = useMembership();
  // Get userId for the checkout link
  const { userId } = useAuth();
  // State for mobile menu
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  // Add client reference ID to subscription link if user is logged in
  const finalSubscriptionLink = userId && subscriptionLink ? `${subscriptionLink}?client_reference_id=${userId}` : "#";

  // Navigation items - filtered based on membership status
  // We don't show Pricing page for Pro members as they don't need to see it anymore
  const navItems = [
    {
      name: "Home",
      href: "/"
    },
    // Only show Pricing for non-Pro members
    ...(!isPro ? [
      {
        name: "Pricing",
        href: "/pricing"
      }
    ] : []),
    {
      name: "Prompts",
      href: "/prompts"
    }
  ];

  return (
    <>
      {/* Fixed header - using z-30 to ensure it's below potential modals but above content */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and site name */}
            <div className="flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Manager</span>
            </div>

            {/* Mobile navigation button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsNavOpen(!isNavOpen)}
                aria-label="Toggle navigation"
                aria-expanded={isNavOpen}
                aria-haspopup="true"
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isNavOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400
                    ${pathname === item.href ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}
                >
                  {item.name}
                </Link>
              ))}

              <SignedIn>
                <div className="flex items-center gap-2">
                  {isPro && !loading && (
                    <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full">
                      PRO
                    </span>
                  )}
                  {/* Show Upgrade button if user is signed in, not pro, and not loading */}
                  {!isPro && !loading && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none hover:opacity-90"
                    >
                      {/* Link to the Stripe checkout page */}
                      <a
                        href={finalSubscriptionLink}
                        className={finalSubscriptionLink === "#" ? "pointer-events-none opacity-50" : ""}
                      >
                        Upgrade
                      </a>
                    </Button>
                  )}
                  <UserButton />
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <Button>Sign in</Button>
                </SignInButton>
              </SignedOut>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer - Using a portal-like approach to avoid hydration issues */}
      {isNavOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden md:hidden" aria-modal="true" role="dialog">
          {/* Dark backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/70"
            onClick={() => setIsNavOpen(false)}
          />
          
          {/* Navigation drawer */}
          <div 
            className="fixed inset-y-0 right-0 w-full max-w-xs flex flex-col overflow-hidden bg-white dark:bg-gray-900 shadow-xl"
            style={{ maxWidth: "280px" }}
          >
            {/* Navigation header */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                className="rounded-md p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="sr-only">Close panel</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsNavOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Account section */}
                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <SignedIn>
                    <div className="space-y-6">
                      {isPro && !loading && (
                        <div className="flex justify-center">
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-sm font-medium text-white">
                            PRO ACCOUNT
                          </span>
                        </div>
                      )}
                      {!isPro && !loading && (
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-sm"
                          size="lg"
                        >
                          <a
                            href={finalSubscriptionLink}
                            className={finalSubscriptionLink === "#" ? "pointer-events-none opacity-50" : ""}
                          >
                            Upgrade to PRO
                          </a>
                        </Button>
                      )}
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</p>
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </div>
                  </SignedIn>
                  
                  <SignedOut>
                    <div className="mt-6">
                      <SignInButton mode="modal">
                        <Button className="w-full" size="lg">
                          Sign in
                        </Button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
