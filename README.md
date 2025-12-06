# Crispy Happiness - Multi-Role Admin Dashboard

A comprehensive React-based admin dashboard application supporting multiple user roles including System Admin, T3 Admin, Merchant, and Agent with role-based access control and feature management.

## 🚀 Tech Stack

- **Frontend Framework**: React 18+ with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Linting**: ESLint

## 📁 Project Structure

```
crispy-happiness/
├── public/                          # Static assets
│   ├── 404.html                    # 404 error page
│   └── assets/                     # Public static files
│
├── src/                            # Source code
│   ├── main.jsx                    # Application entry point
│   ├── App.jsx                     # Root component with routing
│   ├── index.css                   # Global styles
│   ├── App.css                     # App-specific styles
│   │
│   ├── assets/                     # Asset files
│   │
│   ├── components/                 # Reusable components
│   │   ├── icons/                  # Custom icon components
│   │   │   ├── Admin.jsx           # Admin icon
│   │   │   ├── Agent.jsx           # Agent icon
│   │   │   ├── Bonus.jsx           # Bonus icon
│   │   │   ├── Currency.jsx        # Currency icon
│   │   │   ├── Dashboard.jsx       # Dashboard icon
│   │   │   ├── Fees.jsx            # Fees icon
│   │   │   ├── History.jsx         # History icon
│   │   │   ├── Log.jsx             # Log icon
│   │   │   ├── Manage.jsx          # Manage icon
│   │   │   ├── Merchant.jsx        # Merchant icon
│   │   │   ├── Plus.jsx            # Plus icon
│   │   │   ├── Settings.jsx        # Settings icon
│   │   │   ├── Transaction.jsx     # Transaction icon
│   │   │   └── User.jsx            # User icon
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Layout.jsx          # Base layout wrapper
│   │   │   ├── AdminLayout.jsx     # Admin-specific layout
│   │   │   ├── AgentLayout.jsx     # Agent-specific layout
│   │   │   ├── MerchantLayout.jsx  # Merchant-specific layout
│   │   │   ├── Header.jsx          # Header with context-aware title
│   │   │   └── Sidebar.jsx         # Navigation sidebar with active state
│   │   │
│   │   └── ui/                     # UI components
│   │       ├── index.js            # UI components barrel export
│   │       ├── ActionButton.jsx    # Action button for tables
│   │       ├── Button.jsx          # Primary button component
│   │       ├── Card.jsx            # Card container
│   │       ├── ConfirmDialog.jsx   # Confirmation dialog modal
│   │       ├── DataTable.jsx       # Data table with pagination
│   │       ├── EmptyState.jsx      # Empty state placeholder
│   │       ├── FormField.jsx       # Form field with label/error
│   │       ├── InfoSection.jsx     # Information display section
│   │       ├── Modal.jsx           # Base modal component
│   │       ├── PageHeader.jsx      # Page header with title/actions
│   │       ├── Pagination.jsx      # Pagination controls
│   │       ├── SearchBar.jsx       # Search input component
│   │       ├── StatCard.jsx        # Statistics card
│   │       ├── StatusBadge.jsx     # Status indicator badge
│   │       ├── Tabs.jsx            # Tab navigation component
│   │       └── VerificationModal.jsx # Security verification modal
│   │
│   ├── constant/                   # Constants and static data
│   │   └── assets.ts               # Asset paths and URLs
│   │
│   ├── lib/                        # Utility libraries
│   │   ├── api.js                  # API client and helpers
│   │   └── utils.js                # Utility functions (filterAndPaginate, etc.)
│   │
│   ├── pages/                      # Page components
│   │   ├── Login.jsx               # Login page
│   │   ├── NotFound.jsx            # 404 Not Found page
│   │   │
│   │   ├── shared/                 # Shared pages across roles
│   │   │   └── UnifiedSettings.jsx # Settings page for all roles
│   │   │
│   │   ├── system-admin/           # System Admin pages
│   │   │   ├── Dashboard.jsx       # System admin dashboard
│   │   │   ├── AgentManagement.jsx # Agent management
│   │   │   ├── AgentDetails.jsx    # Agent details page
│   │   │   ├── UserManagement.jsx  # User management
│   │   │   ├── MerchantManagement.jsx # Merchant management
│   │   │   ├── BonusManagement.jsx # Bonus management
│   │   │   ├── BonusClaimDetails.jsx # Bonus claim details
│   │   │   ├── FeesManagement.jsx  # Fees configuration
│   │   │   ├── TransactionDetails.jsx # Transaction details
│   │   │   └── SystemLogs.jsx      # System logs viewer
│   │   │
│   │   ├── t3-admin/               # T3 Admin pages
│   │   │   ├── Dashboard.jsx       # T3 admin dashboard
│   │   │   ├── WithdrawalManagement.jsx # Pending withdrawals
│   │   │   └── WithdrawalHistory.jsx # Approved/Rejected history
│   │   │
│   │   ├── admin/                  # Finance Admin pages
│   │   │   ├── AccountManagement.jsx # Finance accounts (CRUD)
│   │   │   ├── AccountDetails.jsx  # Account details page
│   │   │   ├── MerchantDetails.jsx # Merchant details page
│   │   │   ├── UserDetails.jsx     # User details page
│   │   │   ├── WithdrawalDetails.jsx # Withdrawal details (shared)
│   │   │   └── APISettings.jsx     # API configuration
│   │   │
│   │   ├── merchant/               # Merchant pages
│   │   │   ├── Dashboard.jsx       # Merchant dashboard
│   │   │   ├── TransactionHistory.jsx # Merchant transactions
│   │   │   ├── Withdraw.jsx        # Withdrawal request
│   │   │   ├── Invite.jsx          # Invite users
│   │   │   └── Settings.jsx        # Merchant settings
│   │   │
│   │   └── agent/                  # Agent pages
│   │       ├── Dashboard.jsx       # Agent dashboard
│   │       ├── TransactionHistory.jsx # Agent transactions
│   │       ├── MyTeam.jsx          # Team management
│   │       └── Settings.jsx        # Agent settings
│   │
│   ├── routes/                     # Routing configuration
│   │   └── AppRoutes.jsx           # All application routes
│   │
│   └── services/                   # API service layers
│       ├── authService.js          # Authentication services
│       ├── systemService.js        # System admin services
│       ├── t3Service.js            # T3 admin services
│       ├── merchantService.js      # Merchant services
│       └── agentService.js         # Agent services
│
├── index.html                      # HTML entry point
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint configuration
└── package.json                    # Dependencies and scripts
```

