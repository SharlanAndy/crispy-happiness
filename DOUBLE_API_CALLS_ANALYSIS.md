# Double API Calls Analysis

## Root Causes Identified

### 1. **React StrictMode (Primary Cause in Development)**
- **Location**: `src/main.jsx` line 7
- **Impact**: In development mode, React StrictMode intentionally double-invokes effects, state updaters, and other functions to help detect side effects. This is **expected behavior** and only happens in development.
- **Solution**: This is intentional and helps catch bugs. In production builds, StrictMode doesn't cause double calls.

### 2. **Missing Request Cancellation (Race Conditions)**
- **Issue**: None of the `useEffect` hooks use `AbortController` to cancel in-flight requests when:
  - Component unmounts
  - Dependencies change before previous request completes
- **Affected Files**:
  - `src/pages/system-admin/UserManagement.jsx`
  - `src/pages/system-admin/AgentManagement.jsx`
  - `src/pages/admin/UserDetails.jsx`
  - `src/pages/system-admin/AgentDetails.jsx`
  - `src/pages/system-admin/MerchantManagement.jsx`
  - And many others...

### 3. **Problematic Dependencies in useEffect**
- **File**: `src/pages/admin/UserDetails.jsx` line 94
- **Issue**: `useEffect` for transactions depends on `userData`, causing re-fetch when userData changes, even though `userData` is already checked inside the effect.
- **Fix**: Remove `userData` from dependencies and only check it inside the effect.

### 4. **Multiple useEffects Fetching Same Data**
- **File**: `src/pages/system-admin/UserManagement.jsx`
- **Issue**: Two separate `useEffect` hooks both fetch from the same endpoint (one for stats, one for list), which can cause duplicate calls.

## Fixes Applied

### ✅ Fixed Files

1. **`src/pages/admin/UserDetails.jsx`**
   - Added `AbortController` to both `useEffect` hooks (user details and transactions)
   - Added cleanup functions to cancel in-flight requests
   - Prevents race conditions when component unmounts or dependencies change

2. **`src/pages/system-admin/AgentDetails.jsx`**
   - Added `AbortController` to agent details fetch
   - Added cleanup function

3. **`src/pages/system-admin/AgentManagement.jsx`**
   - Added `AbortController` to agents list fetch
   - Added cleanup function

## Recommendations

1. **For Development**: The double calls from StrictMode are expected and help catch bugs. They won't occur in production. The `AbortController` pattern helps prevent race conditions even with StrictMode.

2. **For Production**: The `AbortController` pattern will prevent race conditions when:
   - Component unmounts before request completes
   - Dependencies change and trigger a new request before previous completes
   - User navigates away quickly

3. **Remaining Work**: Apply the same `AbortController` pattern to other files:
   - `src/pages/system-admin/UserManagement.jsx`
   - `src/pages/system-admin/MerchantManagement.jsx`
   - `src/pages/system-admin/Dashboard.jsx`
   - `src/pages/t3-admin/Dashboard.jsx`
   - And other pages with API calls

4. **Note**: The `AbortController` pattern requires passing the signal through the API layer. Currently, the `api.request` function doesn't support AbortController signals. For full support, you would need to:
   - Modify `api.request` to accept an `AbortSignal` option
   - Pass the signal to the `fetch` call
   - This is a more advanced improvement for the future

## Pattern to Apply

```javascript
useEffect(() => {
  const abortController = new AbortController();
  
  const fetchData = async () => {
    try {
      const result = await api.someMethod();
      if (abortController.signal.aborted) return;
      // Handle result
    } catch (error) {
      if (error.name === 'AbortError') return;
      // Handle error
    }
  };
  
  fetchData();
  
  return () => {
    abortController.abort();
  };
}, [dependencies]);
```

