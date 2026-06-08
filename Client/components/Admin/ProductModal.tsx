'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  CATEGORY_OPTIONS,
  ModalMode,
  ProductFormData,
  STATUS_OPTIONS,
} from './types';

interface ProductModalProps {
  isOpen: boolean;
  mode: ModalMode;
  formData: ProductFormData;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (field: keyof ProductFormData, value: string) => void;
  onSubmit: () => void;
}

const ProductModal = ({
  isOpen,
  mode,
  formData,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: ProductModalProps) => {
  if (!isOpen) return null;

  const title = mode === 'add' ? 'Add New Product' : 'Edit Product';
  const submitLabel = mode === 'add' ? 'Add Product' : 'Save Changes';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="product-modal-title" className="text-xl font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="product-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              required
              placeholder='e.g. MacBook Pro 16"'
              value={formData.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="product-price" className="mb-1.5 block text-sm font-medium text-slate-700">
              Price (USD)
            </label>
            <input
              id="product-price"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="e.g. 2499"
              value={formData.price}
              onChange={(e) => onChange('price', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <div className="relative">
              <select
                id="product-category"
                required
                value={formData.category}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>
                  Select category
                </option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="product-status" className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <div className="relative">
              <select
                id="product-status"
                required
                value={formData.status}
                onChange={(e) => onChange('status', e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
