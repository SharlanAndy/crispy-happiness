import PropTypes from 'prop-types';

/**
 * MonthlyBonusTable - Reusable table for displaying monthly bonus information
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of member bonus data
 * @param {Object} props.totals - Object with totalDistributed, totalClaim, totalUnclaim
 * @param {string} [props.emptyMessage] - Message to show when no data
 */
export default function MonthlyBonusTable({ data, totals, emptyMessage = 'No data available' }) {
  const hasData = data && data.length > 0;
  
  const formatTotal = (value) => 
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' U';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="font-medium border-b border-neutral-200">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Bonus Distributed</th>
            <th className="px-4 py-3">Bonus Claim</th>
            <th className="px-4 py-3">Bonus Unclaim</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {hasData ? (
            data.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-3">{row.member}</td>
                <td className="px-4 py-3">{row.distributed}</td>
                <td className="px-4 py-3">{row.claim}</td>
                <td className="px-4 py-3">{row.unclaim}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-6 py-8 text-center text-muted-foreground" colSpan={4}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
        {hasData && totals && (
          <tfoot className="border-t-2 border-neutral-300 bg-[#FAFAFA]">
            <tr className="font-bold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3">{formatTotal(totals.totalDistributed)}</td>
              <td className="px-4 py-3">{formatTotal(totals.totalClaim)}</td>
              <td className="px-4 py-3">{formatTotal(totals.totalUnclaim)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

MonthlyBonusTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      member: PropTypes.string.isRequired,
      distributed: PropTypes.string.isRequired,
      claim: PropTypes.string.isRequired,
      unclaim: PropTypes.string.isRequired,
    })
  ).isRequired,
  totals: PropTypes.shape({
    totalDistributed: PropTypes.number.isRequired,
    totalClaim: PropTypes.number.isRequired,
    totalUnclaim: PropTypes.number.isRequired,
  }),
  emptyMessage: PropTypes.string,
};
