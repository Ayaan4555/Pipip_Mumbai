import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "https://pipip-backend-eid3.onrender.com/api/clusters";

/* ================= GET ALL CLUSTERS ================= */
export function useClusters() {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
  });
}

/* ================= GET SINGLE CLUSTER ================= */
export function useCluster(id) {
  return useQuery({
    queryKey: ["cluster", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/* ================= CREATE CLUSTER ================= */
export function useCreateCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clusterData) => {
      const { data } = await axios.post(API_URL, clusterData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      toast.success("Cluster created successfully 🎉");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create cluster");
    },
  });
}

/* ================= UPDATE CLUSTER ================= */
export function useUpdateCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clusterData }) => {
      const { data } = await axios.put(`${API_URL}/${id}`, clusterData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      toast.success("Cluster updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update cluster");
    },
  });
}

/* ================= DELETE CLUSTER ================= */
export function useDeleteCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      toast.success("Cluster deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete cluster");
    },
  });
}