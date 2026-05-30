import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {api , useBookingStats, useBikeRevenueReport, useIdleBikesReport, useDailyRevenueReport} from '../../hooks/useReports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line , Legend } from 'recharts';
import { Download, TrendingUp, Bike, DollarSign, Calendar, AlertTriangle , Filter , X , CheckCircle2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import * as XLSX from "xlsx"; // Import SheetJS (the package you installed)

const COLORS = ['#F97316', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6'];

// export default function Reports() {
//   const [period, setPeriod] = useState('month');
//   const [revenueDays, setRevenueDays] = useState(30);

//   // Data fetching using our MERN hooks
//   const { data: stats } = useBookingStats(period);
//   const { data: bikeRevenue } = useBikeRevenueReport(
//     startOfMonth(new Date()),
//     endOfMonth(new Date())
//   );
//   const { data: idleBikes } = useIdleBikesReport();
//   const { data: dailyRevenue } = useDailyRevenueReport(revenueDays);

//   // Prepare data for Pie Chart
//   const bookingStatusData = stats ? [
//     { name: 'Completed', value: stats.completed_bookings, color: '#22C55E' },
//     { name: 'Active', value: stats.active_bookings, color: '#3B82F6' },
//     { name: 'Pending', value: stats.pending_bookings, color: '#EAB308' },
//     { name: 'Cancelled', value: stats.cancelled_bookings, color: '#EF4444' }
//   ].filter(d => d.value > 0) : [];

//   // Prepare data for Bar Chart (MERN uses _id for bike grouping)
//   const bikeRevenueData = bikeRevenue?.slice(0, 10).map(b => ({
//     name: b.model?.substring(0, 15) || 'Unknown',
//     revenue: b.total_revenue,
//     bookings: b.total_bookings
//   })) || [];

//   const exportCSV = () => {
//     if (!bikeRevenue) return;

//     const headers = ['Bike Model', 'Number Plate', 'Total Bookings', 'Total Revenue', 'Total Hours'];
//     const rows = bikeRevenue.map(b => [
//       b.model,
//       b.number_plate,
//       b.total_bookings,
//       b.total_revenue,
//       b.total_hours?.toFixed(1)
//     ]);

//     const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `bike-revenue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-display text-gradient-sunset">Reports</h1>
//           <p className="text-muted-foreground">Business analytics and insights</p>
//         </div>

//         <div className="flex items-center gap-2">
//           <Select value={period} onValueChange={(v) => setPeriod(v)}>
//             <SelectTrigger className="w-40 bg-card">
//               <SelectValue placeholder="Select Period" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="today">Today</SelectItem>
//               <SelectItem value="week">This Week</SelectItem>
//               <SelectItem value="month">This Month</SelectItem>
//               <SelectItem value="all">All Time</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button variant="outline" onClick={exportCSV} className="border-primary/20 hover:bg-primary/10">
//             <Download className="w-4 h-4 mr-2" />
//             Export
//           </Button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {[
//           { label: 'Total Bookings', value: stats?.total_bookings, icon: Calendar, color: 'bg-blue-500/10 text-blue-500' },
//           { label: 'Revenue', value: `₹${stats?.total_revenue?.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500/10 text-green-500' },
//           { label: 'Completion Rate', value: `${stats?.total_bookings ? Math.round((stats.completed_bookings / stats.total_bookings) * 100) : 0}%`, icon: TrendingUp, color: 'bg-purple-500/10 text-purple-500' },
//           { label: 'Idle Bikes', value: idleBikes?.length, icon: AlertTriangle, color: 'bg-yellow-500/10 text-yellow-500' }
//         ].map((card, i) => (
//           <Card key={i} className="bg-card border-border">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-muted-foreground">{card.label}</p>
//                   <p className="text-3xl font-bold text-foreground">{card.value || 0}</p>
//                 </div>
//                 <div className={`p-3 rounded-full ${card.color}`}>
//                   <card.icon className="w-6 h-6" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Charts Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Revenue Trend Line Chart */}
//         <Card className="bg-card border-border">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle className="text-foreground text-lg">Revenue Trend</CardTitle>
//             <Select 
//               value={revenueDays.toString()} 
//               onValueChange={(v) => setRevenueDays(parseInt(v))}
//             >
//               <SelectTrigger className="w-32 h-8 text-xs">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="7">Last 7 days</SelectItem>
//                 <SelectItem value="14">Last 14 days</SelectItem>
//                 <SelectItem value="30">Last 30 days</SelectItem>
//               </SelectContent>
//             </Select>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={dailyRevenue || []}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
//                 <XAxis 
//                   dataKey="date" 
//                   tickFormatter={(val) => format(new Date(val), 'MMM d')}
//                   fontSize={12}
//                   stroke="hsl(var(--muted-foreground))"
//                 />
//                 <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
//                 <Tooltip 
//                   formatter={(value) => [`₹${value}`, 'Revenue']}
//                   contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
//                 />
//                 <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', r: 4 }} />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Booking Distribution Pie Chart */}
//         <Card className="bg-card border-border">
//           <CardHeader>
//             <CardTitle className="text-foreground text-lg">Booking Status Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={bookingStatusData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {bookingStatusData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Horizontal Bar Chart for Bike Revenue */}
//       <Card className="bg-card border-border">
//         <CardHeader>
//           <CardTitle className="text-foreground text-lg">Top 10 Performing Bikes (This Month)</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {bikeRevenueData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={350}>
//               <BarChart data={bikeRevenueData} layout="vertical" margin={{ left: 20 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
//                 <XAxis type="number" hide />
//                 <YAxis 
//                   dataKey="name" 
//                   type="category" 
//                   width={120} 
//                   fontSize={12} 
//                   stroke="hsl(var(--foreground))"
//                 />
//                 <Tooltip 
//                   cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
//                   formatter={(value) => [`₹${value}`, 'Revenue']}
//                 />
//                 <Bar dataKey="revenue" fill="#F97316" radius={[0, 4, 4, 0]} barSize={20} />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">
//               No revenue data available for this period
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Idle Bikes Alert List */}
//       {idleBikes && idleBikes.length > 0 && (
//         <Card className="border-yellow-500/50 bg-yellow-500/5 shadow-sm">
//           <CardHeader className="pb-2">
//             <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-lg">
//               <AlertTriangle className="w-5 h-5" />
//               Inventory Optimization: Idle Bikes (30+ Days)
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//               {idleBikes.map(bike => (
//                 <div 
//                   key={bike._id} 
//                   className="flex items-center gap-3 p-3 bg-card rounded-lg border border-yellow-500/20 shadow-sm"
//                 >
//                   <div className="p-2 bg-yellow-500/10 rounded-full">
//                     <Bike className="w-4 h-4 text-yellow-600" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-foreground">{bike.model}</p>
//                     <p className="text-xs text-muted-foreground uppercase tracking-wider">{bike.number_plate}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// export default function Reports() {
//   const [period, setPeriod] = useState("month");
//   const [revenueDays, setRevenueDays] = useState(30);

//   // Custom date range for summary stats
//   const [useCustomRange, setUseCustomRange] = useState(false);
//   const [customStartDate, setCustomStartDate] = useState("");
//   const [customEndDate, setCustomEndDate] = useState("");

//   // Date range for bike revenue table/chart
//   const [bikeRevenueStart, setBikeRevenueStart] = useState(
//     format(startOfMonth(new Date()), "yyyy-MM-dd")
//   );
//   const [bikeRevenueEnd, setBikeRevenueEnd] = useState(
//     format(endOfMonth(new Date()), "yyyy-MM-dd")
//   );

//   // Data hooks
//   const { data: stats } = useBookingStats(
//     useCustomRange ? "custom" : period,
//     useCustomRange && customStartDate ? customStartDate : null,
//     useCustomRange && customEndDate ? customEndDate : null
//   );
//   const { data: bikeRevenue } = useBikeRevenueReport(
//     new Date(bikeRevenueStart),
//     new Date(bikeRevenueEnd)
//   );
//   const { data: idleBikes } = useIdleBikesReport();
//   const { data: dailyRevenue } = useDailyRevenueReport(revenueDays);

//   // Pie chart data
//   const bookingStatusData = stats
//     ? [
//         { name: "Completed", value: stats.completed_bookings, color: "#22C55E" },
//         { name: "Active",    value: stats.active_bookings,    color: "#3B82F6" },
//         { name: "Pending",   value: stats.pending_bookings,   color: "#EAB308" },
//         { name: "Cancelled", value: stats.cancelled_bookings, color: "#EF4444" },
//       ].filter((d) => d.value > 0)
//     : [];

//   // Bar chart data (top 10)
//   const bikeRevenueData =
//     bikeRevenue?.slice(0, 10).map((b) => ({
//       name: b.model?.substring(0, 12) || "Unknown",
//       revenue: b.total_revenue,
//       bookings: b.total_bookings,
//     })) || [];

//   // CSV export with Owner Name
//   const exportCSV = () => {
//     if (!bikeRevenue) return;
//     const headers = [
//       "Bike Model", "Number Plate", "Owner Name",
//       "Total Bookings", "Total Revenue (INR)", "Total Hours",
//       "Report From", "Report To",
//     ];
//     const rows = bikeRevenue.map((b) => [
//       b.model || "",
//       b.number_plate || "",
//       b.bike_owner || "N/A",
//       b.total_bookings,
//       b.total_revenue,
//       b.total_hours?.toFixed(1) || "0",
//       bikeRevenueStart,
//       bikeRevenueEnd,
//     ]);
//     const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `report-${bikeRevenueStart}-to-${bikeRevenueEnd}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleApply = () => {
//     if (customStartDate && customEndDate) setUseCustomRange(true);
//   };

//   const handleClear = () => {
//     setUseCustomRange(false);
//     setCustomStartDate("");
//     setCustomEndDate("");
//     setPeriod("month");
//   };

//   // ── shared input class ──────────────────────────────────────────────
//   const dateInputCls =
//     "w-full h-9 rounded-md border border-border bg-background px-2 text-sm " +
//     "text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 " +
//     "[color-scheme:]";

//   return (
//     <div className="space-y-4 sm:space-y-6 pb-8">

//       {/* ── Header ───────────────────────────────────────────────────── */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-display text-gradient-sunset leading-tight">
//             Reports
//           </h1>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             Business analytics and insights
//           </p>
//         </div>

//         {/* Period selector + Export */}
//         <div className="flex items-center gap-2 flex-wrap">
//           <Select
//             value={useCustomRange ? "custom" : period}
//             onValueChange={(v) => {
//               if (v !== "custom") { handleClear(); setPeriod(v); }
//             }}
//             disabled={useCustomRange}
//           >
//             <SelectTrigger className="w-36 sm:w-40 bg-card text-sm">
//               <SelectValue placeholder="Select Period" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="today">Today</SelectItem>
//               <SelectItem value="week">This Week</SelectItem>
//               <SelectItem value="month">This Month</SelectItem>
//               <SelectItem value="all">All Time</SelectItem>
//               {useCustomRange && <SelectItem value="custom">Custom Range</SelectItem>}
//             </SelectContent>
//           </Select>

//           <Button
//             variant="outline"
//             onClick={exportCSV}
//             className="border-primary/20 hover:bg-primary/10 text-sm h-9 px-3"
//           >
//             <Download className="w-4 h-4 mr-1.5" />
//             Export CSV
//           </Button>
//         </div>
//       </div>

//       {/* ── Custom Date Range (Summary Stats) ────────────────────────── */}
//       <Card className="bg-card border-border">
//         <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
//           <CardTitle className="text-sm flex items-center gap-2 text-foreground">
//             <Filter className="w-4 h-4 text-primary flex-shrink-0" />
//             Custom Date Range — Summary Cards
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="px-4 sm:px-6 pb-4">
//           {/* Date inputs stacked on mobile, row on sm+ */}
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-muted-foreground font-medium">From Date</label>
//               <input
//                 type="date"
//                 value={customStartDate}
//                 onChange={(e) => setCustomStartDate(e.target.value)}
//                 max={customEndDate || undefined}
//                 className={dateInputCls}
//               />
//             </div>
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-muted-foreground font-medium">To Date</label>
//               <input
//                 type="date"
//                 value={customEndDate}
//                 onChange={(e) => setCustomEndDate(e.target.value)}
//                 min={customStartDate || undefined}
//                 className={dateInputCls}
//               />
//             </div>
//             {/* Buttons */}
//             <div className="flex items-end gap-2">
//               <Button
//                 onClick={handleApply}
//                 disabled={!customStartDate || !customEndDate}
//                 className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm"
//               >
//                 Apply
//               </Button>
//               {useCustomRange && (
//                 <Button
//                   variant="outline"
//                   onClick={handleClear}
//                   className="flex-1 sm:flex-none border-border h-9 text-sm"
//                 >
//                   <X className="w-3.5 h-3.5 mr-1" />
//                   Clear
//                 </Button>
//               )}
//             </div>
//           </div>

//           {useCustomRange && (
//             <p className="mt-3 text-xs text-primary font-medium flex items-center gap-1.5">
//               <CheckCircle2 className="w-3.5 h-3.5" />
//               Showing:{" "}
//               <span className="font-bold">
//                 {format(new Date(customStartDate), "dd MMM yyyy")}
//               </span>{" "}
//               →{" "}
//               <span className="font-bold">
//                 {format(new Date(customEndDate), "dd MMM yyyy")}
//               </span>
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       {/* ── Summary Cards ─────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//         {[
//           {
//             label: "Total Bookings",
//             value: stats?.total_bookings ?? 0,
//             icon: Calendar,
//             color: "bg-blue-500/10 text-blue-500",
//           },
//           {
//             label: "Revenue",
//             value: `₹${(stats?.total_revenue ?? 0).toLocaleString()}`,
//             icon: DollarSign,
//             color: "bg-green-500/10 text-green-500",
//           },
//           {
//             label: "Completion",
//             value: `${
//               stats?.total_bookings
//                 ? Math.round((stats.completed_bookings / stats.total_bookings) * 100)
//                 : 0
//             }%`,
//             icon: TrendingUp,
//             color: "bg-purple-500/10 text-purple-500",
//           },
//           {
//             label: "Idle Bikes",
//             value: idleBikes?.length ?? 0,
//             icon: AlertTriangle,
//             color: "bg-yellow-500/10 text-yellow-500",
//           },
//         ].map((card, i) => (
//           <Card key={i} className="bg-card border-border">
//             <CardContent className="p-4 sm:p-6">
//               <div className="flex items-center justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-xs sm:text-sm text-muted-foreground truncate">
//                     {card.label}
//                   </p>
//                   <p className="text-xl sm:text-3xl font-bold text-foreground mt-0.5 truncate">
//                     {card.value}
//                   </p>
//                 </div>
//                 <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${card.color}`}>
//                   <card.icon className="w-4 h-4 sm:w-6 sm:h-6" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* ── Charts Row ────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

//         {/* Revenue Trend Line Chart */}
//         <Card className="bg-card border-border">
//           <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 pb-2">
//             <CardTitle className="text-foreground text-base sm:text-lg">
//               Revenue Trend
//             </CardTitle>
//             <Select
//               value={revenueDays.toString()}
//               onValueChange={(v) => setRevenueDays(parseInt(v))}
//             >
//               <SelectTrigger className="w-28 sm:w-32 h-8 text-xs">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="7">Last 7 days</SelectItem>
//                 <SelectItem value="14">Last 14 days</SelectItem>
//                 <SelectItem value="30">Last 30 days</SelectItem>
//               </SelectContent>
//             </Select>
//           </CardHeader>
//           <CardContent className="px-2 sm:px-6 pb-4">
//             <ResponsiveContainer width="100%" height={220}>
//               <LineChart data={dailyRevenue || []} margin={{ left: -10, right: 8 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
//                 <XAxis
//                   dataKey="date"
//                   tickFormatter={(val) => format(new Date(val), "d MMM")}
//                   fontSize={10}
//                   stroke="hsl(var(--muted-foreground))"
//                   tick={{ fontSize: 10 }}
//                   interval="preserveStartEnd"
//                 />
//                 <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} width={45} />
//                 <Tooltip
//                   formatter={(value) => [`₹${value}`, "Revenue"]}
//                   contentStyle={{
//                     backgroundColor: "hsl(var(--card))",
//                     border: "1px solid hsl(var(--border))",
//                     fontSize: 12,
//                   }}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke="#F97316"
//                   strokeWidth={2}
//                   dot={{ fill: "#F97316", r: 3 }}
//                   activeDot={{ r: 5 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Booking Status Pie Chart */}
//         <Card className="bg-card border-border">
//           <CardHeader className="px-4 sm:px-6 pt-4 pb-2">
//             <CardTitle className="text-foreground text-base sm:text-lg">
//               Booking Status
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="px-2 sm:px-6 pb-4">
//             {bookingStatusData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={220}>
//                 <PieChart>
//                   <Pie
//                     data={bookingStatusData}
//                     cx="50%"
//                     cy="45%"
//                     innerRadius={50}
//                     outerRadius={80}
//                     paddingAngle={4}
//                     dataKey="value"
//                   >
//                     {bookingStatusData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       fontSize: 12,
//                     }}
//                   />
//                   <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm italic">
//                 No booking data for selected period
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Bike Revenue Report ───────────────────────────────────────── */}
//       <Card className="bg-card border-border">
//         <CardHeader className="px-4 sm:px-6 pt-4 pb-2">
//           {/* Title + date pickers — all stacked on mobile */}
//           <div className="flex flex-col gap-3">
//             <CardTitle className="text-foreground text-base sm:text-lg">
//               Top 10 Performing Bikes
//             </CardTitle>
//             {/* Date pickers for bike revenue */}
//             <div className="grid grid-cols-2 gap-2">
//               <div className="flex flex-col gap-1">
//                 <label className="text-xs text-muted-foreground font-medium">From</label>
//                 <input
//                   type="date"
//                   value={bikeRevenueStart}
//                   onChange={(e) => setBikeRevenueStart(e.target.value)}
//                   max={bikeRevenueEnd || undefined}
//                   className={dateInputCls}
//                 />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-xs text-muted-foreground font-medium">To</label>
//                 <input
//                   type="date"
//                   value={bikeRevenueEnd}
//                   onChange={(e) => setBikeRevenueEnd(e.target.value)}
//                   min={bikeRevenueStart || undefined}
//                   className={dateInputCls}
//                 />
//               </div>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="px-2 sm:px-6 pb-4">
//           {/* Bar Chart */}
//           {bikeRevenueData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={280}>
//               <BarChart data={bikeRevenueData} layout="vertical" margin={{ left: 0, right: 16 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
//                 <XAxis type="number" hide />
//                 <YAxis
//                   dataKey="name"
//                   type="category"
//                   width={100}
//                   fontSize={11}
//                   stroke="hsl(var(--foreground))"
//                   tick={{ fontSize: 11 }}
//                 />
//                 <Tooltip
//                   cursor={{ fill: "hsl(var(--muted)/0.2)" }}
//                   formatter={(value) => [`₹${value}`, "Revenue"]}
//                   contentStyle={{
//                     backgroundColor: "hsl(var(--card))",
//                     border: "1px solid hsl(var(--border))",
//                     fontSize: 12,
//                   }}
//                 />
//                 <Bar dataKey="revenue" fill="#F97316" radius={[0, 4, 4, 0]} barSize={16} />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="h-[200px] flex items-center justify-center text-muted-foreground italic text-sm">
//               No revenue data for this period
//             </div>
//           )}

