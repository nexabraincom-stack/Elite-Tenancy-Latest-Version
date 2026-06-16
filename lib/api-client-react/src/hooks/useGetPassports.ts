import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";

export interface RenterPassportSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  minBudget: number | null;
  maxBudget: number;
  bedrooms: number | null;
  moveInDate: string | null;
  occupants: string | null;
  employment: string | null;
  petsOwner: boolean;
  aiPersona: string | null;
  aiScore: number | null;
  status: "new" | "contacted" | "qualified" | "closed";
  createdAt: string;
}

export interface PassportsResponse {
  passports: RenterPassportSummary[];
}

/**
 * Landlord/admin-only AI-ranked pool of prospective tenants.
 * Backed by GET /api/passports (role-gated server-side). Session cookie is
 * attached automatically by customFetch.
 */
export function useGetPassports(
  options?: Partial<UseQueryOptions<PassportsResponse>>,
) {
  return useQuery<PassportsResponse>({
    queryKey: ["passports", "pool"],
    queryFn: () => customFetch<PassportsResponse>("/api/passports"),
    staleTime: 30_000,
    ...options,
  });
}