## 🗺️ Application Routes

### Public Routes
- `/login` - Login page

### System Admin Routes (`/system-admin`)
- `/system-admin` - Dashboard
- `/system-admin/agents` - Agent Management
- `/system-admin/agents/:id` - Agent Details
- `/system-admin/users` - User Management
- `/system-admin/merchants` - Merchant Management
- `/system-admin/bonus` - Bonus Management
- `/system-admin/bonus/:id` - Bonus Claim Details
- `/system-admin/fees` - Fees Management
- `/system-admin/transactions/:id` - Transaction Details
- `/system-admin/logs` - System Logs

### T3 Admin Routes (`/t3-admin`)
- `/t3-admin` - Dashboard
- `/t3-admin/merchant-details` - Merchant Details
- `/t3-admin/users` - User Management
- `/t3-admin/withdrawals` - Withdrawal Management (Pending)
- `/t3-admin/withdrawals/:id` - Withdrawal Details
- `/t3-admin/withdrawal-history` - Withdrawal History (Approved/Rejected)
- `/t3-admin/transactions` - Transaction Management
- `/t3-admin/accounts` - Account Management
- `/t3-admin/api-settings` - API Settings

### Merchant Routes (`/merchant`)
- `/merchant` - Dashboard
- `/merchant/transactions` - Transaction History
- `/merchant/withdraw` - Withdrawal Request
- `/merchant/invite` - Invite Users
- `/merchant/settings` - Settings

### Agent Routes (`/agent`)
- `/agent` - Dashboard
- `/agent/transactions` - Transaction History
- `/agent/my-team` - Team Management
- `/agent/settings` - Settings

## 🧩 Component Library

### Layout Components

#### `AdminLayout`
- Main layout wrapper for admin pages
- Features: Header, Sidebar, content area
- Context-aware title display based on navigation state
- Reads `location.state.returnPath` for breadcrumb context

#### `Sidebar`
- Navigation sidebar with role-based menu items
- Active state tracking with returnPath pattern
- Highlights correct menu based on source page
- Supports nested routes and detail pages

#### `Header`
- Top navigation bar
- Displays current page title
- User profile and logout actions

### UI Components

#### `DataTable`
- Paginated data table with actions
- Props: columns, data, actions, pagination
- Supports custom column rendering
- Integrated with ActionButton for row actions

#### `Modal`
- Base modal component with overlay
- Controlled open/close state
- Customizable title and children
- Used for create/edit forms and confirmations

#### `VerificationModal`
- Security verification modal for sensitive actions
- Fields: Login ID, Password
- Form validation: disables confirm until both fields filled
- Clears form on close/submit
- Based on Figma design (node-id: 180-7939)

#### `ConfirmDialog`
- Simple confirmation dialog
- Props: isOpen, title, message, onConfirm, onCancel
- Used for delete and reject actions

