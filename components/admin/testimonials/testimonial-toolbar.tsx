"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface TestimonialToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: "all" | "published" | "draft";
  onFilterChange: (value: "all" | "published" | "draft") => void;
  sort: "sortOrder" | "updatedAt";
  onSortChange: (value: "sortOrder" | "updatedAt") => void;
  direction: "asc" | "desc";
  onDirectionChange: (value: "asc" | "desc") => void;
  onAdd: () => void;
}

export function TestimonialToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  direction,
  onDirectionChange,
  onAdd,
}: TestimonialToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search names, subtitles, quotes…"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="min-w-[220px]"
      />
      <Select value={filter} onValueChange={(value) => onFilterChange(value as TestimonialToolbarProps["filter"])}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(value) => onSortChange(value as TestimonialToolbarProps["sort"])}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sortOrder">Sort order</SelectItem>
          <SelectItem value="updatedAt">Newest</SelectItem>
        </SelectContent>
      </Select>
      <Select value={direction} onValueChange={(value) => onDirectionChange(value as TestimonialToolbarProps["direction"])}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="ml-auto" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add testimonial
      </Button>
    </div>
  );
}