//           {/* Owner Name Table — horizontally scrollable on mobile */}
//           {bikeRevenue && bikeRevenue.length > 0 && (
//             <div className="mt-4">
//               <p className="text-sm font-semibold text-foreground mb-2 px-2 sm:px-0">
//                 Detailed Breakdown (with Owner)
//               </p>
//               <div className="overflow-x-auto -mx-2 sm:mx-0 rounded-lg border border-border">
//                 <table className="w-full text-xs sm:text-sm border-collapse min-w-[520px]">
//                   <thead>
//                     <tr className="bg-muted/30 border-b border-border">
//                       <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">#</th>
//                       <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">Bike Model</th>
//                       <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">Plate</th>
//                       <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">Owner</th>
//                       <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">Bookings</th>
//                       <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">Revenue</th>
//                       <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">Hours</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {bikeRevenue.map((b, i) => (
//                       <tr
//                         key={b._id}
//                         className={`border-b border-border/40 transition-colors hover:bg-primary/5 ${
//                           i % 2 === 0 ? "bg-muted/10" : ""
//                         }`}
//                       >
//                         <td className="py-2.5 px-3 text-muted-foreground font-mono">{i + 1}</td>
//                         <td className="py-2.5 px-3 text-foreground font-medium whitespace-nowrap">{b.model}</td>
//                         <td className="py-2.5 px-3 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
//                           {b.number_plate}
//                         </td>
//                         <td className="py-2.5 px-3 whitespace-nowrap">
//                           {b.bike_owner ? (
//                             <span className="inline-flex items-center gap-1.5">
//                               <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
//                               <span className="text-foreground">{b.bike_owner}</span>
//                             </span>
//                           ) : (
//                             <span className="text-muted-foreground italic">—</span>
//                           )}
//                         </td>
//                         <td className="py-2.5 px-3 text-right text-foreground">{b.total_bookings}</td>
//                         <td className="py-2.5 px-3 text-right font-semibold text-green-500 whitespace-nowrap">
//                           ₹{b.total_revenue?.toLocaleString()}
//                         </td>
//                         <td className="py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap">
//                           {b.total_hours?.toFixed(1)}h
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* ── Idle Bikes ────────────────────────────────────────────────── */}
//       {idleBikes && idleBikes.length > 0 && (
//         <Card className="border-yellow-500/50 bg-yellow-500/5">
//           <CardHeader className="pb-2 px-4 sm:px-6 pt-4">
//             <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-base sm:text-lg">
//               <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
//               Idle Bikes — No bookings in 30+ days
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="px-4 sm:px-6 pb-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
//               {idleBikes.map((bike) => (
//                 <div
//                   key={bike._id}
//                   className="flex items-center gap-3 p-3 bg-card rounded-lg border border-yellow-500/20"
//                 >
//                   <div className="p-2 bg-yellow-500/10 rounded-full flex-shrink-0">
//                     <Bike className="w-4 h-4 text-yellow-600" />
//                   </div>
//                   <div className="min-w-0">
//                     <p className="font-semibold text-foreground text-sm truncate">{bike.model}</p>
//                     <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">
//                       {bike.number_plate}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }



