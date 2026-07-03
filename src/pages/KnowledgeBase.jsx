import { useEffect, useRef, useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function KnowledgeBase({ brandId, onBrandChange }) {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  async function loadDocuments() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getKnowledgeDocuments(brandId);
      setDocuments(data.documents || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [brandId]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", file.name);

    setUploading(true);
    setError("");
    try {
      await api.uploadKnowledgeDocument(brandId, formData);
      await loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(documentId) {
    setError("");
    setDeletingId(documentId);
    try {
      await api.deleteKnowledgeDocument(brandId, documentId);
      await loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Knowledge Brain"
        title="Knowledge Base"
        description="Upload brand policy, FAQ and product documents. Retrieval stays scoped to the selected brand."
        brandId={brandId}
        onBrandChange={onBrandChange}
        action={
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <UploadCloud className="h-4 w-4" />
            {uploading ? "Uploading" : "Upload document"}
          </Button>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={handleUpload}
      />

      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-muted">Documents</p><p className="mt-2 text-2xl font-semibold">{stats?.documentCount || 0}</p></Card>
        <Card><p className="text-sm text-muted">Chunks</p><p className="mt-2 text-2xl font-semibold">{stats?.chunkCount || 0}</p></Card>
        <Card><p className="text-sm text-muted">Supported</p><p className="mt-2 text-2xl font-semibold">PDF DOCX TXT</p></Card>
      </div>

      {loading ? <LoadingState label="Loading documents" /> : null}
      {!loading && !documents.length ? (
        <EmptyState title="No documents uploaded yet" description="Upload a policy, FAQ or catalog document to ground AI answers with brand-specific knowledge." />
      ) : null}

      {!loading && documents.length ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto teviq-scrollbar">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-5 py-4">Document</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Chunks</th>
                  <th className="px-5 py-4">Uploaded</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {documents.map((doc) => (
                  <tr key={doc.documentId} className="bg-white/45">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{doc.title || doc.sourceName}</p>
                          <p className="text-xs text-muted">{doc.sourceName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 uppercase text-muted">{doc.extension}</td>
                    <td className="px-5 py-4 font-medium">{doc.chunkCount}</td>
                    <td className="px-5 py-4 text-muted">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(doc.documentId)}
                        disabled={deletingId === doc.documentId}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === doc.documentId ? "Deleting" : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </>
  );
}
