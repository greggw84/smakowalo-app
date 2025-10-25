# Kreator User Preferences Implementation

## Overview
This implementation adds user preference persistence to the Smakowało meal creator (Kreator) subscription flow, allowing users to save and automatically load their preferences for future sessions.

## Features Implemented

### 1. User Preferences API (`/api/user/preferences`)
- **GET**: Retrieves user preferences from Supabase or returns defaults
- **POST**: Saves user preferences to Supabase with localStorage fallback
- **Authentication**: Requires authenticated session via NextAuth
- **Fallback**: Automatically falls back to localStorage when Supabase is not configured

### 2. UI Reordering in Subscription Step 2
The subscription flow Step 2 now displays sections in the following order:
1. **Liczba osób i dni w tygodniu** (Number of people and days) - MOVED TO TOP
2. **Preferencje dietetyczne** (Dietary preferences - max 3)
3. **Alergie i nietolerancje** (Allergies and intolerances)

This reordering ensures users make basic selections (people/days) before choosing detailed preferences.

### 3. Preference Persistence
- Preferences are automatically saved when the user clicks "Dalej" (Next) in Step 2
- Saved preferences include:
  - `numberOfPeople`: 2, 3, or 4
  - `numberOfDays`: 2, 3, 4, or 5
  - `selectedDiets`: Array of up to 3 diet IDs
  - `selectedAllergies`: Array of allergen strings (Polish format)

### 4. Automatic Preference Loading
- On component mount (when session is available), preferences are automatically loaded
- Loading order: Supabase → localStorage → defaults
- Only loads in subscription mode (one-time purchase flow remains unchanged)

### 5. Allergen-Based Filtering
- Products are filtered to exclude items containing user-selected allergens
- Filtering is case-insensitive and only applies in subscription mode
- Allergen values use Polish format to match product data:
  - `gluten`, `mleko`, `orzechy`, `soja`, `jaja`, `ryby`, `skorupiaki`, `sezam`

## Files Modified

### `/src/app/kreator/page.tsx`
- Added `allergens?: string[]` to Product interface
- Added useEffect to load preferences on mount
- Added `savePreferences()` function to persist preferences
- Updated `getFilteredProducts()` to filter by allergens
- Reordered Step 2 UI sections
- Updated "Dalej" button to save preferences before advancing
- Fixed allergen option IDs to match Polish product data

### `/src/app/api/user/preferences/route.ts` (NEW)
- Created GET handler to retrieve preferences
- Created POST handler to save preferences
- Implements Supabase integration with localStorage fallback
- Returns appropriate status codes (200, 401, 500)

### `/supabase/migrations/create_user_preferences_table.sql` (NEW)
- SQL migration to create `user_preferences` table
- Includes email as primary key
- Uses JSONB column for preferences
- Includes timestamp and trigger for updated_at

## Database Schema

### user_preferences Table
```sql
CREATE TABLE user_preferences (
  email TEXT PRIMARY KEY,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Preferences JSON Structure
```json
{
  "numberOfPeople": 2,
  "numberOfDays": 3,
  "selectedDiets": [1, 3],
  "selectedAllergies": ["gluten", "mleko"]
}
```

## Environment Variables Required

For Supabase integration:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If these are not configured, the system automatically falls back to localStorage.

## Testing

### With Supabase Configured
1. Log in as a user
2. Navigate to Kreator → Subscription
3. Select preferences in Step 2 (people, days, diets, allergens)
4. Click "Dalej" to advance to Step 3
5. Refresh the page
6. **Expected**: Preferences should be restored from Supabase

### Without Supabase (localStorage fallback)
1. Ensure Supabase env vars are not set or invalid
2. Follow steps 1-5 above
3. **Expected**: Preferences should be restored from localStorage
4. Check browser console for localStorage fallback messages

### Allergen Filtering
1. In subscription Step 2, select allergens (e.g., "Mleko/Laktoza")
2. Advance to Step 3
3. **Expected**: Products containing milk/lactose should be excluded from the list
4. Check console logs for filtering messages

## Backward Compatibility

- **One-time purchase flow**: Completely unchanged, no preferences loaded/saved
- **Existing users**: Will see default preferences until they make selections
- **No Supabase**: System gracefully degrades to localStorage
- **Missing table**: API catches errors and returns defaults

## Implementation Notes

1. **Allergen IDs**: Use Polish format matching product data (e.g., `mleko` not `lactose`)
2. **Mode isolation**: Preferences only load/save in subscription mode
3. **Session dependency**: Preferences loading waits for session to be available
4. **Error handling**: All API calls include try-catch with fallbacks
5. **Logging**: Console logs help debug preference loading/saving flow

## Future Enhancements

- Add preference editing in user panel
- Allow users to reset preferences to defaults
- Add preference history/versioning
- Implement preference sharing between family members
- Add analytics for most common preference combinations
