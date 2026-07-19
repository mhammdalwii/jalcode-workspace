import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalItems, startIndex, endIndex, onPageChange }: PaginationProps) {
  // Jika tidak ada data, sembunyikan pagination
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 rounded-b-xl shadow-sm mb-24">
      <p className="text-sm text-gray-500">
        Menampilkan <span className="font-semibold text-gray-900">{startIndex + 1}</span> hingga <span className="font-semibold text-gray-900">{Math.min(endIndex, totalItems)}</span> dari total{" "}
        <span className="font-semibold text-gray-900">{totalItems}</span> data
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Indikator Angka Halaman Dinamis */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${currentPage === pageNum ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
