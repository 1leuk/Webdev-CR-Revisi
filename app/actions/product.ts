import { Product } from "@/types/types";

//limit
export async function getProducts(limit = 12) {
  try {
    const res = await fetch(`https://fakestoreapi.com/products?limit=${limit}`);

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

//per produk ID
export async function getProductById(id: string | number) {
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);

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

// per kategori
export async function getProductsByCategory(categoryName: string, limit = 12) {
  try {
    const res = await fetch(
      `https://fakestoreapi.com/products/category/${categoryName}`
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

// semua kategori
export async function getCategories() {
  try {
    const res = await fetch("https://fakestoreapi.com/products/categories");

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
