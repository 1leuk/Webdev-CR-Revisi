import { Product } from "@/types/types";

// Get all products with optional limit
export async function getProducts(limit = 12) {
  try {
    const res = await fetch(`/api/products?limit=${limit}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const products = await res.json();
    return products as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Get product by ID
export async function getProductById(id: string | number) {
  try {
    const res = await fetch(`/api/products/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const product = await res.json();
    return product as Product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

// Get products by category
export async function getProductsByCategory(categoryName: string, limit = 12) {
  try {
    const res = await fetch(
      `/api/products?category=${encodeURIComponent(categoryName)}&limit=${limit}`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const products = await res.json();
    return products as Product[];
  } catch (error) {
    console.error(
      `Error fetching products for category ${categoryName}:`,
      error
    );
    return [];
  }
}

// Get all categories
export async function getCategories() {
  try {
    const res = await fetch("/api/categories", {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const categories = await res.json();
    return categories as string[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}