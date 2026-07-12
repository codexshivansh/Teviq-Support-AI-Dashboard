import { useEffect, useRef, useState } from "react";
import {
  FileText,
  HelpCircle,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

const TABS = [
  { id: "documents", label: "Documents", icon: FileText },
  { id: "policies", label: "Policies", icon: ShieldCheck },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "products", label: "Products", icon: Package }
];

const POLICY_TYPES = [
  { value: "return", label: "Return" },
  { value: "refund", label: "Refund" },
  { value: "exchange", label: "Exchange" },
  { value: "shipping", label: "Shipping" },
  { value: "cancellation", label: "Cancellation" },
  { value: "warranty", label: "Warranty" },
  { value: "privacy", label: "Privacy" },
  { value: "terms", label: "Terms" },
  { value: "custom", label: "Custom" }
];

const emptyPolicyForm = {
  policyType: "return",
  title: "",
  content: "",
  tags: ""
};

const emptyFaqForm = {
  question: "",
  answer: "",
  tags: ""
};

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function normalizeTagsForInput(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function FieldLabel({ children }) {
  return <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{children}</label>;
}

function TextInput(props) {
  return (
    <input
      className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-950/5 dark:bg-white/5"
      {...props}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-950/5 dark:bg-white/5"
      {...props}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-950/5 dark:bg-white/5"
      {...props}
    />
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-line bg-white/75 py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-950/5 dark:bg-white/5"
      />
    </div>
  );
}

function TagList({ tags }) {
  if (!Array.isArray(tags) || !tags.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-xs font-medium text-muted dark:bg-white/5">
          {tag}
        </span>
      ))}
    </div>
  );
}

