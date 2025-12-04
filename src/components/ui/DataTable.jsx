import PropTypes from 'prop-types';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import Pagination from './Pagination';

/**
 * DataTable - Reusable data table component with sorting, actions, and pagination
 * 
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {Array} [props.actions] - Action button configurations
 * @param {Object} [props.pagination] - Pagination config
 * @param {string} [props.emptyMessage] - Message when no data
 * @param {Object} [props.footer] - Footer content for summary row
 */
export default function DataTable({
  columns,
  data,
  actions,
  pagination,
  emptyMessage = 'No data available',
  footer
}) {
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="font-medium border-b border-neutral-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-2.5 ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.label}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-2.5">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-2.5 ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.render ? col.render(row[col.key], row) : (
                        col.key === 'status' ? <StatusBadge status={row[col.key]} /> : row[col.key]
                      )}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {actions.map((action, actionIdx) => (
                          <ActionButton
                            key={actionIdx}
                            icon={action.icon}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            variant={action.variant}
                            tooltip={action.tooltip}
                          />
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {footer && data.length > 0 && (
            <tfoot className="border-t border-neutral-300 bg-[#FAFAFA]">
              <tr>
                {columns.map((col, idx) => (
                  <td key={col.key} className={`px-4 py-3 font-semibold ${col.align === 'right' ? 'text-right' : ''}`}>
                    {footer[col.key] || (idx === 0 ? '' : '')}
                  </td>
                ))}
                {actions && actions.length > 0 && <td className="px-4 py-3"></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      align: PropTypes.oneOf(['left', 'right']),
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['default', 'danger', 'success']),
      tooltip: PropTypes.string,
    })
  ),
  onRowClick: PropTypes.func,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }),
  emptyMessage: PropTypes.string,
  footer: PropTypes.object,
};
