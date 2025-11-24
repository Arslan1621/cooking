import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

export function useAuth() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  
  // Fetch user profile from our backend
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isSignedIn && clerkLoaded,
    retry: false,
  });

  const isLoading = !clerkLoaded || (isSignedIn && userLoading);

  return {
    user,
    isLoading,
    isAuthenticated: !!isSignedIn,
  };
}
