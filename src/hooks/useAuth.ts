import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { type User } from "@shared/schema";

export function useAuth() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  
  const isDevMode = !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Fetch user profile from our backend
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isDevMode || (isSignedIn && clerkLoaded),
    retry: false,
  });

  const isLoading = isDevMode ? userLoading : (!clerkLoaded || (isSignedIn && userLoading));

  return {
    user,
    isLoading,
    isAuthenticated: isDevMode ? !!user : !!isSignedIn,
  };
}
