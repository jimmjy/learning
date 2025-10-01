# Campaign Dashboard View (After Clicking from List)

## Full Dashboard Layout

```
┌────────────────────────────────────────────────────────────────┐
│  🎯 Campaign Dashboard            [Red Campaign ▼]        [←]  │ ← NAVBAR
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Red Campaign Performance                                      │
│  Last updated: 3 seconds ago ⟳                                │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ Total           │  │ Total           │  │ Total         │ │
│  │ Impressions     │  │ Clicks          │  │ Users         │ │
│  │                 │  │                 │  │               │ │
│  │    1,234        │  │      567        │  │     890       │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ Total CTR       │  │ Current         │  │               │ │
│  │ (Click-through) │  │ Iteration       │  │               │ │
│  │                 │  │                 │  │               │ │
│  │    46.0%        │  │      #12        │  │               │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ Recent          │  │ Recent          │  │ Recent        │ │
│  │ Impressions     │  │ Clicks          │  │ Users         │ │
│  │                 │  │                 │  │               │ │
│  │      42         │  │      19         │  │     23        │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                                │
│  ┌─────────────────┐                                          │
│  │ Recent CTR      │                                          │
│  │                 │                                          │
│  │                 │                                          │
│  │    45.2%        │                                          │
│  └─────────────────┘                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Tile Breakdown (9 tiles total as per requirements)

### Row 1: Cumulative Totals
```
┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐
│ Total           │  │ Total           │  │ Total         │
│ Impressions     │  │ Clicks          │  │ Users         │
│                 │  │                 │  │               │
│    1,234        │  │      567        │  │     890       │
│                 │  │                 │  │               │
│ Sum of all      │  │ Sum of all      │  │ Sum of all    │
│ fetches         │  │ fetches         │  │ fetches       │
└─────────────────┘  └─────────────────┘  └───────────────┘
```

### Row 2: Calculated Metrics & Status
```
┌─────────────────┐  ┌─────────────────┐
│ Total CTR       │  │ Current         │
│                 │  │ Number          │
│    46.0%        │  │                 │
│                 │  │      #12        │
│ (Total Clicks   │  │                 │
│  / Total        │  │ Iteration count │
│  Impressions)   │  │ of API calls    │
│  × 100          │  │                 │
└─────────────────┘  └─────────────────┘
```

### Row 3: Latest Data Point
```
┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐
│ Recent          │  │ Recent          │  │ Recent        │
│ Impressions     │  │ Clicks          │  │ Users         │
│                 │  │                 │  │               │
│      42         │  │      19         │  │     23        │
│                 │  │                 │  │               │
│ From last fetch │  │ From last fetch │  │ From last     │
│ (5 sec ago)     │  │ (5 sec ago)     │  │ fetch         │
└─────────────────┘  └─────────────────┘  └───────────────┘

┌─────────────────┐
│ Recent CTR      │
│                 │
│    45.2%        │
│                 │
│ (Recent Clicks  │
│  / Recent       │
│  Impressions)   │
│  × 100          │
└─────────────────┘
```

## Key Features

### 1. Auto-Update Timer
- Shows "Last updated: X seconds ago"
- Updates every 5 seconds automatically
- Visual indicator (spinning icon ⟳) when fetching

### 2. Navbar Features
- Campaign name displayed prominently
- Dropdown to switch campaigns (updates URL)
- Back arrow (←) to return to campaign list

### 3. Data Flow Example

**On Page Load (URL: /campaign/1)**
```
1. Fetch /api/campaigns/1?number=0
   Response: { impressions: 40, clicks: 20, users: 30 }
   
   Display:
   - Total Impressions: 40
   - Total Clicks: 20
   - Total Users: 30
   - Total CTR: 50.0%
   - Current Number: 0
   - Recent Impressions: 40
   - Recent Clicks: 20
   - Recent Users: 30
   - Recent CTR: 50.0%

2. After 5 seconds, fetch /api/campaigns/1?number=1
   Response: { impressions: 35, clicks: 15, users: 25 }
   
   Display:
   - Total Impressions: 75 (40 + 35)
   - Total Clicks: 35 (20 + 15)
   - Total Users: 55 (30 + 25)
   - Total CTR: 46.7% (35/75 × 100)
   - Current Number: 1
   - Recent Impressions: 35 (latest only)
   - Recent Clicks: 15 (latest only)
   - Recent Users: 25 (latest only)
   - Recent CTR: 42.9% (15/35 × 100)

3. Continues every 5 seconds, incrementing number...
```

## Visual States

### Loading State (Initial)
```
┌─────────────────┐
│ Total           │
│ Impressions     │
│                 │
│   Loading...    │
└─────────────────┘
```

### Active State (Updating)
```
┌─────────────────┐
│ Total           │
│ Impressions     │
│                 │
│    1,234  ⟳     │ ← Spinner during fetch
└─────────────────┘
```

### Error State (If API fails)
```
┌─────────────────┐
│ Total           │
│ Impressions     │
│                 │
│    Error ⚠️      │
└─────────────────┘
```

## Responsive Considerations

**Desktop (3 columns)**
```
[Tile] [Tile] [Tile]
[Tile] [Tile]
[Tile] [Tile] [Tile]
[Tile]
```

**Tablet (2 columns)**
```
[Tile] [Tile]
[Tile] [Tile]
[Tile] [Tile]
[Tile] [Tile]
[Tile]
```

**Mobile (1 column)**
```
[Tile]
[Tile]
[Tile]
[Tile]
[Tile]
[Tile]
[Tile]
[Tile]
[Tile]
```

## Styling Tips

### Tile Design
- Clean white/light background
- Subtle shadow for depth
- Clear hierarchy: Label on top, big number in middle
- Consistent padding/spacing
- Hover effect (optional)

### Color Coding (Optional but Nice)
- **Total metrics** → Blue theme
- **Current Number** → Purple/neutral
- **Recent metrics** → Green theme (for "fresh data")
- **CTR metrics** → Orange/accent color

### Typography
- **Labels**: Small, uppercase, gray
- **Numbers**: Large, bold, dark
- **Units/Context**: Small, gray, below number

This gives you a professional, data-focused dashboard that updates in real-time! 

Want to start building this?
