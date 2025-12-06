import PropTypes from 'prop-types';

/**
 * Tabs - Reusable tab navigation component
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Tab definitions [{id, label}]
 * @param {string} props.activeTab - Currently active tab id
 * @param {Function} props.onTabChange - Tab change handler
 * @param {string} [props.variant] - Style variant: 'default' | 'pills'
 */
export default function Tabs({ tabs, activeTab, onTabChange, variant = 'default' }) {
  if (variant === 'pills') {
    return (
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${activeTab === tab.id
                ? 'bg-secondary/50'
                : 'hover:bg-secondary/50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex border-b bg-secondary/20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
              ? 'border-primary text-primary bg-background'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'pills']),
};
