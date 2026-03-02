"use client";

import { useRouter } from "next/navigation";

export default function Pagination({ page, pageCount }) {
  const router = useRouter();

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage);
    router.push(`?${params.toString()}`);
  };

  if (pageCount <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <div className="join border-2 border-black rounded-none">
        <button 
          className="join-item btn btn-sm bg-white text-black font-black hover:bg-gray-100 disabled:bg-gray-50 border-0"
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          « PREV
        </button>
        <button className="join-item btn btn-sm bg-black text-white font-black hover:bg-black border-0 cursor-default">
          HALAMAN {page} DARI {pageCount}
        </button>
        <button 
          className="join-item btn btn-sm bg-white text-black font-black hover:bg-gray-100 disabled:bg-gray-50 border-0"
          disabled={page >= pageCount}
          onClick={() => handlePageChange(page + 1)}
        >
          NEXT »
        </button>
      </div>
    </div>
  );
}
