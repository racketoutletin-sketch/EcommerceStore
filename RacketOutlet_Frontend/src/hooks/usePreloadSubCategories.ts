// hooks/usePreloadSubCategories.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubCategoriesByCategory } from "../redux/features/subcategory/subcategorySlice";
import { setReady } from "../redux/features/preload/preloadSlice";
import api from "../api/axios";
import type { AppDispatch, RootState } from "../redux/store";

const CACHE_KEY = "subcategories_cache";
const CACHE_TIMESTAMP_KEY = "subcategories_cache_ts";
// TTL in milliseconds (24 hours)
const CACHE_TTL = 1 * 60 * 60 * 1000;

export default function usePreloadSubCategories() {
  const dispatch = useDispatch<AppDispatch>();
  const preloadReady = useSelector((state: RootState) => state.preload.ready);

  useEffect(() => {
    const preload = async () => {
      try {
        // 1️⃣ Load cached data
        const cachedDataRaw = localStorage.getItem(CACHE_KEY);
        const cachedTsRaw = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        let cachedData: Record<number, any> = {};
        let cacheValid = false;

        if (cachedDataRaw && cachedTsRaw) {
          const ts = Number(cachedTsRaw);
          if (Date.now() - ts < CACHE_TTL) {
            cachedData = JSON.parse(cachedDataRaw);
            cacheValid = true;
          }
        }

        // 2️⃣ Restore cache into Redux
        if (cacheValid) {
          Object.entries(cachedData).forEach(([catId, subcats]) => {
            dispatch(
              fetchSubCategoriesByCategory.fulfilled(
                { categoryId: Number(catId), results: subcats },
                "", // action.meta.arg
                Number(catId)
              )
            );
          });
        }

        // 3️⃣ Fetch featured categories
        const res = await api.get("/api/categories/featured/");
        const categoryIds: number[] = res.data.results.map((cat: any) => cat.id);

        // 4️⃣ Fetch subcategories only if not in cache or stale
        await Promise.all(
          categoryIds.map(async (id) => {
            if (!cachedData[id] || !cacheValid) {
              const result = await dispatch(fetchSubCategoriesByCategory(id)).unwrap();
              cachedData[id] = result.results;
            }
          })
        );

        // 5️⃣ Update cache + timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

        // 6️⃣ Mark preload ready
        dispatch(setReady(true));
      } catch (err) {
        console.error("Failed to preload subcategories", err);
        dispatch(setReady(true));
      }
    };

    if (!preloadReady) preload();
  }, [dispatch, preloadReady]);

  return preloadReady;
}
