import PropTypes from 'prop-types';
import { Card, SearchBar, DataTable } from './index';

/**
 * BonusListCard - Reusable card component for bonus list with search, tier filter, and table
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.searchPlaceholder - Placeholder text for search bar
 * @param {string} props.searchValue - Current search value
 * @param {Function} props.onSearchChange - Search change handler
 * @param {Array} props.tiers - Array of tier options
 * @param {string} props.activeTier - Currently selected tier
 * @param {Function} props.onTierChange - Tier change handler
 * @param {Array} props.columns - Table columns configuration
 * @param {Array} props.data - Table data
 * @param {Array} props.actions - Table actions
 * @param {Object} props.pagination - Pagination configuration
 */
export default function BonusListCard({
  title,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  tiers,
  activeTier,
  onTierChange,
  columns,
  data,
  actions,
  pagination,
}) {
  return (
    <Card title={title}>
      <div className="flex flex-col gap-6">
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
          className="max-w-sm"
        />
        <div className="flex gap-2 bg-[#ECECF0] rounded-full px-2 py-1.5">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => onTierChange(tier)}
              className={`py-1.5 text-lg rounded-full flex-1 transition-colors ${
                activeTier === tier ? 'bg-white text-black' : 'hover:bg-white/50'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
        <DataTable
          columns={columns}
          data={data}
          actions={actions}
          pagination={pagination}
        />
      </div>
    </Card>
  );
}

BonusListCard.propTypes = {
  title: PropTypes.string.isRequired,
  searchPlaceholder: PropTypes.string.isRequired,
  searchValue: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  tiers: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTier: PropTypes.string.isRequired,
  onTierChange: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  actions: PropTypes.array,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }),
};
