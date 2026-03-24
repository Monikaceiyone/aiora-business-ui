export interface StatusInfo {
  name: string;
  icon: string;
  color: string;
}

export const STATUS_GROUPS = {
  pending: [0, 1],
  processing: [2],
  in_transit: [3, 4],
  delivered: [5],
  failed: [6, 7, 8, 9],
};

const STATUS_MAP: Record<number | string, StatusInfo> = {
  0: { name: 'New', icon: '🆕', color: 'gray' },
  1: { name: 'Payment Pending', icon: '⏳', color: 'yellow' },
  2: { name: 'Processing', icon: '📦', color: 'purple' },
  3: { name: 'Shipped', icon: '🚚', color: 'blue' },
  4: { name: 'Out for Delivery', icon: '🛵', color: 'blue' },
  5: { name: 'Delivered', icon: '✅', color: 'green' },
  6: { name: 'Failed', icon: '❌', color: 'red' },
  7: { name: 'RTO', icon: '↩️', color: 'red' },
  8: { name: 'Exception', icon: '⚠️', color: 'orange' },
  9: { name: 'Cancelled', icon: '🚫', color: 'gray' },
};

export function getStatusInfo(statusCode: number | string): StatusInfo {
  const code = typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;
  return STATUS_MAP[code] ?? { name: String(statusCode), icon: '❓', color: 'gray' };
}

export function getStatusBadgeClasses(statusCode: number | string): string {
  const info = getStatusInfo(statusCode);
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return colorMap[info.color] ?? colorMap.gray;
}
