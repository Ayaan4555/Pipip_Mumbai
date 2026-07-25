import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "https://pipip-backend-eid3.onrender.com/api/expenses";

/* =========================
   GET ALL EXPENSES
   ========================= */
export function useExpenses(search = "") {
  return useQuery({
    queryKey: ["expenses", search],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, {
        params: search ? { search } : {},
      });
      return data;
    },
  });
}

/* =========================
   GET SINGLE EXPENSE
   ========================= */
export function useExpense(id) {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/* =========================
   CREATE EXPENSE
   ========================= */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData) => {
      const isFormData = expenseData instanceof FormData;
      const { data } = await axios.post(
        API_URL,
        expenseData,
        isFormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {}
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense submitted successfully 🎉");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit expense");
    },
  });
}

/* =========================
   UPDATE EXPENSE
   ========================= */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, expenseData }) => {
      const isFormData = expenseData instanceof FormData;
      const { data } = await axios.put(
        `${API_URL}/${id}`,
        expenseData,
        isFormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {}
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated successfully 🎉");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update expense");
    },
  });
}