#### `Button`
- Primary button component
- Variants: primary, secondary, danger
- Supports loading state and disabled state

#### `FormField`
- Form field wrapper with label and error display
- Props: label, error, required, children
- Consistent form styling across application

#### `SearchBar`
- Search input with icon
- Real-time search functionality
- Used in list pages for filtering

#### `Pagination`
- Pagination controls
- Props: currentPage, totalPages, onPageChange
- Navigation buttons with page numbers

#### `StatusBadge`
- Status indicator with color coding
- Variants: success, warning, danger, info
- Used for displaying status in tables

#### `StatCard`
- Statistics display card
- Props: title, value, icon, trend
- Used in dashboard pages

#### `Tabs`
- Tab navigation component
- Supports active state and click handlers
- Pill-style design with rounded background

#### `ActionButton`
- Action button for table rows
- Props: icon, label, onClick, variant
- Common actions: View, Edit, Approve, Reject

#### `Card`
- Container card component
- Props: title, children, actions
- Used for content sections

#### `PageHeader`
- Page header with title and action buttons
- Props: title, actions
- Consistent header styling

#### `InfoSection`
- Information display section
- Props: title, data (key-value pairs)
- Used in details pages

#### `EmptyState`
- Empty state placeholder
- Props: message, icon
- Shown when no data available

## 🔑 Key Features

### 1. Withdrawal Management System

#### Withdrawal Management (`/t3-admin/withdrawals`)
- View all pending withdrawal applications
- Paginated table with search functionality
- Actions:
  - **View**: Navigate to details page
  - **Approve**: Opens VerificationModal requiring Login ID + Password
  - **Reject**: Opens ConfirmDialog for confirmation
- Statistics: Total Applications, Pending, Approved, Rejected
- Navigation state: Passes `returnPath: '/t3-admin/withdrawals'`

#### Withdrawal History (`/t3-admin/withdrawal-history`)
- View approved and rejected withdrawal history
- Tab filtering:
  - **Withdraw Approve**: Shows approved withdrawals
  - **Withdraw Reject**: Shows rejected withdrawals
- Dynamic column labels:
  - "Approve Time" when on Withdraw Approve tab
  - "Reject Time" when on Withdraw Reject tab
- Paginated table with search functionality
- Actions: View only (no approve/reject)
- Navigation state: Passes `fromHistory: true`, `returnPath: '/t3-admin/withdrawal-history'`, `withdrawalStatus: row.status`
- Tab button styling: Rounded pill design with gray background, white active state

#### Withdrawal Details (`/t3-admin/withdrawals/:id`)
- Shared details page for both Withdrawal Management and History
- Context-aware rendering based on navigation state:

**From Withdrawal Management:**
- Withdrawal Information: Application ID, Amount, Application Date, Status (Pending)
- Other Information: Merchant Order Number, Reference
- Action buttons: Approve (VerificationModal), Reject (ConfirmDialog)

**From Withdrawal History:**
- Withdrawal Information: Application ID, **Transaction ID**, Amount, Application Date, Status (Approved/Rejected)
- Verify By: Username, Approved/Rejected Date
- No action buttons (read-only)
- Dynamic status display: "Approved" or "Rejected" based on `withdrawalStatus`
- Dynamic date label: "Approved Date" or "Rejected Date" based on approval state

### 2. Account Management System

#### Account Management (`/t3-admin/accounts`)
- Create and edit finance accounts
- Modal reuse pattern: Single modal for both create and edit
- Modal state: `{isOpen, mode: 'create'|'edit', editingId}`
- Edit mode: Pre-fills form with existing data
- Form fields: Account Name, Login ID, Password, Role
- Password field: Different placeholder in edit mode
- Actions: Create, Edit, Activate/Deactivate

### 3. Navigation Context Pattern

#### ReturnPath Pattern
Navigation state passing for context-aware UI:

```javascript
// From source page
navigate('/details/:id', {
  state: {
    returnPath: '/source-page',
    additionalContext: value
  }
});

// In Sidebar.jsx
const returnPath = location.state?.returnPath;
const isActive = returnPath ? path === returnPath : pathname === path;

// In AdminLayout.jsx
const activePath = location.state?.returnPath || location.pathname;
const currentTitle = getTitleFromPath(activePath);
```

Benefits:
- Correct menu highlighting on detail pages
- Proper breadcrumb context
- Shared pages can render different content based on source
- Better user experience with context awareness

### 4. Security Verification

#### VerificationModal
- Two-factor verification for sensitive actions
- Required for withdrawal approvals
- Fields: Login ID (text), Password (password with show/hide)
- Form validation: Both fields required before submission
- Credentials passed to parent handler: `handleApproveWithVerification(credentials)`
- Auto-clears on submit or close

### 5. Pagination System

