import { useState, useMemo } from 'react';

export const usePagination = (itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setTotalItems,
    handlePageChange,
  };
};