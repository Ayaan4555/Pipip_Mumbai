import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_URL ="https://pipip-backend-eid3.onrender.com/api/vehicle-services";

/* =========================
   GET ALL SERVICE RECORDS
   ========================= */
export function useVehicleServices(search = "") {
  return useQuery({
    queryKey: ["vehicleServices", search],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, {
        params: search ? { search } : {},
      });
      return data;
    },
  });
}

/* =========================
   GET BIKE SERVICE TIMELINE
   ========================= */
export function useBikeServiceTimeline(bikeId) {
  return useQuery({
    queryKey: ["bikeServiceTimeline", bikeId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/bike/${bikeId}`);
      return data;
    },
    enabled: !!bikeId,
  });
}

/* =========================
   CREATE SERVICE RECORD
   ========================= */
export function useCreateVehicleService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData) => {
      const isFormData = serviceData instanceof FormData;
      const { data } = await axios.post(
        API_URL,
        serviceData,
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
      queryClient.invalidateQueries({ queryKey: ["vehicleServices"] });
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bikeServiceTimeline"] });
      toast.success("Vehicle service record added successfully 🛠️");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to record vehicle service"
      );
    },
  });
}

/* =========================
   UPDATE SERVICE RECORD
   ========================= */
export function useUpdateVehicleService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, serviceData }) => {
      const isFormData = serviceData instanceof FormData;
      const { data } = await axios.put(
        `${API_URL}/${id}`,
        serviceData,
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
      queryClient.invalidateQueries({ queryKey: ["vehicleServices"] });
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bikeServiceTimeline"] });
      toast.success("Service record updated successfully 🎉");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update service record"
      );
    },
  });
}

/* =========================
   DELETE SERVICE RECORD
   ========================= */
export function useDeleteVehicleService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.delete(`${API_URL}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleServices"] });
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bikeServiceTimeline"] });
      toast.success("Service record deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete service record"
      );
    },
  });
}