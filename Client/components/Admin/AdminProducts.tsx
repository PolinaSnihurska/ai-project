'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CubeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import ProductModal from './ProductModal';
import {
  API_BASE,
  generateSku,
  getProductStatus,
  ModalMode,
  Product,
  ProductFormData,
} from './types';

const ITEMS_PER_PAGE = 10;

const EMPTY_FORM: ProductFormData = {
  title: '',
  price: '',
  category: '',
  status: 'Active',
};

/** Build Authorization headers using the JWT stored at sign-in. */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/** Map form status to review_count for persistence via existing API fields. */
function statusToReviewCount(status: ProductFormData['status'], existing?: number): number {
  if (status === 'Out of Stock') return 0;
  return existing && existing > 0 ? existing : 1;
}

/** Build the full request body expected by the Express admin routes. */
function buildApiBody(form: ProductFormData, existing?: Product) {
  const price = parseFloat(form.price);
  const review_count = statusToReviewCount(form.status, existing?.review_count);

  return {
    title: form.title.trim(),
    category: form.category,
    maincategory: existing?.maincategory || form.category,
    price,
    discount: existing?.discount ?? price,
    stars: existing?.stars ?? 4.5,
    image: existing?.image || 'https://via.placeholder.com/300',
    link: existing?.link || '#',
    review_count,
  };
}

const StatusBadge = ({ status }: { status: ReturnType<typeof getProductStatus> }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
      status === 'Active'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700'
    }`}
  >
    {status}
  </span>
);

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Fetch all products from the admin API. */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load products');
      }

      setProducts(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Derived stats for summary cards and header badge
  const totalProducts = products.length;
  const activeCount = useMemo(
    () => products.filter((p) => getProductStatus(p) === 'Active').length,
    [products],
  );
  const outOfStockCount = totalProducts - activeCount;

  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const openAddModal = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      price: String(product.price),
      category: product.category,
      status: getProductStatus(product),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData(EMPTY_FORM);
  };

  const handleFormChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** Create or update a product, then refresh the list. */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const body = buildApiBody(formData, selectedProduct ?? undefined);
      const url =
        modalMode === 'add'
          ? `${API_BASE}/products/add`
          : `${API_BASE}/products/update/${selectedProduct!.productid}`;

      const res = await fetch(url, {
        method: modalMode === 'add' ? 'POST' : 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save product');
      }

      closeModal();
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Delete a product by id, then refresh the list. */
  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products/delete/${product.productid}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product');
      }

      // Adjust page if we deleted the last item on the current page
      const newTotal = products.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / ITEMS_PER_PAGE));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <main className="mx-auto max-w-[1400px] space-y-6">
          {/* Mobile brand bar */}
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <CubeIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">StoreAdmin</p>
              <p className="text-xs text-slate-500">Products</p>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Product List</h1>
              <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-medium text-slate-600">
                {totalProducts} items
              </span>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Product
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Product table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-4 font-semibold text-slate-600">Product</th>
                    <th className="px-5 py-4 font-semibold text-slate-600">Price</th>
                    <th className="px-5 py-4 font-semibold text-slate-600">Category</th>
                    <th className="px-5 py-4 font-semibold text-slate-600">Status</th>
                    <th className="px-5 py-4 font-semibold text-slate-600">Payment order</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        Loading products…
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        No products found. Add your first product to get started.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => {
                      const status = getProductStatus(product);
                      return (
                        <tr
                          key={product.productid}
                          className="border-b border-slate-50 transition hover:bg-slate-50/50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                <CubeIcon className="h-5 w-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{product.title}</p>
                                <p className="text-xs text-slate-400">{generateSku(product)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-700">
                            $ {Number(product.price).toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-blue-600">{product.category}</span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(product)}
                                aria-label={`Edit ${product.title}`}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                aria-label={`Delete ${product.title}`}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer / pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {paginatedProducts.length} of {totalProducts} products
              </p>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard color="blue" value={totalProducts} label="Total Products" />
            <StatCard color="green" value={activeCount} label="Active Listings" />
            <StatCard color="orange" value={outOfStockCount} label="Out of Stock" />
          </div>
      </main>

      <ProductModal
        isOpen={isModalOpen}
        mode={modalMode}
        formData={formData}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

/** Summary stat card shown below the table. */
const StatCard = ({
  color,
  value,
  label,
}: {
  color: 'blue' | 'green' | 'orange';
  value: number;
  label: string;
}) => {
  const dotColor = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-500',
    orange: 'bg-amber-500',
  }[color];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`h-10 w-10 shrink-0 rounded-full ${dotColor}`} />
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
};

export default AdminProducts;
