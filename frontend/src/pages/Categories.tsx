import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Wallet, FolderTree, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/reusable_parts/ConfirmDialog";
import { useCategories } from "../hooks/useCategories";
import { getIconElement, getCategoryColor, availableIcons } from "../lib/icons";
import { PageHeader } from "../components/reusable_parts/PageHeader";
import { Card, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/reusable_parts/EmptyState";
import { ListSkeleton } from "../components/reusable_parts/LoadingSkeleton";
import { useToast } from "../components/reusable_parts/Toast";
import type { CategoryDto, CreateCategoryRequest } from "../types";

const Categories: React.FC = () => {
  const {
    categories,
    incomeCategories,
    expenseCategories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCategories();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [form, setForm] = useState<CreateCategoryRequest>({
    name: "",
    type: "expense",
    icon: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);

  const reset = () => {
    setForm({ name: "", type: "expense", icon: "", description: "" });
    setEditing(null);
    setError("");
  };

  const handleEdit = (c: CategoryDto) => {
    setEditing(c);
    setForm({
      name: c.name,
      type: c.type,
      icon: c.icon || "",
      description: c.description || "",
    });
    setShowForm(true);
  };

  const handleDeleteClick = (c: CategoryDto) => {
    if (c.expenseCount > 0) {
      showToast("error", `"${c.name}" has ${c.expenseCount} transactions`);
      return;
    }
    setDeleteTarget(c);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      showToast("error", "Category deleted");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    try {
      if (editing) await updateCategory({ id: editing.id, data: form });
      else await createCategory(form);
      showToast("success", editing ? "Category updated!" : "Category created!");
      setShowForm(false);
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const sections = [
    {
      title: "Income",
      icon: Wallet,
      items: incomeCategories,
      color: "income" as const,
      border: "border-income-200",
      bg: "bg-income-50",
      text: "text-income-500",
      badge: "bg-income-50 text-income-600",
    },
    {
      title: "Expenses",
      icon: FolderTree,
      items: expenseCategories,
      color: "expense" as const,
      border: "border-expense-200",
      bg: "bg-expense-50",
      text: "text-expense-500",
      badge: "bg-expense-50 text-expense-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Categories" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <ListSkeleton rows={3} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
      >
        <Button
          variant="accent"
          size="sm"
          onClick={() => {
            reset();
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sections.map((s, si) => (
          <Card key={s.title} delay={si * 0.1}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.text}`} />
                </div>
                <CardTitle>{s.title}</CardTitle>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.badge}`}
              >
                {s.items.length}
              </span>
            </div>
            {s.items.length === 0 ? (
              <EmptyState title={`No ${s.title.toLowerCase()} categories`} />
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {s.items.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${getCategoryColor(c.type, c.icon)}`}
                        >
                          {getIconElement(c.icon, "h-4 w-4")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary-700">
                            {c.name}
                          </p>
                          <p className="text-xs text-primary-400">
                            {c.expenseCount} transaction
                            {c.expenseCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex transition-opacity opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 hover:bg-accent-50 rounded-lg"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-primary-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
                          className="p-1.5 hover:bg-expense-50 rounded-lg"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-expense-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Category Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm overflow-hidden shadow-xl bg-surface rounded-2xl"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-primary-800">
                  {editing ? "Edit" : "New"} Category
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                  className="p-1.5 rounded-lg hover:bg-primary-50"
                >
                  <X size={18} className="text-primary-400" />
                </button>
              </div>
              <form onSubmit={submit} className="px-6 pb-6 space-y-4">
                {error && (
                  <div className="p-3 text-sm border rounded-xl bg-expense-50 border-expense-100 text-expense-600">
                    {error}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">
                    Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: "income" })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${form.type === "income" ? "bg-income-500 text-white shadow-sm" : "bg-primary-100 text-primary-600 hover:bg-primary-200"}`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: "expense" })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${form.type === "expense" ? "bg-expense-500 text-white shadow-sm" : "bg-primary-100 text-primary-600 hover:bg-primary-200"}`}
                    >
                      Expense
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Groceries"
                    className="w-full px-4 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2 p-2 overflow-y-auto border border-surface-border rounded-xl max-h-36">
                    {availableIcons
                      .filter((i) => i.type === form.type)
                      .map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setForm({ ...form, icon: icon.name })}
                          className={`p-2 rounded-lg flex flex-col items-center gap-0.5 transition-all ${form.icon === icon.name ? "bg-accent-50 ring-2 ring-accent-400" : "hover:bg-primary-50"}`}
                          title={icon.label}
                        >
                          {getIconElement(icon.name, "h-4 w-4")}
                          <span className="text-[9px] text-primary-400 truncate w-full text-center">
                            {icon.label}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Brief description"
                    rows={2}
                    className="w-full px-4 py-2 text-sm transition-all border-2 resize-none rounded-xl border-surface-border focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      reset();
                    }}
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    type="submit"
                    loading={isCreating || isUpdating}
                    disabled={!form.name.trim()}
                    className="flex-1 h-11"
                  >
                    {editing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
};

export default Categories;