export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [revenueDays, setRevenueDays] = useState(30);

  // Custom date range for summary stats
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Compute the export date range label based on active filter
  const getExportDateRange = () => {
    if (useCustomRange && customStartDate && customEndDate) {
      return { from: customStartDate, to: customEndDate };
    }
    const now = new Date();
    if (period === "today") {
      const d = format(now, "yyyy-MM-dd");
      return { from: d, to: d };
    }
    if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return {
        from: format(start, "yyyy-MM-dd"),
        to: format(now, "yyyy-MM-dd"),
      };
    }
    if (period === "month") {
      return {
        from: format(startOfMonth(now), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    }
    return { from: "all-time", to: "all-time" };
  };

  // Data hooks
  const { data: stats } = useBookingStats(
    useCustomRange ? "custom" : period,
    useCustomRange && customStartDate ? customStartDate : null,
    useCustomRange && customEndDate ? customEndDate : null,
  );
  const { data: bikeRevenue } = useBikeRevenueReport(
    startOfMonth(new Date()),
    endOfMonth(new Date()),
  );
  const { data: idleBikes } = useIdleBikesReport();
  const { data: dailyRevenue } = useDailyRevenueReport(revenueDays);

  // Pie chart data
  const bookingStatusData = stats
    ? [
        {
          name: "Completed",
          value: stats.completed_bookings,
          color: "#22C55E",
        },
        { name: "Active", value: stats.active_bookings, color: "#3B82F6" },
        { name: "Pending", value: stats.pending_bookings, color: "#EAB308" },
        {
          name: "Cancelled",
          value: stats.cancelled_bookings,
          color: "#EF4444",
        },
      ].filter((d) => d.value > 0)
    : [];

  // Bar chart data (top 10)
  const bikeRevenueData =
    bikeRevenue?.slice(0, 10).map((b) => ({
      name: b.model?.substring(0, 12) || "Unknown",
      revenue: b.total_revenue,
      bookings: b.total_bookings,
    })) || [];

  // Refactored Excel Export using the 'xlsx' (SheetJS) package
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const range = getExportDateRange();
      let params = {};
      if (range.from !== "all-time") {
        // params.fromDate = new Date(range.from).toISOString();
        // params.toDate = new Date(range.to).toISOString();

        //  ADD NEW METHOD: Force local time boundaries (e.g., IST)
        const localStart = new Date(`${range.from}T00:00:00`);
        const localEnd = new Date(`${range.to}T23:59:59.999`);

        params.fromDate = localStart.toISOString();
        params.toDate = localEnd.toISOString();
      }

      const res = await api.get("/reports/bike-revenue", { params });
      const exportData = res.data;

      // 1. Set up explicit Column Headers Array
      const headers = [
        "Bike Model",
        "Number Plate",
        "Owner Name",
        "Total Bookings",
        "Total Revenue (INR)",
        "Total Hours",
        "Report From",
        "Report To",
      ];

      // 2. Map dataset arrays ensuring proper string formats/numbers
      const rows = exportData.map((b) => [
        b.model || "Unknown Model",
        b.number_plate ? b.number_plate.toUpperCase() : "N/A",
        b.bike_owner || "N/A",
        Number(b.total_bookings || 0),
        Number(b.total_revenue || 0),
        Number(b.total_hours ? Number(b.total_hours.toFixed(1)) : 0),
        range.from,
        range.to,
      ]);

      // 3. Assemble worksheet using an Array of Arrays (AoA)
      const worksheetData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // 4. Define custom pixel-equivalent column sizing widths
      worksheet["!cols"] = [
        { wch: 22 }, // Bike Model
        { wch: 16 }, // Number Plate
        { wch: 20 }, // Owner Name
        { wch: 15 }, // Total Bookings
        { wch: 20 }, // Total Revenue (INR)
        { wch: 14 }, // Total Hours
        { wch: 13 }, // Report From
        { wch: 13 }, // Report To
      ];

      // 5. Build and bundle up the workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bike Performance");

      // 6. Write binary file out and stream immediately to user download
      XLSX.writeFile(workbook, `report-${range.from}-to-${range.to}.xlsx`);
    } catch (err) {
      console.error("Failed to export Excel spreadsheet workbook layout", err);
      alert("Failed to generate Excel export file.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleApply = () => {
    if (customStartDate && customEndDate) setUseCustomRange(true);
  };

  const handleClear = () => {
    setUseCustomRange(false);
    setCustomStartDate("");
    setCustomEndDate("");
    setPeriod("month");
  };

  // shared input styles
  const dateInputCls =
    "w-full h-9 rounded-md border border-border bg-background px-2 text-sm " +
    "text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 " +
    "[color-scheme:light]";

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-gradient-sunset leading-tight">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Business analytics and insights
          </p>
        </div>

        {/* Period selector + Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={useCustomRange ? "custom" : period}
            onValueChange={(v) => {
              if (v !== "custom") {
                handleClear();
                setPeriod(v);
              }
            }}
            disabled={useCustomRange}
          >
            <SelectTrigger className="w-36 sm:w-40 bg-card text-sm">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
              {useCustomRange && (
                <SelectItem value="custom">Custom Range</SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Trigger calls exportToExcel now */}
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={isExporting}
            className="border-primary/20 hover:bg-primary/10 text-sm h-9 px-3"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
        </div>
      </div>

      {/* ── Custom Date Range (Summary Stats) ────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <CardTitle className="text-sm flex items-center gap-2 text-foreground">
            <Filter className="w-4 h-4 text-primary flex-shrink-0" />
            Custom Date Range — Summary Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">
                From Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={dateInputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">
                To Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={dateInputCls}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleApply}
                disabled={!customStartDate || !customEndDate}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm"
              >
                Apply
              </Button>
              {useCustomRange && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 sm:flex-none border-border h-9 text-sm"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {useCustomRange && (
            <p className="mt-3 text-xs text-primary font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Showing:{" "}
              <span className="font-bold">
                {format(new Date(customStartDate), "dd MMM yyyy")}
              </span>{" "}
              →{" "}
              <span className="font-bold">
                {format(new Date(customEndDate), "dd MMM yyyy")}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Bookings",
            value: stats?.total_bookings ?? 0,
            icon: Calendar,
            color: "bg-blue-500/10 text-blue-500",
          },
          {
            label: "Revenue",
            value: `₹${(stats?.total_revenue ?? 0).toLocaleString()}`,
            icon: DollarSign,
            color: "bg-green-500/10 text-green-500",
          },
          {
            label: "Completion",
            value: `${
              stats?.total_bookings
                ? Math.round(
                    (stats.completed_bookings / stats.total_bookings) * 100,
                  )
                : 0
            }%`,
            icon: TrendingUp,
            color: "bg-purple-500/10 text-purple-500",
          },
          {
            label: "Idle Bikes",
            value: idleBikes?.length ?? 0,
            icon: AlertTriangle,
            color: "bg-yellow-500/10 text-yellow-500",
          },
        ].map((card, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {card.label}
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-foreground mt-0.5 truncate">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${card.color}`}
                >
                  <card.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend Line Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 pb-2">
            <CardTitle className="text-foreground text-base sm:text-lg">
              Revenue Trend
            </CardTitle>
            <Select
              value={revenueDays.toString()}
              onValueChange={(v) => setRevenueDays(parseInt(v))}
            >
              <SelectTrigger className="w-28 sm:w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={dailyRevenue || []}
                margin={{ left: -10, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => format(new Date(val), "d MMM")}
                  fontSize={10}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  fontSize={10}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                  width={45}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ fill: "#F97316", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="px-4 sm:px-6 pt-4 pb-2">
            <CardTitle className="text-foreground text-base sm:text-lg">
              Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-4">
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      // backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm italic">
                No booking data for selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bike Revenue Report ───────────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="px-4 sm:px-6 pt-4 pb-2">
          <CardTitle className="text-foreground text-base sm:text-lg">
            Top 10 Performing Bikes (This Month)
          </CardTitle>
        </CardHeader>

        <CardContent className="px-2 sm:px-6 pb-4">
          {bikeRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={bikeRevenueData}
                layout="vertical"
                margin={{ left: 0, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  fontSize={11}
                  stroke="hsl(var(--foreground))"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#F97316"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground italic text-sm">
              No revenue data for this period
            </div>
          )}

          {/* Table Breakdown View */}
          {/* {bikeRevenue && bikeRevenue.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground mb-2 px-2 sm:px-0">
                Detailed Breakdown (with Owner)
              </p>
              <div className="overflow-x-auto -mx-2 sm:mx-0 rounded-lg border border-border">
                <table className="w-full text-xs sm:text-sm border-collapse min-w-[520px]">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                        #
                      </th>
                      <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                        Bike Model
                      </th>
                      <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                        Plate
                      </th>
                      <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                        Owner
                      </th>
                      <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                        Bookings
                      </th>
                      <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                        Revenue
                      </th>
                      <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bikeRevenue.map((b, i) => (
                      <tr
                        key={b._id}
                        className={`border-b border-border/40 transition-colors hover:bg-primary/5 ${
                          i % 2 === 0 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 text-muted-foreground font-mono">
                          {i + 1}
                        </td>
                        <td className="py-2.5 px-3 text-foreground font-medium whitespace-nowrap">
                          {b.model}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                          {b.number_plate}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {b.bike_owner ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-foreground">
                                {b.bike_owner}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-foreground">
                          {b.total_bookings}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-green-500 whitespace-nowrap">
                          ₹{b.total_revenue?.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap">
                          {b.total_hours?.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* ── Idle Bikes ────────────────────────────────────────────────── */}
      {idleBikes && idleBikes.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4">
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-base sm:text-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              Idle Bikes — No bookings in 30+ days
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {idleBikes.map((bike) => (
                <div
                  key={bike._id}
                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-yellow-500/20"
                >
                  <div className="p-2 bg-yellow-500/10 rounded-full flex-shrink-0">
                    <Bike className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {bike.model}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">
                      {bike.number_plate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}