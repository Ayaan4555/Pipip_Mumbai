import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Plus,
  Search,
  Bike,
  MapPin,
  IndianRupee,
  Edit,
  Trash2,
  ListFilter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useBikes } from "../../hooks/useBikes";
import { useActiveAreas } from "../../hooks/useAreas";
import { useAuth } from "../../lib/AuthProvider";
import {
  useClusters,
  useCreateCluster,
  useUpdateCluster,
  useDeleteCluster,
} from "../../hooks/useClusters";
import { toast } from "sonner";

const emptyFormData = {
  name: "",
  price_per_hour: "",
  price_per_day: "",
  area_id: "",
  bikes: [], // Selected bike IDs
};

export default function Clusters() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingClusterId, setEditingClusterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bikeSearchQuery, setBikeSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyFormData);

  const { data: clusters, isLoading: clustersLoading } = useClusters();
  const { data: bikes, isLoading: bikesLoading } = useBikes();
  const { data: areas } = useActiveAreas();
  const { user, isStaff } = useAuth();

  const displayAreas = isStaff
    ? (user?.assigned_areas || [])
    : (areas || []);

  const createClusterMutation = useCreateCluster();
  const updateClusterMutation = useUpdateCluster();
  const deleteClusterMutation = useDeleteCluster();

  const isEdit = !!editingClusterId;

  // Filtered clusters for list search
  const filteredClusters = useMemo(() => {
    if (!clusters) return [];
    if (!searchQuery) return clusters;
    const q = searchQuery.toLowerCase();
    return clusters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.area_id?.name && c.area_id.name.toLowerCase().includes(q))
    );
  }, [clusters, searchQuery]);

  // Filtered bikes for multi-select checklists
  const filteredBikes = useMemo(() => {
    if (!bikes) return [];
    const q = bikeSearchQuery.toLowerCase();
    return bikes.filter((b) => {
      const bikeAreaId = b.area_id && typeof b.area_id === 'object' ? b.area_id._id : b.area_id;
      const matchesArea = formData.area_id && String(bikeAreaId) === String(formData.area_id);
      const matchesStatus = b.status !== "maintenance";
      const matchesSearch =
        b.model.toLowerCase().includes(q) ||
        (b.bike_name && b.bike_name.toLowerCase().includes(q)) ||
        b.number_plate.toLowerCase().includes(q);

      return matchesStatus && matchesArea && matchesSearch;
    });
  }, [bikes, bikeSearchQuery, formData.area_id]);

  const handleBikeToggle = (bikeId) => {
    setFormData((prev) => {
      const isSelected = prev.bikes.includes(bikeId);
      const newBikes = isSelected
        ? prev.bikes.filter((id) => id !== bikeId)
        : [...prev.bikes, bikeId];
      return { ...prev, bikes: newBikes };
    });
  };

  const handleCreateOrUpdate = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name || !formData.price_per_hour || !formData.price_per_day || !formData.area_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: formData.name,
      price_per_hour: Number(formData.price_per_hour),
      price_per_day: Number(formData.price_per_day),
      area_id: formData.area_id,
      bikes: formData.bikes,
    };

    try {
      if (isEdit) {
        await updateClusterMutation.mutateAsync({
          id: editingClusterId,
          clusterData: payload,
        });
      } else {
        await createClusterMutation.mutateAsync(payload);
      }
      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (cluster) => {
    setEditingClusterId(cluster._id);
    setFormData({
      name: cluster.name,
      price_per_hour: String(cluster.price_per_hour),
      price_per_day: String(cluster.price_per_day),
      area_id: cluster.area_id?._id || cluster.area_id || "",
      bikes: cluster.bikes?.map((b) => b._id || b) || [],
    });
    setIsOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this cluster?")) {
      try {
        await deleteClusterMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingClusterId(null);
    setBikeSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bike Clusters</h1>
          <p className="text-muted-foreground">Group bike models and colors into booking categories</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
            <Button
              className="gradient-sunset text-primary-foreground font-semibold"
              onClick={() => {
                setEditingClusterId(null);
                const defaultAreaId = isStaff && user?.assigned_areas?.length > 0
                  ? (user.assigned_areas[0]._id || user.assigned_areas[0])
                  : "";
                setFormData({
                  name: "",
                  price_per_hour: "",
                  price_per_day: "",
                  area_id: defaultAreaId,
                  bikes: [],
                });
                setIsOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> New Cluster
            </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle className="text-xl">
                {isEdit ? "Edit Cluster" : "Create Bike Cluster"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-auto">
              <form onSubmit={handleCreateOrUpdate} className="space-y-5 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cluster Name *</Label>
                    <Input
                      placeholder="e.g. Honda Activa, Suzuki Access"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location / Area *</Label>
                    <Select
                      value={formData.area_id}
                      onValueChange={(v) => setFormData({ ...formData, area_id: v, bikes: [] })}
                      disabled={isStaff && user?.assigned_areas?.length <= 1}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Area" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayAreas?.map((area) => (
                          <SelectItem key={area._id} value={area._id}>
                            {area.name} ({area.city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hourly Price (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 20"
                      value={formData.price_per_hour}
                      onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Price (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 400"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Label className="font-semibold text-base text-foreground">Select Bikes to Cluster</Label>
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search bike models..."
                        className="pl-8 h-8 text-xs rounded-lg"
                        value={bikeSearchQuery}
                        onChange={(e) => setBikeSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="border border-border rounded-xl p-3 bg-muted/30">
                    <ScrollArea className="h-60">
                      {!formData.area_id ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                          <AlertCircle className="w-8 h-8 text-primary mb-2 opacity-80" />
                          <p className="text-sm font-semibold text-foreground">Select an Area First</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
                            Bikes are region-specific. Please choose a Location / Area above to display available bikes in that region.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredBikes.map((bike) => {
                            const isChecked = formData.bikes.includes(bike._id);
                            return (
                              <div
                                key={bike._id}
                                onClick={() => handleBikeToggle(bike._id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                                  isChecked
                                    ? "bg-primary/10 border-primary/40 shadow-sm"
                                    : "bg-card hover:bg-muted border-border"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} // toggled on container click
                                  className="w-4 h-4 rounded border-borderAccent text-primary focus:ring-primary/20 pointer-events-none"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-foreground truncate">
                                    {bike.model}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                                    {bike.number_plate} {bike.bike_colour ? `· ${bike.bike_colour}` : ""}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {filteredBikes.length === 0 && (
                            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                              No available bikes found in this region matching query.
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.bikes.length} bikes selected for this category.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-sunset font-semibold text-primary-foreground">
                    {isEdit ? "Save Changes" : "Create Cluster"}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clusters by name or area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {clustersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-44 p-5 bg-muted/40 rounded-2xl" />
            </Card>
          ))}
        </div>
      ) : filteredClusters.length === 0 ? (
        <div className="text-center py-20 bg-card/40 border border-dashed rounded-3xl p-10">
          <Bike className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Bike Clusters</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Group your bike models under specific categories to allow customer reservations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClusters.map((cluster) => (
            <Card
              key={cluster._id}
              className="bg-card/75 border border-border/80 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {cluster.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {cluster.area_id?.name || "Global"} ({cluster.area_id?.city || "Active Area"})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(cluster)}
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-2 h-8 w-8 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClick(cluster._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 h-8 w-8 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 bg-muted/40 rounded-xl">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hourly Rate</span>
                    <p className="text-base font-bold text-foreground flex items-center gap-0.5 mt-0.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {cluster.price_per_hour}
                      <span className="text-xs font-normal text-muted-foreground font-sans">/hr</span>
                    </p>
                  </div>
                  <div className="border-l border-border pl-3.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Daily Rate</span>
                    <p className="text-base font-bold text-foreground flex items-center gap-0.5 mt-0.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {cluster.price_per_day}
                      <span className="text-xs font-normal text-muted-foreground font-sans">/day</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <Bike className="w-4 h-4 text-secondary" />
                    <span>{cluster.bikes?.length || 0} bikes linked</span>
                  </div>
                  {cluster.bikes?.length > 0 ? (
                    <span className="bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Empty
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}