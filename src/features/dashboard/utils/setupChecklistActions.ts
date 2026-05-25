import {
  CHECKLIST_MENU_SHARED_KEY,
  CHECKLIST_QR_GENERATED_KEY,
} from './setupChecklistConstants';

/** Mark the QR code generation step as completed in localStorage. */
export function markQrGenerated(): void {
  localStorage.setItem(CHECKLIST_QR_GENERATED_KEY, 'true');
}

/** Mark the menu sharing step as completed in localStorage. */
export function markMenuShared(): void {
  localStorage.setItem(CHECKLIST_MENU_SHARED_KEY, 'true');
}
