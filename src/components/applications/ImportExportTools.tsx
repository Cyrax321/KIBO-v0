import * as React from "react";
import { Download, Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ImportExportToolsProps {
  applications: Array<{
    id: string;
    company: string;
    role: string;
    status: string;
    notes: string | null;
    salary: string | null;
    location: string | null;
    is_remote: boolean;
    job_url: string | null;
    created_at: string;
  }>;
  onImportComplete: () => void;
}

export const ImportExportTools: React.FC<ImportExportToolsProps> = ({
  applications,
  onImportComplete,
}) => {
  const { toast } = useToast();
  const [importing, setImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [importResults, setImportResults] = React.useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const exportToCSV = () => {
    const headers = [
      "Company",
      "Role",
      "Status",
      "Location",
      "Salary",
      "Remote",
      "Job URL",
      "Notes",
      "Created Date",
    ];
    
    const rows = applications.map((app) => [
      app.company,
      app.role,
      app.status,
      app.location || "",
      app.salary || "",
      app.is_remote ? "Yes" : "No",
      app.job_url || "",
      app.notes || "",
      format(new Date(app.created_at), "yyyy-MM-dd"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job_applications_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Exported!", description: `${applications.length} applications exported to CSV` });
  };

  const exportToJSON = () => {
    const data = applications.map((app) => ({
      company: app.company,
      role: app.role,
      status: app.status,
      location: app.location,
      salary: app.salary,
      is_remote: app.is_remote,
      job_url: app.job_url,
      notes: app.notes,
      created_at: app.created_at,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job_applications_${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Exported!", description: `${applications.length} applications exported to JSON` });
  };

  const downloadTemplate = () => {
    const headers = ["Company", "Role", "Status", "Location", "Salary", "Remote", "Job URL", "Notes"];
    const exampleRow = ["Google", "Software Engineer", "wishlist", "Mountain View, CA", "$150k-$200k", "No", "https://careers.google.com/...", "Great opportunity!"];
    
    const csvContent = [headers, exampleRow]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Template Downloaded", description: "Fill in the template and import it back" });
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n");
    return lines.map((line) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    setImportResults(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      setImporting(false);
      return;
    }

    try {
      const text = await file.text();
      let data: Array<Record<string, string>>;

      if (file.name.endsWith(".json")) {
        data = JSON.parse(text);
      } else {
        const rows = parseCSV(text);
        const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
        data = rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((header, i) => {
            obj[header] = row[i] || "";
          });
          return obj;
        });
      }

      const results = { success: 0, failed: 0, errors: [] as string[] };
      const total = data.length;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        setImportProgress(Math.round(((i + 1) / total) * 100));

        const company = row.company || row.Company || "";
        const role = row.role || row.Role || row.position || row.Position || "";

        if (!company || !role) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing company or role`);
          continue;
        }

        const status = (row.status || row.Status || "wishlist").toLowerCase();
        const validStatuses = ["wishlist", "applied", "oa", "technical", "hr", "offer", "rejected"];
        const finalStatus = validStatuses.includes(status) ? status : "wishlist";

        const isRemote = ["yes", "true", "1", "remote"].includes(
          (row.remote || row.Remote || row.is_remote || "").toLowerCase()
        );

        const { error } = await supabase.from("applications").insert({
          user_id: session.user.id,
          company,
          role,
          status: finalStatus,
          location: row.location || row.Location || null,
          salary: row.salary || row.Salary || null,
          is_remote: isRemote,
          job_url: row.job_url || row["Job URL"] || row.url || null,
          notes: row.notes || row.Notes || null,
        });

        if (error) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        } else {
          results.success++;
        }
      }

      setImportResults(results);
      
      if (results.success > 0) {
        onImportComplete();
        toast({ 
          title: "Import Complete", 
          description: `${results.success} applications imported successfully` 
        });
      }
    } catch (error) {
      toast({ 
        title: "Import Failed", 
        description: "Could not parse the file. Please check the format.", 
        variant: "destructive" 
      });
    }

    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Export Dropdown */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Applications</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Export your {applications.length} applications to a file
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToJSON} className="gap-2">
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Applications</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Import applications from a CSV or JSON file. Download the template for the correct format.
            </p>
            
            <Button variant="outline" onClick={downloadTemplate} className="w-full gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Download CSV Template
            </Button>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Click to upload</span>
                <span className="text-xs text-muted-foreground">CSV or JSON files</span>
              </label>
            </div>

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}

            {importResults && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  <span>{importResults.success} imported successfully</span>
                </div>
                {importResults.failed > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {importResults.failed} failed to import
                      {importResults.errors.slice(0, 3).map((err, i) => (
                        <div key={i} className="text-xs mt-1">{err}</div>
                      ))}
                      {importResults.errors.length > 3 && (
                        <div className="text-xs mt-1">...and {importResults.errors.length - 3} more</div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