function TabNavigation({ activeTab, onChange }) {
  return (
    <Card className="mb-5 p-1.5">
      <div className="grid gap-1 sm:grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950" : "text-muted hover:bg-white/75 hover:text-ink dark:hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "products" ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/15" : "bg-slate-100 dark:bg-white/10"}`}>
                  Soon
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function DocumentsTab({
  documents,
  stats,
  loading,
  uploading,
  deletingId,
  onUploadClick,
  onDelete
}) {
  return (
    <>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-muted">Documents</p><p className="mt-2 text-2xl font-semibold">{stats?.documentCount || 0}</p></Card>
        <Card><p className="text-sm text-muted">Chunks</p><p className="mt-2 text-2xl font-semibold">{stats?.chunkCount || 0}</p></Card>
        <Card><p className="text-sm text-muted">Supported</p><p className="mt-2 text-2xl font-semibold">PDF DOCX TXT</p></Card>
      </div>

      <Card className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Upload source documents</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Keep using the current PDF, DOCX and TXT ingestion flow for long-form knowledge.
          </p>
        </div>
        <Button onClick={onUploadClick} disabled={uploading}>
          <UploadCloud className="h-4 w-4" />
          {uploading ? "Uploading" : "Upload document"}
        </Button>
      </Card>

      {loading ? <LoadingState label="Loading documents" /> : null}
      {!loading && !documents.length ? (
        <EmptyState title="No documents uploaded yet" description="Upload a policy, FAQ or catalog document to ground AI answers with brand-specific knowledge." />
      ) : null}

      {!loading && documents.length ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto teviq-scrollbar">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-muted dark:bg-white/5">
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
                  <tr key={doc.documentId} className="bg-white/45 dark:bg-transparent">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
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
                        onClick={() => onDelete(doc.documentId)}
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

function PolicyForm({ form, editingPolicy, saving, onChange, onCancel, onSubmit }) {
  return (
    <Card className="mb-4">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div>
            <FieldLabel>Policy type</FieldLabel>
            <SelectInput value={form.policyType} onChange={(event) => onChange({ policyType: event.target.value })}>
              {POLICY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextInput value={form.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="Return policy for domestic orders" />
          </div>
        </div>
        <div>
          <FieldLabel>Content</FieldLabel>
          <TextArea value={form.content} onChange={(event) => onChange({ content: event.target.value })} placeholder="Write the policy exactly as the AI should understand it." />
        </div>
        <div>
          <FieldLabel>Optional tags</FieldLabel>
          <TextInput value={form.tags} onChange={(event) => onChange({ tags: event.target.value })} placeholder="returns, prepaid, domestic" />
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving" : editingPolicy ? "Save changes" : "Save policy"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PoliciesTab({
  policies,
  loading,
  saving,
  deletingId,
  search,
  form,
  editingPolicy,
  showForm,
  onSearchChange,
  onNew,
  onEdit,
  onDelete,
  onFormChange,
  onCancel,
  onSubmit
}) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={search} onChange={onSearchChange} placeholder="Search policies" />
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" />
          Add Policy
        </Button>
      </div>

      {showForm ? (
        <PolicyForm
          form={form}
          editingPolicy={editingPolicy}
          saving={saving}
          onChange={onFormChange}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      ) : null}

      {loading ? <LoadingState label="Loading policies" /> : null}
      {!loading && !policies.length ? (
        <EmptyState title="No policies yet" description="Add return, refund, shipping and warranty policies as structured knowledge for cleaner AI context." />
      ) : null}

      {!loading && policies.length ? (
        <div className="grid gap-4">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold capitalize text-white">
                      {policy.policyType}
                    </span>
                    <span className="text-xs text-muted">Updated {formatDate(policy.updatedAt)}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-ink">{policy.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{policy.content}</p>
                  <TagList tags={policy.tags} />
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" onClick={() => onEdit(policy)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(policy.id)} disabled={deletingId === policy.id}>
                    <Trash2 className="h-4 w-4" />
                    {deletingId === policy.id ? "Deleting" : "Delete"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </>
  );
}

function FaqForm({ form, editingFaq, saving, onChange, onCancel, onSubmit }) {
  return (
    <Card className="mb-4">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <FieldLabel>Question</FieldLabel>
          <TextInput value={form.question} onChange={(event) => onChange({ question: event.target.value })} placeholder="How long does delivery take?" />
        </div>
        <div>
          <FieldLabel>Answer</FieldLabel>
          <TextArea value={form.answer} onChange={(event) => onChange({ answer: event.target.value })} placeholder="Write a clear customer-facing answer." />
        </div>
        <div>
          <FieldLabel>Optional tags</FieldLabel>
          <TextInput value={form.tags} onChange={(event) => onChange({ tags: event.target.value })} placeholder="delivery, shipping, cod" />
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving" : editingFaq ? "Save changes" : "Save FAQ"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FaqsTab({
  faqs,
  loading,
  saving,
  deletingId,
  search,
  form,
  editingFaq,
  showForm,
  onSearchChange,
  onNew,
  onEdit,
  onDelete,
  onFormChange,
  onCancel,
  onSubmit
}) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={search} onChange={onSearchChange} placeholder="Search FAQs" />
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {showForm ? (
        <FaqForm
          form={form}
          editingFaq={editingFaq}
          saving={saving}
          onChange={onFormChange}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      ) : null}

      {loading ? <LoadingState label="Loading FAQs" /> : null}
      {!loading && !faqs.length ? (
        <EmptyState title="No FAQs yet" description="Add common customer questions as structured answers for fast and accurate support responses." />
      ) : null}

      {!loading && faqs.length ? (
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span className="text-xs text-muted">Updated {formatDate(faq.updatedAt)}</span>
                  <h3 className="mt-2 text-base font-semibold text-ink">{faq.question}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{faq.answer}</p>
                  <TagList tags={faq.tags} />
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" onClick={() => onEdit(faq)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(faq.id)} disabled={deletingId === faq.id}>
                    <Trash2 className="h-4 w-4" />
                    {deletingId === faq.id ? "Deleting" : "Delete"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </>
  );
}

function ProductsTab() {
  return (
    <Card className="overflow-hidden">
      <div className="rounded-3xl border border-dashed border-line bg-white/55 p-8 text-center dark:bg-white/5">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
          <Package className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink">Product catalog knowledge is coming soon</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
          This layer is reserved for Shopify product sync, website scraping, catalog imports and recommendation-ready product knowledge.
        </p>
      </div>
    </Card>
  );
}

export function KnowledgeBase({ brandId, onBrandChange }) {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [policySearch, setPolicySearch] = useState("");
  const [policyForm, setPolicyForm] = useState(emptyPolicyForm);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [deletingPolicyId, setDeletingPolicyId] = useState("");

  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqForm, setFaqForm] = useState(emptyFaqForm);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [savingFaq, setSavingFaq] = useState(false);
  const [deletingFaqId, setDeletingFaqId] = useState("");

  async function loadDocuments() {
    setLoadingDocuments(true);
    setError("");
    try {
      const data = await api.getKnowledgeDocuments(brandId);
      setDocuments(data.documents || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function loadPolicies(search = policySearch) {
    setLoadingPolicies(true);
    setError("");
    try {
      const data = await api.getKnowledgePolicies(brandId, search);
      setPolicies(data.policies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPolicies(false);
    }
  }

  async function loadFaqs(search = faqSearch) {
    setLoadingFaqs(true);
    setError("");
    try {
      const data = await api.getKnowledgeFaqs(brandId, search);
      setFaqs(data.faqs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFaqs(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [brandId]);

  useEffect(() => {
    if (activeTab === "policies") loadPolicies();
    if (activeTab === "faqs") loadFaqs();
  }, [activeTab, brandId]);

  useEffect(() => {
    if (activeTab !== "policies") return;
    const timer = window.setTimeout(() => loadPolicies(policySearch), 220);
    return () => window.clearTimeout(timer);
  }, [policySearch]);

  useEffect(() => {
    if (activeTab !== "faqs") return;
    const timer = window.setTimeout(() => loadFaqs(faqSearch), 220);
    return () => window.clearTimeout(timer);
  }, [faqSearch]);

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

  async function handleDeleteDocument(documentId) {
    setError("");
    setDeletingDocumentId(documentId);
    try {
      await api.deleteKnowledgeDocument(brandId, documentId);
      await loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingDocumentId("");
    }
  }

  function startNewPolicy() {
    setEditingPolicy(null);
    setPolicyForm(emptyPolicyForm);
    setShowPolicyForm(true);
  }

  function editPolicy(policy) {
    setEditingPolicy(policy);
    setPolicyForm({
      policyType: policy.policyType || "custom",
      title: policy.title || "",
      content: policy.content || "",
      tags: normalizeTagsForInput(policy.tags)
    });
    setShowPolicyForm(true);
  }

  function cancelPolicyForm() {
    setEditingPolicy(null);
    setPolicyForm(emptyPolicyForm);
    setShowPolicyForm(false);
  }

  async function submitPolicy(event) {
    event.preventDefault();
    setSavingPolicy(true);
    setError("");
    try {
      if (editingPolicy) {
        await api.updateKnowledgePolicy(brandId, editingPolicy.id, policyForm);
      } else {
        await api.createKnowledgePolicy(brandId, policyForm);
      }
      cancelPolicyForm();
      await loadPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPolicy(false);
    }
  }

  async function deletePolicy(policyId) {
    setDeletingPolicyId(policyId);
    setError("");
    try {
      await api.deleteKnowledgePolicy(brandId, policyId);
      await loadPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingPolicyId("");
    }
  }

  function startNewFaq() {
    setEditingFaq(null);
    setFaqForm(emptyFaqForm);
    setShowFaqForm(true);
  }

  function editFaq(faq) {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question || "",
      answer: faq.answer || "",
      tags: normalizeTagsForInput(faq.tags)
    });
    setShowFaqForm(true);
  }

  function cancelFaqForm() {
    setEditingFaq(null);
    setFaqForm(emptyFaqForm);
    setShowFaqForm(false);
  }

  async function submitFaq(event) {
    event.preventDefault();
    setSavingFaq(true);
    setError("");
    try {
      if (editingFaq) {
        await api.updateKnowledgeFaq(brandId, editingFaq.id, faqForm);
      } else {
        await api.createKnowledgeFaq(brandId, faqForm);
      }
      cancelFaqForm();
      await loadFaqs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingFaq(false);
    }
  }

  async function deleteFaq(faqId) {
    setDeletingFaqId(faqId);
    setError("");
    try {
      await api.deleteKnowledgeFaq(brandId, faqId);
      await loadFaqs();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingFaqId("");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Knowledge Brain"
        title="Knowledge Base"
        description="Manage documents, structured policies and FAQs. All knowledge stays scoped to the selected brand."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={handleUpload}
      />

      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}

      {activeTab === "documents" ? (
        <DocumentsTab
          documents={documents}
          stats={stats}
          loading={loadingDocuments}
          uploading={uploading}
          deletingId={deletingDocumentId}
          onUploadClick={() => fileRef.current?.click()}
          onDelete={handleDeleteDocument}
        />
      ) : null}

      {activeTab === "policies" ? (
        <PoliciesTab
          policies={policies}
          loading={loadingPolicies}
          saving={savingPolicy}
          deletingId={deletingPolicyId}
          search={policySearch}
          form={policyForm}
          editingPolicy={editingPolicy}
          showForm={showPolicyForm}
          onSearchChange={setPolicySearch}
          onNew={startNewPolicy}
          onEdit={editPolicy}
          onDelete={deletePolicy}
          onFormChange={(updates) => setPolicyForm((current) => ({ ...current, ...updates }))}
          onCancel={cancelPolicyForm}
          onSubmit={submitPolicy}
        />
      ) : null}

      {activeTab === "faqs" ? (
        <FaqsTab
          faqs={faqs}
          loading={loadingFaqs}
          saving={savingFaq}
          deletingId={deletingFaqId}
          search={faqSearch}
          form={faqForm}
          editingFaq={editingFaq}
          showForm={showFaqForm}
          onSearchChange={setFaqSearch}
          onNew={startNewFaq}
          onEdit={editFaq}
          onDelete={deleteFaq}
          onFormChange={(updates) => setFaqForm((current) => ({ ...current, ...updates }))}
          onCancel={cancelFaqForm}
          onSubmit={submitFaq}
        />
      ) : null}

      {activeTab === "products" ? <ProductsTab /> : null}
    </>
  );
}
