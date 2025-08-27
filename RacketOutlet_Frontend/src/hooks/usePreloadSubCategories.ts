// hooks/usePreloadSubCategories.ts
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchSubCategoriesByCategory } from "../redux/features/subcategory/subcategorySlice";
import api from "../api/axios";
import type { AppDispatch } from "../redux/store";

export default function usePreloadSubCategories() {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const preload = async () => {
      try {
        const res = await api.get("/api/categories/featured/");
        const categoryIds: number[] = res.data.results.map((cat: any) => cat.id);

        await Promise.all(
          categoryIds.map((id) => dispatch(fetchSubCategoriesByCategory(id)))
        );

        setLoading(false);
      } catch (err) {
        console.error("Failed to preload subcategories", err);
        setLoading(false);
      }
    };

    preload();
  }, [dispatch]);

  return loading;
}
