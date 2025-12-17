"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type Prod = {
  id: string;
  sku: string;
  asin?: string | null;
  marketplace?: string | null;
  title: string;
  fulfillmentType: string;
  status: string;
  costPrice?: number | null;
  sellPrice?: number | null;
  currency?: string | null;
  stockQty?: number | null;
  reorderLevel?: number | null;
  notes?: string | null;
};

export default function AmazonProductsTable({ initialProducts }: { initialProducts: Prod[] }) {
  const [products, setProducts] = useState<Prod[]>(initialProducts ?? []);

  const create = async () => {
    const sku = window.prompt("SKU:");
    if (!sku) return;
    const title = window.prompt("Title:", "") || "";
    const fulfillmentType = window.prompt("Fulfillment (FBA or FBM):", "FBA") || "FBA";
    try {
      const res = await fetch("/api/admin/business/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, title, fulfillmentType }),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      setProducts((p) => [data.data, ...p]);
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/business/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const edit = async (prod: Prod) => {
    const title = window.prompt("Title:", prod.title) || prod.title;
    try {
      const res = await fetch(`/api/admin/business/products/${prod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setProducts((p) => p.map((x) => (x.id === prod.id ? data.data : x)));
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={create}>New product</Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full table-auto">
          <thead className="bg-muted text-left text-sm text-muted-foreground">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">ASIN</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Marketplace</th>
              <th className="px-3 py-2">Fulfillment</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.sku}</td>
                <td className="px-3 py-2">{p.asin ?? "—"}</td>
                <td className="px-3 py-2">{p.title}</td>
                <td className="px-3 py-2">{p.marketplace ?? "—"}</td>
                <td className="px-3 py-2">{p.fulfillmentType}</td>
                <td className="px-3 py-2">{p.status}</td>
                <td className="px-3 py-2">{p.stockQty ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => edit(p)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
