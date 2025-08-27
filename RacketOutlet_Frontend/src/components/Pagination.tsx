// src/components/Pagination.tsx
import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect?: (page: number) => void;
};

const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onPageSelect,
}) => {
  // Create a compact page list: 1 ... current-1, current, current+1 ... total
  const pages: (number | string)[] = [];
  const push = (v: number | string) => pages.push(v);

  const addRange = (start: number, end: number) => {
    for (let i = start; i <= end; i++) push(i);
  };

  if (totalPages <= 7) {
    addRange(1, totalPages);
  } else {
    addRange(1, 2); // 1,2
    if (currentPage > 4) push("...");
    addRange(Math.max(3, currentPage - 1), Math.min(totalPages - 2, currentPage + 1));
    if (currentPage < totalPages - 3) push("...");
    addRange(totalPages - 1, totalPages); // n-1, n
  }

  return (
    <div className="flex items-center gap-2 mt-6">
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded-xl border disabled:opacity-50"
      >
        Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={`${p}-${idx}`}
              onClick={() => onPageSelect?.(p)}
              className={`px-3 py-1 rounded-xl border ${
                p === currentPage ? "font-semibold shadow" : ""
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={`sep-${idx}`} className="px-2 select-none">
              {p}
            </span>
          )
        )}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded-xl border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
