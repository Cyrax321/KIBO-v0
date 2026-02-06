import * as React from "react";
import { motion } from "framer-motion";
import { 
  ChevronDown, ChevronUp, ExternalLink, MapPin, Banknote, 
  Search, Filter, Download, Upload, Trash2, Edit, MoreHorizontal,
  ArrowUpDown, Check
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  notes: string | null;
  salary: string | null;
  location: string | null;
  is_remote: boolean;
  job_url: string | null;
  applied_at: string | null;
  created_at: string;
}

interface ApplicationTableViewProps {
  applications: Application[];
  onSelect: (app: Application) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const STATUSES = [
  { id: "wishlist", label: "Wishlist", color: "bg-muted text-muted-foreground" },
  { id: "applied", label: "Applied", color: "bg-primary/20 text-primary" },
  { id: "oa", label: "OA", color: "bg-warning/20 text-warning" },
  { id: "technical", label: "Technical", color: "bg-accent text-accent-foreground" },
  { id: "hr", label: "HR", color: "bg-success/20 text-success" },
  { id: "offer", label: "Offer", color: "bg-success text-success-foreground" },
  { id: "rejected", label: "Rejected", color: "bg-destructive/20 text-destructive" },
];

type SortField = "company" | "role" | "status" | "created_at" | "salary";
type SortDirection = "asc" | "desc";

export const ApplicationTableView: React.FC<ApplicationTableViewProps> = ({
  applications,
  onSelect,
  onDelete,
  onStatusChange,
}) => {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredApps = React.useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.company.toLowerCase().includes(search.toLowerCase()) ||
          app.role.toLowerCase().includes(search.toLowerCase()) ||
          (app.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "company":
            comparison = a.company.localeCompare(b.company);
            break;
          case "role":
            comparison = a.role.localeCompare(b.role);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "created_at":
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case "salary":
            comparison = (a.salary || "").localeCompare(b.salary || "");
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [applications, search, statusFilter, sortField, sortDirection]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredApps.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApps.map((app) => app.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const { error } = await supabase
      .from("applications")
      .delete()
      .in("id", Array.from(selectedIds));

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `${selectedIds.size} applications removed` });
      setSelectedIds(new Set());
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.size === 0) return;

    const { error } = await supabase
      .from("applications")
      .update({ status })
      .in("id", Array.from(selectedIds));

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `${selectedIds.size} applications updated` });
      setSelectedIds(new Set());
    }
  };

  const exportToCSV = () => {
    const headers = ["Company", "Role", "Status", "Location", "Salary", "Remote", "Applied Date", "Job URL"];
    const rows = filteredApps.map((app) => [
      app.company,
      app.role,
      app.status,
      app.location || "",
      app.salary || "",
      app.is_remote ? "Yes" : "No",
      app.created_at ? format(new Date(app.created_at), "yyyy-MM-dd") : "",
      app.job_url || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "CSV file downloaded" });
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = STATUSES.find((s) => s.id === status) || STATUSES[0];
    return (
      <Badge className={cn("text-xs", statusInfo.color)}>
        {statusInfo.label}
      </Badge>
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies, roles, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="text-destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {STATUSES.map((status) => (
                  <DropdownMenuItem 
                    key={status.id}
                    onClick={() => handleBulkStatusChange(status.id)}
                  >
                    Move to {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === filteredApps.length && filteredApps.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <SortableHeader field="company">Company</SortableHeader>
              <SortableHeader field="role">Role</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <TableHead>Location</TableHead>
              <SortableHeader field="salary">Salary</SortableHeader>
              <SortableHeader field="created_at">Added</SortableHeader>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredApps.map((app) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => onSelect(app)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(app.id)}
                      onCheckedChange={() => handleSelectOne(app.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{app.company}</TableCell>
                  <TableCell>{app.role}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={app.status}
                      onValueChange={(v) => onStatusChange(app.id, v)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        {getStatusBadge(app.status)}
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              {app.status === status.id && <Check className="h-3 w-3" />}
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      {app.location && <MapPin className="h-3 w-3 text-muted-foreground" />}
                      {app.location || "-"}
                      {app.is_remote && (
                        <Badge variant="outline" className="text-[10px] ml-1">Remote</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {app.salary ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Banknote className="h-3 w-3 text-muted-foreground" />
                        {app.salary}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(app.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {app.job_url && (
                          <DropdownMenuItem asChild>
                            <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Job Link
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onSelect(app)}>
                          <Edit className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filteredApps.length} of {applications.length} applications
      </div>
    </div>
  );
};
