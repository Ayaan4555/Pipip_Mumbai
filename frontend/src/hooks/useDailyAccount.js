import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "https://pipip-backend-eid3.onrender.com/api/daily-accounts";

/* =========================
   GET ALL ENTRIES
   ========================= */
export function useDailyAccounts({ search = "", filter = "", startDate = "", endDate = "" }) {
  return useQuery({
    queryKey: ["daily-accounts", search, filter, startDate, endDate],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, {
        params: { search, filter, startDate, endDate },
      });
      return data;
    },
  });
}

/* =========================
   CREATE ENTRY
   ========================= */
export function useCreateDailyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryData) => {
      const { data } = await axios.post(API_URL, entryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-accounts"] });
      toast.success("Account entry saved successfully! 🎉");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save account entry");
    },
  });
}

/* =========================
   UPDATE ENTRY
   ========================= */
export function useUpdateDailyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, entryData }) => {
      const { data } = await axios.put(`${API_URL}/${id}`, entryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-accounts"] });
      toast.success("Account entry updated successfully! 🎉");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update account entry");
    },
  });
}

/* =========================
   DELETE ENTRY
   ========================= */
export function useDeleteDailyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.delete(`${API_URL}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-accounts"] });
      toast.success("Account entry deleted successfully! 🗑️");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete account entry");
    },
  });
}