import {
  MessageSquare, Users, Phone, IndianRupee, Package, Zap,
  ChevronRight, ArrowUpRight, ArrowDownRight, Star, TrendingUp,
  Activity, Bot, CheckCircle2, Clock, AlertCircle
} from "lucide-react";

const stats = [
  { label: "Total Orders", value: "2,847", change: "+12.5%", up: true, icon: Package, bg: "bg-blue-50", iconColor: "text-blue-600" },
  { label: "Revenue", value: "₹18.4L", change: "+8.2%", up: true, icon: IndianRupee, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "Active Customers", value: "1,293", change: "+5.1%", up: true, icon: Users, bg: "bg-violet-50", iconColor: "text-violet-600" },
  { label: "AI Calls Handled", value: "4,610", change: "+22.3%", up: true, icon: Phone, bg: "bg-orange-50", iconColor: "text-orange-600" },
  { label: "WhatsApp Messages", value: "9,182", change: "-2.4%", up: false, icon: MessageSquare, bg: "bg-pink-50", iconColor: "text-pink-600" },
  { label: "AI Automation Rate", value: "87%", change: "+3.7%", up: true, icon: Zap, bg: "bg-cyan-50", iconColor: "text-cyan-600" },
];

const orders = [
  { name: "Priya Sharma", product: "Banarasi Saree", status: "Delivered", amount: "₹4,200", date: "31 Mar 2026" },
  { name: "Rahul Mehta", product: "Gold Necklace", status: "Processing", amount: "₹28,500", date: "30 Mar 2026" },
  { name: "Anita Patel", product: "Silk Dupatta", status: "Pending", amount: "₹1,800", date: "30 Mar 2026" },
  { name: "Vikram Singh", product: "Diamond Ring", status: "Delivered", amount: "₹65,000", date: "29 Mar 2026" },
  { name: "Meena Joshi", product: "Cotton Saree Set", status: "Cancelled", amount: "₹3,400", date: "28 Mar 2026" },
];

