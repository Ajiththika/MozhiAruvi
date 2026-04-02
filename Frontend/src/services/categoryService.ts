import { api } from "@/lib/api";

export interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    orderIndex?: number;
}

export async function getCategories(): Promise<Category[]> {
    const res = await api.get<{ categories: Category[] }>("/categories");
    return res.data.categories;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
    const res = await api.post<{ category: Category }>("/categories", data);
    return res.data.category;
}

export async function deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
}

