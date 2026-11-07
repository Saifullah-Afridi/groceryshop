import { useQuery } from "@tanstack/react-query";
import { getCategories, getCities } from "../services/catalogService";

export const useCategories = () => useQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime: 5 * 60_000 });
export const useCities = () => useQuery({ queryKey: ["cities"], queryFn: getCities });
