import { updatedKitchens } from '../data/updatedKitchens';
import { updatedHalls } from '../data/updatedHalls';

export const useVenues = ({ type }: { type: "hall" | "kitchen" }) => {
  const data = type === "kitchen" ? updatedKitchens : updatedHalls;
  return { data, isLoading: false };
};
