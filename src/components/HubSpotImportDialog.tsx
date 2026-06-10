import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Building2, RefreshCw, Search, AlertCircle } from "lucide-react";
import { fetchAllCompanies, type HubSpotCompany } from "@/lib/hubspot";
import { useImportHubSpotCompanies } from "@/hooks/usePlans";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HubSpotImportDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { mutate: importCompanies, isPending: isImporting } = useImportHubSpotCompanies();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Fetch all HubSpot companies when dialog opens (5-min cache is fine — companies don't change often)
  const {
    data: allCompanies = [],
    isLoading: isHubSpotLoading,
    isError,
    error,
    refetch,
  } = useQuery<HubSpotCompany[]>({
    queryKey: ["hubspot-companies-fetch"],
    queryFn: fetchAllCompanies,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch existing hubspot_company_id values FRESH from Supabase every time the dialog opens.
  // Using a separate dedicated query (NOT usePlans) ensures we always have up-to-date dedup data
  // and avoids the shared-cache race condition that caused all companies to appear as "new".
  const {
    data: existingIdList = [],
    isLoading: isExistingLoading,
  } = useQuery<string[]>({
    queryKey: ["existing-hubspot-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_plans")
        .select("hubspot_company_id")
        .not("hubspot_company_id", "is", null);
      if (error) throw error;
      return (data ?? []).map((r) => r.hubspot_company_id as string);
    },
    enabled: open,
    staleTime: 0,           // Always re-fetch when dialog opens — must be fresh
    gcTime: 0,              // Don't keep in cache after dialog closes
  });

  // Both data sources must be ready before we allow interaction
  const isLoading = isHubSpotLoading || isExistingLoading;

  const existingIds = useMemo(() => new Set(existingIdList), [existingIdList]);

  const newCompanies = useMemo(
    () => allCompanies.filter((c) => !existingIds.has(c.id)),
    [allCompanies, existingIds]
  );

  const filtered = useMemo(
    () =>
      newCompanies.filter((c) =>
        c.properties.name?.toLowerCase().includes(search.toLowerCase())
      ),
    [newCompanies, search]
  );

  // Reset selection when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setSearch("");
    }
  }, [open]);

  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImport = () => {
    const toImport = allCompanies.filter((c) => selected.has(c.id));
    importCompanies(toImport, {
      onSuccess: ({ added, skipped }) => {
        const parts = [];
        if (added > 0)   parts.push(`${added} created`);
        if (skipped > 0) parts.push(`${skipped} already imported`);
        toast({
          title: "Import complete",
          description: parts.join(" · ") || "Nothing to import.",
        });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({
          title: "Import failed",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Import from HubSpot
          </DialogTitle>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>
              {isExistingLoading && isHubSpotLoading
                ? "Loading…"
                : isExistingLoading
                ? "Checking existing plans…"
                : "Fetching companies from HubSpot…"}
            </span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center gap-3 py-8 text-destructive">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium text-center">
              {error instanceof Error ? error.message : "Failed to fetch companies"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {/* Company list — only show when both queries are done */}
        {!isLoading && !isError && (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {newCompanies.length} new{" "}
                {newCompanies.length === 1 ? "company" : "companies"} found
                {existingIds.size > 0 && ` (${existingIds.size} already imported)`}
              </span>
              {selected.size > 0 && (
                <Badge variant="secondary">{selected.size} selected</Badge>
              )}
            </div>

            {/* Search */}
            {newCompanies.length > 8 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter companies…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            {newCompanies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">All HubSpot companies are already imported.</p>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer border border-border"
                  onClick={toggleAll}
                >
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                  <span className="text-sm font-medium">
                    {allSelected ? "Deselect all" : `Select all (${filtered.length})`}
                  </span>
                </div>

                {/* Company rows */}
                <ScrollArea className="h-64">
                  <div className="space-y-1 pr-3">
                    {filtered.length === 0 && (
                      <p className="text-sm text-center text-muted-foreground py-4">
                        No companies match your search
                      </p>
                    )}
                    {filtered.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleOne(company.id)}
                      >
                        <Checkbox
                          checked={selected.has(company.id)}
                          onCheckedChange={() => toggleOne(company.id)}
                          aria-label={company.properties.name}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {company.properties.name}
                          </p>
                          {company.properties.industry && (
                            <p className="text-xs text-muted-foreground truncate">
                              {company.properties.industry}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selected.size === 0 || isImporting || isLoading}
            className="gap-2"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                Import {selected.size > 0 ? selected.size : ""}{" "}
                {selected.size === 1 ? "Company" : "Companies"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
