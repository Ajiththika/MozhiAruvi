"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, Loader2, Trash2, X, AlertCircle, LayoutGrid, Tag, AlignLeft, ArrowUpDown,
  ChevronUp, ChevronDown
} from "lucide-react";
import { getCategories, createCategory, deleteCategory, updateCategory, Category } from "@/services/categoryService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", description: "", orderIndex: 0 });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit logic
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", description: "", orderIndex: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getCategories();
      // Sort by orderIndex first, then name
      const sorted = [...data].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.name.localeCompare(b.name));
      setCategories(sorted);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await createCategory({
        ...formData,
        orderIndex: Number(formData.orderIndex)
      });
      await fetchData(); // Refresh and re-sort
      setFormData({ name: "", description: "", orderIndex: 0 });
      setShowCreate(false);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(cat: Category) {
    setEditingId(cat._id);
    setEditFormData({
      name: cat.name,
      description: cat.description || "",
      orderIndex: cat.orderIndex || 0
    });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      await updateCategory(editingId, {
        ...editFormData,
        orderIndex: Number(editFormData.orderIndex)
      });
      await fetchData();
      setEditingId(null);
    } catch (e: any) {
      alert("Failed to update category");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will not delete lessons but will detach them from this category.")) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch {
      alert("Failed to delete category.");
    }
  }

  const inputCls = "w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:font-medium placeholder:text-primary/40";
  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1.5 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in pb-20 max-w-6xl mx-auto px-4 lg:px-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-10 rounded-full bg-primary/20" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Taxonomy Manager</span>
          </div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Categories</h1>
          <p className="text-primary/70 font-medium mt-1">Organize your lessons by topic and difficulty.</p>
        </div>
        <Button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          size="xl"
          className="rounded-2xl px-10 shadow-xl shadow-primary/20"
        >
          <Plus className="h-5 w-5 mr-3" /> New Topic
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card variant="elevated" padding="xl" className="border-primary/10 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800">Create Topic</h3>
            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-primary/60" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Category Name</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    required
                    className={inputCls + " pl-12"}
                    placeholder="e.g. Alphabets"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Order Index</label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    type="number"
                    className={inputCls + " pl-12"}
                    placeholder="0"
                    value={formData.orderIndex}
                    onChange={e => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-5 w-4 h-4 text-primary/40" />
                <textarea
                  className={inputCls + " pl-12 min-h-[100px]"}
                  placeholder="What will students learn here?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-primary/60">
                Cancel
              </button>
              <Button type="submit" isLoading={submitting} size="lg" className="px-12 rounded-2xl">
                Register Category
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Loading taxonomy...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {categories.map(cat => (
             <Card 
               key={cat._id} 
               variant="elevated" 
               className="border-slate-100 group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer relative"
               onClick={() => openEdit(cat)}
             >
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <LayoutGrid className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 uppercase">{cat.name}</h3>
                <p className="text-sm font-medium text-primary/70 leading-relaxed mb-6">
                   {cat.description || "No specialized description provided."}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Seq Index: {cat.orderIndex}</span>
                    <span className="text-[8px] font-black text-primary/30 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity underline decoration-primary/20">Manage Details</span>
                </div>
             </Card>
          ))}

          {categories.length === 0 && !showCreate && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
               <Tag className="w-16 h-16 text-slate-100 mx-auto mb-4" />
               <p className="text-primary/60 font-bold">The learning path is currently empty.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-primary/10 max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800">Modify Category</h3>
              <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-primary/60" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Name</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                      className={inputCls + " pl-12"}
                      placeholder="e.g. Alphabets"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Sequence index</label>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                      type="number"
                      className={inputCls + " pl-12"}
                      placeholder="0"
                      value={editFormData.orderIndex}
                      onChange={e => setEditFormData({ ...editFormData, orderIndex: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Summary</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-5 w-4 h-4 text-primary/40" />
                  <textarea
                    className={inputCls + " pl-12 min-h-[100px]"}
                    placeholder="Briefly describe what this category covers."
                    value={editFormData.description}
                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button 
                  type="button" 
                  onClick={() => { if (editingId) handleDelete(editingId); setEditingId(null); }} 
                  className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  Delete Topic
                </button>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditingId(null)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-primary/60">
                    Cancel
                  </button>
                  <Button type="submit" isLoading={submitting} size="lg" className="px-12 rounded-2xl">
                    Update taxonomy
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}









