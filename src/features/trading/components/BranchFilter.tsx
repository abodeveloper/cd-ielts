import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getBranches, getBranchFilters } from "../api/trading";
import { Branch } from "../types";
import { useEffect } from "react";

interface BranchFilterProps {
  selectedBranchId: number | undefined;
  onBranchChange: (branchId: number) => void;
  onFiltersLoaded?: (filters: any) => void;
}

const BranchFilter = ({ selectedBranchId, onBranchChange, onFiltersLoaded }: BranchFilterProps) => {
  // Fetch branches list
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });

  // Fetch filters for selected branch
  const { data: branchFilters, isLoading: filtersLoading } = useQuery({
    queryKey: ["branch-filters", selectedBranchId],
    queryFn: () => getBranchFilters(selectedBranchId!),
    enabled: !!selectedBranchId, // Only run when branch is selected
  });

  // Notify parent component when filters are loaded
  useEffect(() => {
    if (branchFilters && onFiltersLoaded) {
      onFiltersLoaded(branchFilters);
    }
  }, [branchFilters, onFiltersLoaded]);

  const handleBranchChange = (value: string) => {
    const branchId = parseInt(value);
    onBranchChange(branchId);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="branch-select">Filial tanlang</Label>
      <Select
        value={selectedBranchId?.toString() || ""}
        onValueChange={handleBranchChange}
        disabled={branchesLoading}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder={branchesLoading ? "Yuklanmoqda..." : "Filialni tanlang"} 
          />
        </SelectTrigger>
        <SelectContent>
          {branches?.map((branch: Branch) => (
            <SelectItem key={branch.id} value={branch.id.toString()}>
              {branch.name} ({branch.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {filtersLoading && selectedBranchId && (
        <p className="text-sm text-muted-foreground">Filtr ma'lumotlari yuklanmoqda...</p>
      )}
    </div>
  );
};

export default BranchFilter;

