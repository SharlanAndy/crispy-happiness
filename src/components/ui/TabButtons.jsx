/**
 * Segmented control tab buttons component
 * Displays a connected group of tab buttons with rounded corners on ends
 */
export default function TabButtons({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-start overflow-clip rounded-[40px]">
      {tabs.map((tab, index) => {
        const isFirst = index === 0;
        const isLast = index === tabs.length - 1;
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              border border-[#ececec] border-solid 
              flex items-center justify-center 
              px-8 py-2 text-lg 
              transition-colors
              ${isFirst ? 'rounded-bl-[80px] rounded-tl-[80px]' : ''}
              ${isLast ? 'rounded-br-[80px] rounded-tr-[80px]' : ''}
              ${index > 0 ? 'border-l-0' : ''}
              ${isActive ? 'bg-black text-white' : 'text-[rgba(23,33,56,0.88)] hover:text-black/80'}
            `}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