#### filterAndPaginate Utility
```javascript
import { filterAndPaginate } from '@/lib/utils';

const { paginatedData, totalPages } = useMemo(() => 
  filterAndPaginate(
    data,              // Full dataset
    searchTerm,        // Search query
    ['name', 'email'], // Searchable fields
    currentPage,       // Current page number
    10                 // Items per page
  ),
  [data, searchTerm, currentPage]
);
```

Features:
- Client-side filtering by multiple fields
- Automatic pagination calculation
- Returns paginated slice and total pages
- Used across all list pages for consistency

## 🎨 Design System

### Tab Button Styling (Pill Design)
```jsx
// Container
<div className="inline-flex gap-3 p-2 bg-[#ECECF0] rounded-full">
  
  {/* Active Tab */}
  <button className="px-6 py-2 rounded-full bg-white font-medium">
    Active Tab
  </button>
  
  {/* Inactive Tab */}
  <button className="px-6 py-2 rounded-full text-gray-600 font-medium">
    Inactive Tab
  </button>
</div>
```

### Color Palette
- Background: `#ECECF0` for tab containers
- Active State: `bg-white` for selected items
- Text: `text-gray-600` for inactive states
- Status Colors:
  - Success: Green
  - Warning: Yellow
  - Danger: Red
  - Info: Blue

## 🔧 Utility Functions

### filterAndPaginate
Located in `src/lib/utils.js`

```javascript
filterAndPaginate(data, searchTerm, searchKeys, currentPage, itemsPerPage)
```

**Parameters:**
- `data`: Array of objects to filter and paginate
- `searchTerm`: String to search for
- `searchKeys`: Array of object keys to search in
- `currentPage`: Current page number (1-indexed)
- `itemsPerPage`: Number of items per page

**Returns:**
```javascript
{
  paginatedData: [...], // Current page data
  totalPages: 5         // Total number of pages
}
```

## 📦 Dependencies

### Core
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `react-router-dom`: ^7.1.1

### UI & Styling
- `tailwindcss`: ^3.4.17
- `lucide-react`: ^0.469.0
- `autoprefixer`: ^10.4.20
- `postcss`: ^8.4.49

### Development
- `vite`: ^6.0.5
- `@vitejs/plugin-react`: ^4.3.4
- `eslint`: ^9.17.0
- `eslint-plugin-react`: ^7.37.2
- `eslint-plugin-react-hooks`: ^5.0.0
- `eslint-plugin-react-refresh`: ^0.4.16

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## 📝 Code Patterns

### Creating a New List Page with Pagination

```jsx
import { useState, useMemo } from 'react';
import { filterAndPaginate } from '@/lib/utils';
import { DataTable, SearchBar, PageHeader, Button } from '@/components/ui';

const ITEMS_PER_PAGE = 10;
const SEARCH_KEYS = ['name', 'email', 'id'];

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

export default function ListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { paginatedData, totalPages } = useMemo(
    () => filterAndPaginate(data, searchTerm, SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [searchTerm, currentPage]
  );

  const actions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (row) => navigate(`/details/${row.id}`),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="List Page"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        }
      />
      
      <SearchBar 
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search..."
      />

      <DataTable
        columns={COLUMNS}
        data={paginatedData}
        actions={actions}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
}
```

### Creating a Modal Form

```jsx
const [modalState, setModalState] = useState({
  isOpen: false,
  mode: 'create', // 'create' | 'edit'
  editingId: null,
});

const handleOpenCreate = () => {
  setModalState({ isOpen: true, mode: 'create', editingId: null });
};

const handleOpenEdit = (item) => {
  setModalState({ isOpen: true, mode: 'edit', editingId: item.id });
};

const handleClose = () => {
  setModalState({ isOpen: false, mode: 'create', editingId: null });
};

<Modal
  isOpen={modalState.isOpen}
  onClose={handleClose}
  title={modalState.mode === 'create' ? 'Create New' : 'Edit Item'}
>
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <Button type="submit">
      {modalState.mode === 'create' ? 'Create' : 'Save Changes'}
    </Button>
  </form>
</Modal>
```

### Navigation with Context

```jsx
// From list page
navigate(`/details/${id}`, {
  state: {
    returnPath: '/list-page',
    customData: value,
  }
});

// In details page
const location = useLocation();
const { returnPath, customData } = location.state || {};

// Back button
<Button onClick={() => navigate(returnPath || '/list-page')}>
  Back
</Button>
```

## 🧪 Testing Approach

- Manual testing for UI components
- Navigation flow testing
- Form validation testing
- Role-based access control testing
- State management verification

## 📄 License

This project is proprietary and confidential.

## 👥 Contributors

- Development Team

---

**Last Updated**: 2024
**Version**: 1.0.0
