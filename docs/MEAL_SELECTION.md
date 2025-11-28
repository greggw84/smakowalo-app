# Subscription Management - Wybór Dań (Meal Selection)

This document describes the meal selection flow for subscription users in the Smakowało app.

## Overview

Subscription users can choose their own meals for each delivery week, with the system automatically selecting meals based on their preferences if they don't make a choice before the deadline.

## Key Features

### 1. Meal Selection Page (`/panel/select-meals`)

Users can access the meal selection page from their subscription dashboard. This page allows them to:

- **View available meals** for the current week's menu
- **Filter meals by diet type** (vegetarian, keto, etc.)
- **See allergen warnings** - meals containing user's allergens are clearly marked and disabled
- **See diet matching indicators** - meals matching user's diet preferences are highlighted
- **Select the required number of meals** based on their subscription plan (e.g., 2 people × 3 days = 6 meals)

### 2. Deadline System (48-Hour Cutoff)

The meal selection has a deadline of **48 hours before delivery**:

- **Before deadline**: Users can select and modify their meal choices
- **After deadline**: Selection is locked, showing a locked state with user's saved choices
- **No selection made**: System automatically assigns meals based on user's dietary preferences and allergies

Deadline calculations are handled in `/src/lib/subscription-utils.ts`:
- `calculateDeadline(deliveryDate)` - Returns the deadline timestamp
- `isDeadlinePassed(deliveryDate)` - Checks if selection is still allowed
- `getDeadlineTextForDelivery(deliveryDate)` - Returns formatted deadline text for display

### 3. Allergen & Diet Filtering

User preferences are enforced throughout the meal selection:

- **Allergens**: Products containing user's allergens are:
  - Visually marked with a red warning badge
  - Shown as disabled/greyed out
  - Cannot be selected

- **Diets**: Products matching user's diet preferences are:
  - Highlighted with a green "Pasuje do diety" badge
  - Can be filtered to show only matching items

### 4. Calendar Export

Users can add delivery dates to their calendar:

- **Google Calendar** - Opens Google Calendar with event details
- **Outlook** - Opens Outlook web calendar
- **ICS Download** - Downloads a .ics file for Apple Calendar, etc.

Implementation in `/src/lib/calendar-utils.ts`:
- `generateICSFile(event)` - Creates ICS file content
- `downloadICSFile(event)` - Triggers download
- `generateGoogleCalendarUrl(event)` - Creates Google Calendar URL
- `generateOutlookCalendarUrl(event)` - Creates Outlook Calendar URL

## User Flow

```
1. User navigates to /panel (Subscription Dashboard)
   ↓
2. Clicks "Chcę sam wybrać dania" button
   ↓
3. Views available meals with filters for diet/allergens
   ↓
4. Selects required number of meals (based on plan)
   ↓
5. Saves selection (before deadline)
   ↓
6. Selection confirmed, can modify until deadline
```

## Database Schema

### Tables Used

- `subscriptions` - User subscription details (people, days, diets, allergies)
- `weekly_menus` - Available weekly menu definitions
- `weekly_menu_items` - Products in each weekly menu
- `subscription_weekly_orders` - User's meal selections per week
- `subscription_weekly_order_items` - Individual meal selections
- `products` - Meal/product details including allergens and category

### Key Fields

**subscriptions:**
- `people` - Number of people in subscription
- `days` - Number of days/meals per week
- `diets` - Array of diet preferences
- `allergies` - Array of allergens to avoid
- `delivery_day` - 'tuesday' or 'thursday'

**subscription_weekly_orders:**
- `user_id` - Owner of the selection
- `weekly_menu_id` - Which week's menu
- `delivery_date` - When this will be delivered
- `is_auto_generated` - Whether system auto-selected meals
- `total_meals` - Count of meals in order

## API Endpoints

### GET `/api/menu/weekly/current`
Returns the current active weekly menu with all available products.

### GET `/api/subscription/weekly-order`
Returns the user's current weekly order (if any).

### POST `/api/subscription/weekly-order`
Saves the user's meal selection for the week.

**Request body:**
```json
{
  "weekly_menu_id": "uuid",
  "selected_product_ids": [1, 2, 3, 4, 5, 6],
  "delivery_day": "tuesday"
}
```

## Polish UI Labels

- "Chcę sam wybrać dania" - I want to choose my own meals
- "Wybór dań zamknięty" - Meal selection closed
- "Termin wyboru" - Selection deadline
- "Zawiera alergeny" - Contains allergens
- "Pasuje do diety" - Matches diet
- "Dodaj do kalendarza" - Add to calendar
- "Brak menu tygodniowego" - No weekly menu available

## Configuration

### Constants in `/src/lib/subscription-utils.ts`

```typescript
// Hours before delivery to close selection (48 hours = 2 days)
DEADLINE_HOURS_BEFORE_DELIVERY = 48
```

### Diet Types

Available diet filters (defined in select-meals page):
- Wszystkie (All)
- Wysokobiałkowa (High protein)
- Niskokaloryczna (Low calorie)
- Keto
- Wegetariańska (Vegetarian)
- Wegańska (Vegan)
- Niskowęglowodanowa (Low carb)
- Pescetariańska (Pescatarian)

### Common Allergens

- Gluten
- Mleko/Laktoza (Milk/Lactose)
- Orzechy (Nuts)
- Soja (Soy)
- Jaja (Eggs)
- Ryby (Fish)
- Skorupiaki (Shellfish)
- Sezam (Sesame)

## Testing

E2E tests are available in `/tests/e2e/subscription-panel.spec.ts` covering:
- Date formatting utilities
- Deadline calculations
- Subscription status badge states
- Diet preference display
- People/days display formatting

## Future Enhancements

- [ ] Multiple selections per product (e.g., select same meal twice)
- [ ] Meal swapping within selected items
- [ ] Nutritional totals calculation
- [ ] Email reminder before deadline
- [ ] Mobile-optimized meal selection
