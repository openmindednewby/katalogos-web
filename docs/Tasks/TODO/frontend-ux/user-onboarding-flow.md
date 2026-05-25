# User Onboarding Flow

> **Status**: TODO
> **Priority**: P3 - User Experience & Retention
> **Estimated Scope**: Medium (Frontend)
> **Estimated Effort**: 1-2 weeks

---

## 1. Problem

New users land on an empty dashboard with no guidance. No welcome wizard, no feature tour, no checklist. Users must discover features on their own, leading to poor activation and early churn.

---

## 2. Solution

### 2.1 Onboarding Checklist (Persistent)

Show a progress checklist on the dashboard for new tenants:

| Step | Action | Completion Trigger |
|------|--------|-------------------|
| 1. Create your first menu | Click "Create Menu" | Menu entity created |
| 2. Add categories & items | Add at least 1 category with 1 item | Category + item exist |
| 3. Customize your menu style | Visit styling tab | Style saved |
| 4. Upload your logo | Upload content via ContentService | Logo uploaded |
| 5. Publish your menu | Click "Publish" | Menu status = Published |
| 6. Share your public link | Copy public menu URL | Link copied/viewed |
| 7. Invite a team member | Send user invitation | Invitation sent |

### 2.2 Welcome Modal (First Login)

Brief welcome screen after first login:
- "Welcome to [App Name]!"
- 3-step visual guide (Create > Customize > Publish)
- "Get Started" button → first checklist item
- "Skip" option (dismisses but checklist remains)

### 2.3 Feature Tooltips (Contextual)

On first visit to each major screen, show a tooltip highlighting key actions:
- Menus: "Click + to create your first menu"
- Styling: "Customize colors, fonts, and layout"
- Notifications: "You'll see real-time updates here"

---

## 3. State Management

### 3.1 Backend

Add to IdentityService or a dedicated endpoint:
```
GET /api/users/me/onboarding      → { completedSteps: string[], dismissed: boolean }
PUT /api/users/me/onboarding      → Update completed steps
```

### 3.2 Frontend

- Store onboarding state in React Query cache (from API)
- Track completed steps
- Show/hide checklist based on completion + dismissal
- Animate step completion

---

## 4. Implementation Steps

### Phase 1: Checklist Component (3-4 days)
1. Create `OnboardingChecklist` component
2. Create onboarding API endpoints in IdentityService
3. Add checklist to dashboard/home page
4. Track step completion via API calls
5. Add dismiss/minimize functionality

### Phase 2: Welcome Modal (2-3 days)
1. Create `WelcomeModal` component
2. Show on first login (check onboarding state)
3. Add visual guide with illustrations
4. Link "Get Started" to first incomplete step

### Phase 3: Feature Tooltips (2-3 days)
1. Create `FeatureTooltip` component
2. Add tooltips to key screens (menus, styling, notifications)
3. Track tooltip dismissal in onboarding state
4. Only show on first visit to each screen

---

## 5. Verification

- [ ] Checklist visible on first login
- [ ] Steps complete when actions are performed
- [ ] Checklist can be dismissed
- [ ] Welcome modal shown only on first login
- [ ] Tooltips shown only on first screen visit
- [ ] Onboarding state persists across sessions
- [ ] Completed onboarding hides checklist permanently
