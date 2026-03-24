import { supabase } from './client';

export interface DashboardData {
  seller: {
    seller_id: string;
    seller_name: string;
    business_type: string;
    city: string;
  } | null;
  stats: {
    total_orders: number;
    total_revenue: number;
    payment_pending: number;
    in_transit: number;
    delivered: number;
    processing: number;
    rto: number;
    exceptions: number;
    cancelled: number;
    total_products: number;
    total_categories: number;
  };
  recent_orders: any[];
  charts: {
    status_distribution: { name: string; value: number; color: string }[];
    orders_by_date: { date: string; orders: number; revenue: number }[];
    top_products: { name: string; orders: number }[];
  };
}

export async function getSellerDashboard(sellerId: string): Promise<DashboardData> {
  const [sellerRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from('sellers').select('*').eq('seller_id', sellerId).single(),
    supabase.from('orders').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }),
    supabase.from('products').select('product_id').eq('seller_id', sellerId),
    supabase.from('categories').select('category_id').eq('seller_id', sellerId),
  ]);

  const orders = ordersRes.data || [];
  const seller = sellerRes.data || null;

  // Compute stats
  const stats = {
    total_orders: orders.length,
    total_revenue: orders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0),
    payment_pending: orders.filter((o: any) => (o.status_code ?? 0) < 2).length,
    in_transit: orders.filter((o: any) => [3, 4].includes(o.status_code)).length,
    delivered: orders.filter((o: any) => o.status_code === 5).length,
    processing: orders.filter((o: any) => o.status_code === 2).length,
    rto: orders.filter((o: any) => o.status_code === 7).length,
    exceptions: orders.filter((o: any) => o.status_code === 8).length,
    cancelled: orders.filter((o: any) => o.status_code === 9).length,
    total_products: productsRes.data?.length || 0,
    total_categories: categoriesRes.data?.length || 0,
  };

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Pending', value: stats.payment_pending, color: '#f59e0b' },
    { name: 'Processing', value: stats.processing, color: '#6366f1' },
    { name: 'In Transit', value: stats.in_transit, color: '#3b82f6' },
    { name: 'Delivered', value: stats.delivered, color: '#22c55e' },
    { name: 'RTO', value: stats.rto, color: '#ef4444' },
    { name: 'Cancelled', value: stats.cancelled, color: '#9ca3af' },
  ].filter(s => s.value > 0);

  // Orders by date (last 14 days)
  const dateMap: Record<string, { orders: number; revenue: number }> = {};
  orders.forEach((o: any) => {
    const date = (o.created_at || o.order_date || '').split('T')[0];
    if (!date) return;
    if (!dateMap[date]) dateMap[date] = { orders: 0, revenue: 0 };
    dateMap[date].orders += 1;
    dateMap[date].revenue += Number(o.total_amount) || 0;
  });
  const ordersByDate = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, val]) => ({ date: date.slice(5), ...val }));

  // Top products
  const productCount: Record<string, number> = {};
  orders.forEach((o: any) => {
    const name = o.product_name || o.product_id || 'Unknown';
    productCount[name] = (productCount[name] || 0) + 1;
  });
  const topProducts = Object.entries(productCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, orders]) => ({ name, orders }));

  return {
    seller,
    stats,
    recent_orders: orders.slice(0, 50),
    charts: {
      status_distribution: statusDistribution,
      orders_by_date: ordersByDate,
      top_products: topProducts,
    },
  };
}
