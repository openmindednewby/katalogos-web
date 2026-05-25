export interface TopMenuDto {
  menuId: string;
  menuName: string;
  scanCount: number;
}

export interface TenantAnalyticsSummary {
  totalMenus: number;
  activeMenus: number;
  totalQrScans: number;
  scansToday: number;
  topMenusByScans: TopMenuDto[];
}

export interface ScansByDayEntry {
  date: string;
  count: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

export interface ItemViewEntry {
  itemId: string;
  itemName: string;
  viewCount: number;
}

export interface PopularItemEntry {
  itemId: string;
  itemName: string;
  categoryName: string;
  viewCount: number;
  clickCount: number;
}

export interface PopularItemsResponse {
  items: PopularItemEntry[];
  period: string;
}

export interface MenuAnalyticsDetail {
  menuId: string;
  menuName: string;
  totalViews: number;
  uniqueVisitors: number;
  avgViewDuration: number;
  viewsByDay: ScansByDayEntry[];
  deviceBreakdown: DeviceBreakdown[];
  topItems: ItemViewEntry[];
}
