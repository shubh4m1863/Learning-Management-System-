import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Clock, History } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { toast } from "sonner";

export const CertificateManagement = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const res = activeTab === "pending" 
        ? await adminApi.getPendingCertificates()
        : await adminApi.getApprovedCertificates();
      setCertificates(res.data);
    } catch (error) {
      toast.error("Failed to fetch certificates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await adminApi.approveCertificate(id);
      toast.success("Certificate approved successfully!");
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to approve certificate");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Certificate Management</h2>
          <p className="text-muted-foreground mt-1">
            Review and approve certificates for interns who have completed their courses.
          </p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === "pending" 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" /> Pending
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === "history" 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            {activeTab === "pending" ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-500 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">All Caught Up!</h3>
                <p className="text-muted-foreground">There are no pending certificates to approve.</p>
              </>
            ) : (
              <>
                <History className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No History</h3>
                <p className="text-muted-foreground">You haven't approved any certificates yet.</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Intern</th>
                  <th className="px-6 py-4 font-medium">Course</th>
                  <th className="px-6 py-4 font-medium">Completed Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{cert.user.name}</div>
                      <div className="text-xs text-muted-foreground">{cert.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{cert.course.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(cert.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {activeTab === "pending" ? (
                        <button
                          onClick={() => handleApprove(cert.id)}
                          disabled={processingId === cert.id}
                          className="btn-primary !py-1.5 !px-4 text-sm inline-flex items-center gap-2"
                        >
                          {processingId === cert.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