const statusConfig = {
  Delivered: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  Processing: { color: "bg-blue-100 text-blue-700", icon: Clock },
  Pending: { color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  Cancelled: { color: "bg-red-100 text-red-700", icon: AlertCircle },
};

const aiInsights = [
  { label: "Calls auto-resolved", value: "87%", tag: "Voice AI", tagColor: "bg-blue-100 text-blue-700" },
  { label: "WhatsApp orders closed", value: "63%", tag: "ORA Agent", tagColor: "bg-violet-100 text-violet-700" },
  { label: "Avg. call duration", value: "2m 14s", tag: "VOIT", tagColor: "bg-cyan-100 text-cyan-700" },
  { label: "Reminders sent today", value: "142", tag: "Automation", tagColor: "bg-emerald-100 text-emerald-700" },
];

const chartBars = [65, 80, 55, 90, 70, 85, 60, 95, 75, 88, 72, 92];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const growthPoints = [30, 45, 38, 60, 55, 72, 68, 85, 78, 90, 88, 95];

export default function UIDashboard() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">

      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 p-5 sm:p-7 shadow-xl shadow-blue-200">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 right-24 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-4 right-48 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                🚀 AI-Powered Platform
              </span>
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-1">Welcome to AIORA Dashboard</h2>
            <p className="text-blue-100 text-sm max-w-md">
              Your AI voice agent handled 87% of calls automatically today. Your business runs even when you don't.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button className="bg-white text-blue-700 text-sm font-semibold px-4 sm:px-5 py-2 rounded-xl hover:bg-blue-50 transition shadow">
                View AI Reports
              </button>
              <button className="border border-white/30 text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-xl hover:bg-white/10 transition backdrop-blur-sm">
                Configure VOIT
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center border border-white/20 flex-1 sm:flex-none">
              <p className="text-white/70 text-xs mb-1">Today's Calls</p>
              <p className="text-white text-xl sm:text-2xl font-bold">248</p>
              <p className="text-emerald-300 text-xs flex items-center justify-center gap-1 mt-1">
                <TrendingUp size={11} /> +18%
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center border border-white/20 flex-1 sm:flex-none">
              <p className="text-white/70 text-xs mb-1">WA Messages</p>
              <p className="text-white text-xl sm:text-2xl font-bold">1.2K</p>
              <p className="text-emerald-300 text-xs flex items-center justify-center gap-1 mt-1">
                <TrendingUp size={11} /> +9%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid — 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {stats.map(({ label, value, change, up, icon: Icon, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${bg} flex items-center justify-center mb-2 sm:mb-3`}>
              <Icon size={16} className={iconColor} />
            </div>
            <p className="text-slate-800 text-lg sm:text-xl font-bold leading-none mb-1">{value}</p>
            <p className="text-slate-500 text-xs mb-2 leading-tight">{label}</p>
            <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row — stacked on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-slate-800 font-semibold text-sm sm:text-base">Sales Overview</h3>
              <p className="text-slate-400 text-xs mt-0.5">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 sm:px-3 py-1 rounded-lg">2026</span>
              <div className="flex items-center gap-1 text-emerald-600 text-xs sm:text-sm font-medium bg-emerald-50 px-2 sm:px-3 py-1 rounded-lg">
                <TrendingUp size={13} /> +24.5%
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1 sm:gap-2 h-28 sm:h-36">
            {chartBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md sm:rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer ${i === 11 ? "bg-blue-600" : "bg-blue-100"}`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-slate-400 text-[8px] sm:text-[9px] hidden sm:block">{months[i]}</span>
              </div>
            ))}
          </div>
          {/* Month labels for mobile — show abbreviated */}
          <div className="flex justify-between mt-1 sm:hidden px-0.5">
            {["J","","M","","M","","J","","S","","N",""].map((m, i) => (
              <span key={i} className="text-slate-400 text-[8px] flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-slate-800 font-semibold text-sm sm:text-base">Customer Growth</h3>
              <p className="text-slate-400 text-xs mt-0.5">New customers / month</p>
            </div>
            <Activity size={16} className="text-violet-500" />
          </div>
          <div className="relative h-28 sm:h-36">
            <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M ${growthPoints.map((p, i) => `${(i / 11) * 200},${100 - p}`).join(" L ")}`} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M 0,100 L ${growthPoints.map((p, i) => `${(i / 11) * 200},${100 - p}`).join(" L ")} L 200,100 Z`} fill="url(#lineGrad)" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
              {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m) => (
                <span key={m} className="text-slate-400 text-[8px] sm:text-[9px]">{m}</span>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-slate-800 text-lg sm:text-xl font-bold">1,293</p>
              <p className="text-slate-400 text-xs">Total active</p>
            </div>
            <div className="text-emerald-600 text-xs sm:text-sm font-medium flex items-center gap-1 bg-emerald-50 px-2 sm:px-3 py-1 rounded-lg">
              <ArrowUpRight size={13} /> +5.1%
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row — stacked on mobile/tablet, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-4">

        {/* Orders — card layout on mobile, table on sm+ */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-50">
            <div>
              <h3 className="text-slate-800 font-semibold text-sm sm:text-base">Recent Orders</h3>
              <p className="text-slate-400 text-xs mt-0.5">Latest transactions</p>
            </div>
            <button className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center gap-1 transition">
              View all <ChevronRight size={13} />
            </button>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-slate-50">
            {orders.map((order, i) => {
              const { color, icon: StatusIcon } = statusConfig[order.status];
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {order.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-700 text-sm font-medium truncate">{order.name}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md mt-0.5 ${color}`}>
                        <StatusIcon size={10} /> {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-slate-700 text-sm font-semibold">{order.amount}</p>
                    <p className="text-slate-400 text-xs">{order.date}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="text-left text-xs text-slate-400 font-medium px-6 py-3">Customer</th>
                <th className="text-left text-xs text-slate-400 font-medium px-3 py-3">Status</th>
                <th className="text-left text-xs text-slate-400 font-medium px-3 py-3">Amount</th>
                <th className="text-left text-xs text-slate-400 font-medium px-3 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const { color, icon: StatusIcon } = statusConfig[order.status];
                return (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {order.name[0]}
                        </div>
                        <div>
                          <p className="text-slate-700 text-sm font-medium">{order.name}</p>
                          <p className="text-slate-400 text-xs">{order.product}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${color}`}>
                        <StatusIcon size={11} /> {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 text-sm font-semibold">{order.amount}</td>
                    <td className="px-3 py-3.5 text-slate-400 text-xs">{order.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="text-slate-800 font-semibold text-sm sm:text-base">AI Insights</h3>
              <p className="text-slate-400 text-xs mt-0.5">Automation performance</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Bot size={17} className="text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-3 sm:p-4 mb-4 border border-blue-100/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-xs font-medium">Overall Automation Score</p>
              <Star size={13} className="text-amber-400 fill-amber-400" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-slate-800 text-3xl font-bold">87</p>
              <p className="text-slate-400 text-sm mb-1">/100</p>
            </div>
            <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
              <div className="h-full w-[87%] bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {aiInsights.map(({ label, value, tag, tagColor }) => (
              <div key={label} className="flex items-center justify-between py-2 sm:py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <p className="text-slate-600 text-xs sm:text-sm truncate">{label}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                  <span className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-md ${tagColor}`}>{tag}</span>
                  <p className="text-slate-800 text-xs sm:text-sm font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            <Zap size={14} /> View Full AI Report
          </button>
        </div>
      </div>

    </div>
  );
}
