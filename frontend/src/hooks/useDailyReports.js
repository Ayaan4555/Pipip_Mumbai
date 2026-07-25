import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "https://pipip-backend-eid3.onrender.com/api/daily-reports";

/* =========================
   GET TODAY'S AUTOMATED REPORT
   ========================= */
export function useTodayReport() {
  return useQuery({
    queryKey: ["today-report"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/today`);
      return data;
    },
  });
}

/* =========================
   GET HISTORICAL REPORTS
   ========================= */
export function useHistoricalReports() {
  return useQuery({
    queryKey: ["historical-reports"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/history`);
      return data;
    },
  });
}

/* =========================
   GET CONFIGURATION SETTINGS
   ========================= */
export function useReportSettings() {
  return useQuery({
    queryKey: ["report-settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/settings`);
      return data;
    },
  });
}

/* =========================
   UPDATE CONFIGURATION SETTINGS
   ========================= */
export function useUpdateReportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsData) => {
      const { data } = await axios.post(`${API_URL}/settings`, settingsData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-settings"] });
      toast.success("Daily report settings updated successfully! ⚙️");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });
}