import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";

export interface AuthMe {
  id: number;
  clerkId: string;
  name: string;
  email: string;
  role: "tenant" | "landlord" | "admin";
}

export function useGetAuthMe(
  options?: Partial<UseQueryOptions<AuthMe>>,
) {
  return useQuery<AuthMe>({
    queryKey: ["auth", "me"],
    queryFn: () => customFetch<AuthMe>("/api/auth/me"),
    retry: 1,
    staleTime: 60_000,
    ...options,
  });
}
