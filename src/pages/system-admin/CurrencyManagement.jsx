import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { PageHeader, DataTable, ConfirmDialog, Pagination } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const ITEMS_PER_PAGE = 10;

// Simple map of country name to flag for display purposes
const FLAG_MAP = {
  Malaysia: '🇲🇾',
  Singapore: '🇸🇬',
  Indonesia: '🇮🇩',
  Vietnam: '🇻🇳',
  Thailand: '🇹🇭',
  Philippines: '🇵🇭',
  Brunei: '🇧🇳',
};

export default function CurrencyManagement() {
  const navigate = useNavigate();
  const { handleApiResponse, showError } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const columns = [
    {
      key: 'currencies',
      label: 'Currencies',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{row.flag || '🌐'}</span>
          <span>{row.country} - {row.code}</span>
        </div>
      ),
    },
    {
      key: 'rate',
      label: 'Rate',
      render: (value) => `${value.toLocaleString()} : 1`,
    },
    { key: 'updatedAt', label: 'Update On' },
    { key: 'status', label: 'Status' },
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/system-admin/currency/${row.id}/view`),
      tooltip: 'View',
    },
    {
      icon: <Settings size={16} />,
      onClick: (row) => navigate(`/system-admin/currency/${row.id}/edit`),
      tooltip: 'Edit',
    },
    {
      icon: <Trash2 size={16} />,
      onClick: (row) => setDeleteDialog({ open: true, id: row.id }),
      variant: 'danger',
      tooltip: 'Delete',
    },
  ];

  // Fetch currencies from API
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const result = await api.systemadmin.getCurrencies({ page: currentPage });
        if (result && result.success && Array.isArray(result.data)) {
          const transformed = result.data.map((c) => ({
            id: c.id,
            country: c.country_name || 'N/A',
            code: c.currency_code || '',
            flag: FLAG_MAP[c.country_name] || '🌐',
            rate: c.rate || 0,
            updatedAt: c.updated_at
              ? new Date(c.updated_at).toLocaleString('en-GB')
              : '',
            status: (c.status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive',
          }));
          setCurrencies(transformed);

          // Derive total pages from API metadata (prefer total_count/limit)
          const totalCount = result.total_count ?? result.total ?? transformed.length;
          const limit = result.limit ?? ITEMS_PER_PAGE;
          const pages =
            limit && limit > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;
          setTotalPages(pages);
        } else {
          setCurrencies([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch currencies:', error);
        showError(error?.message || 'Failed to fetch currencies. Please try again.');
        setCurrencies([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [currentPage, showError]);

  const { data: paginatedData } = useMemo(
    () => filterAndPaginate(currencies, '', [], 1, ITEMS_PER_PAGE),
    [currencies]
  );

  const handleDelete = async () => {
    const id = deleteDialog.id;
    if (!id) {
      setDeleteDialog({ open: false, id: null });
      return;
    }

    try {
      const result = await api.systemadmin.deleteCurrency(id);

      handleApiResponse(result, {
        successMessage: result?.message || 'Currency deleted successfully!',
        errorMessage: result?.message || 'Failed to delete currency. Please try again.',
      });

      if (result && result.success) {
        setCurrencies((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete currency:', error);
      showError(error?.message || 'Failed to delete currency. Please try again.');
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Currencies Setting"
          description="Oversee currency management for various regions, ensuring accurate conversion rates to USD"
        />

        {/* New Currency Button */}
        <div className="flex">
          <button
            onClick={() => navigate('/system-admin/currency/add')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Add New Currencies Rate
          </button>
        </div>


        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Currencies List</h2>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading currencies...</p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={paginatedData}
                  actions={actions}
                  pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Currency"
        message="Are you sure you want to delete this currency? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
