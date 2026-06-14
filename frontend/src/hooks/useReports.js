import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { subDays } from 'date-fns';

// Create an axios instance for cleaner calls
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pipip-backend-eid3.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Hook: Fetch general booking stats
 * GET /api/reports/stats?period=today
 */
// export function useBookingStats(period = 'all', startDate = null, endDate = null) {
//   return useQuery({
//     queryKey: ['booking-stats', period , startDate, endDate] ,
//     queryFn: async () => {
//       // const { data } = await api.get(`/reports/stats`, { params: { period } });
//       const params = { period };
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;
//       const { data } = await api.get(`/reports/stats`, { params });
//       return data;
//     }
//   });
// }

// export function useBookingStats(period = "all", startDate = null, endDate = null) {
//   return useQuery({
//     queryKey: ["booking-stats", period, startDate, endDate],
//     queryFn: async () => {
//       const params = { period };
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;
//       const { data } = await api.get(`/reports/stats`, { params });
//       return data;
//     },
//   });
// }

export function useBookingStats(period = "all", startDate = null, endDate = null) {
  return useQuery({
    queryKey: ["booking-stats", period, startDate, endDate],
    queryFn: async () => {
      const params = { period };
      
      if (startDate && endDate) {
        // Force local day boundaries to match Excel parameters exactly
        params.startDate = new Date(`${startDate}T00:00:00`).toISOString();
        params.endDate = new Date(`${endDate}T23:59:59.999`).toISOString();
      }

      const { data } = await api.get(`/reports/stats`, { params });
      return data;
    },
  });
}

/**
 * Hook: Fetch revenue broken down by bike
 * GET /api/reports/bike-revenue
 */
// export function useBikeRevenueReport(fromDate, toDate) {
//   return useQuery({
//     queryKey: ['bike-revenue', fromDate, toDate],
//     queryFn: async () => {
//       const { data } = await api.get(`/reports/bike-revenue`, {
//         params: { 
//           fromDate: fromDate?.toISOString(), 
//           toDate: toDate?.toISOString() 
//         }
//       });
//       return data;
//     }
//   });
// }
export function useBikeRevenueReport(fromDate, toDate) {
  return useQuery({
    queryKey: ["bike-revenue", fromDate, toDate],
    queryFn: async () => {
      const { data } = await api.get(`/reports/bike-revenue`, {
        params: {
          // Wrap in fresh Date constructors to safeguard conversions
          fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
          toDate: toDate ? new Date(toDate).toISOString() : undefined,
        },
      });
      return data;
    },
  });
}

/**
 * Hook: Find bikes with no bookings in the last 30 days
 */
export function useIdleBikesReport() {
  return useQuery({
    queryKey: ['idle-bikes'],
    queryFn: async () => {
      const { data } = await api.get(`/reports/idle-bikes`);
      return data;
    }
  });
}

/**
 * Hook: Get daily revenue for charts
 */
export function useDailyRevenueReport(days = 30) {
  return useQuery({
    queryKey: ['daily-revenue', days],
    queryFn: async () => {
      const { data } = await api.get(`/reports/daily-revenue`, { params: { days } });
      return data;
    }
  });
}

export function useActiveBookingsEndingSoon() {
  return useQuery({
    queryKey: ['active-bookings-ending-soon'],
    queryFn: async () => {
      const { data } = await api.get('/reports/ending-soon');
      return data;
    },
    refetchInterval: 30000 // Keep the 30s auto-refresh for the dashboard
  });
}

export function useRecentlyExpiredBookings() {
  return useQuery({
    queryKey: ['recently-expired'],
    queryFn: async () => {
      const { data } = await api.get('/reports/recently-expired');
      return data;
    }
  });
}