/**
 * Props interface for TenantListItemActions component.
 */
interface ActionColors {
  primary: string;
  secondary: string;
  error: string;
  textSecondary: string;
}

export interface TenantListItemActionsProps {
  itemID: string;
  title: string;
  colors: ActionColors;
  viewLabel: string;
  editLabel: string;
  deleteLabel: string;
  activateLabel: string;
  previewLabel: string;
  openExternalLabel: string;
  qrCodeLabel: string;
  embedLabel: string;
  viewHint: string;
  editHint: string;
  deleteHint: string;
  activateHint: string;
  previewHint: string;
  openExternalHint: string;
  openExternalDisabledHint: string;
  qrCodeHint: string;
  qrCodeDisabledHint: string;
  embedHint: string;
  embedDisabledHint: string;
  shouldShowView: boolean;
  shouldShowActivate: boolean;
  shouldShowPreview: boolean;
  shouldShowOpenExternal: boolean;
  shouldShowQrCode: boolean;
  shouldShowEmbed: boolean;
  isCurrentlyActive: boolean;
  rawStatus?: boolean | number;
  viewButtonTestID?: string;
  editButtonTestID?: string;
  deleteButtonTestID?: string;
  activateToggleTestID?: string;
  previewButtonTestID?: string;
  openExternalButtonTestID?: string;
  qrCodeButtonTestID?: string;
  embedButtonTestID?: string;
  onView?: (id: string) => void;
  onEdit: (id: string, name?: string) => void;
  onDelete: (id: string) => void;
  onActivate?: (id: string, current?: boolean | number) => void;
  onPreview?: (id: string) => void;
  onOpenExternal?: (id: string) => void;
  onQrCode?: (id: string) => void;
  onEmbed?: (id: string) => void;
}
