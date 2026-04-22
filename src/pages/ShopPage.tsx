import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { products, categories, getProductsByCategory } from "@/data/products";

const SITE_URL = "https://tide-shop-clone.lovable.app";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(initialCat);

  const filtered = getProductsByCategory(activeCategory);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Ride The Tide — ${activeCategory === "All" ? "All Products" : activeCategory}`,
    description:
      "Research-grade peptide kits, guides, and bundles including Retatrutide, Tirzepatide, BPC-157, Tesamorelin, and GHK-Cu.",
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.name,
    })),
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, ...(activeCategory !== "All" ? [{ label: activeCategory }] : [])]} />
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Shop All Products</h1>
        <p className="mt-2 text-muted-foreground">Browse our full catalog of research-grade peptide kits, guides, and bundles.</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          No products found in this category.
        </div>
      )}
    </div>
    </>
  );
}
