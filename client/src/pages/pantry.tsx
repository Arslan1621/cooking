import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Plus, Edit, Trash2, Calendar, Search, Filter, AlertTriangle } from "lucide-react";

const categories = [
  "Produce", "Dairy", "Meat", "Poultry", "Seafood", "Grains", "Pantry Staples", 
  "Spices & Herbs", "Condiments", "Frozen", "Beverages", "Snacks", "Other"
];

const units = [
  "piece", "cup", "gram", "kg", "oz", "lb", "tsp", "tbsp", "liter", "ml", "can", "package"
];

export default function Pantry() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("piece");
  const [category, setCategory] = useState("Other");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Get pantry items
  const { data: pantryItems } = useQuery({
    queryKey: ["/api/pantry"],
    enabled: isAuthenticated,
  });

  // Add pantry item mutation
  const addItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      return await apiRequest("/api/pantry", {
        method: "POST",
        body: JSON.stringify(itemData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pantry"] });
      toast({
        title: "Item Added!",
        description: "Pantry item has been added successfully.",
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add pantry item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update pantry item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...itemData }: any) => {
      return await apiRequest(`/api/pantry/${id}`, {
        method: "PUT",
        body: JSON.stringify(itemData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pantry"] });
      toast({
        title: "Item Updated!",
        description: "Pantry item has been updated successfully.",
      });
      resetForm();
      setEditingItem(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update pantry item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete pantry item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/pantry/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pantry"] });
      toast({
        title: "Item Deleted!",
        description: "Pantry item has been removed.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete pantry item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnit("piece");
    setCategory("Other");
    setExpiryDate("");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide an item name.",
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      name: name.trim(),
      quantity: parseFloat(quantity) || null,
      unit,
      category,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, ...itemData });
    } else {
      addItemMutation.mutate(itemData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity?.toString() || "");
    setUnit(item.unit || "piece");
    setCategory(item.category || "Other");
    setExpiryDate(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "");
  };

  const handleDelete = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  // Filter items
  const filteredItems = pantryItems?.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    if (showExpiringSoon) {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const itemExpiry = item.expiryDate ? new Date(item.expiryDate) : null;
      const isExpiring = itemExpiry && itemExpiry <= threeDaysFromNow;
      return matchesSearch && matchesCategory && isExpiring;
    }
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Group items by category
  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Check for expiring items
  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: "expired", days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 3) return { status: "expiring", days: daysUntilExpiry };
    return { status: "fresh", days: daysUntilExpiry };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="chef-spinner w-32 h-32"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chef-gray">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🥫 My Pantry
              </h1>
              <p className="text-gray-600">
                Keep track of your ingredients and never run out of cooking essentials.
              </p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-chef-orange hover:bg-chef-orange/90 mt-4 lg:mt-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Pantry Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Chicken Breast, Olive Oil"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={addItemMutation.isPending}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90"
                  >
                    Add to Pantry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search pantry items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant={showExpiringSoon ? "default" : "outline"}
                    onClick={() => setShowExpiringSoon(!showExpiringSoon)}
                    className={showExpiringSoon ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Expiring Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pantry Items */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {pantryItems?.length === 0 ? "Your pantry is empty" : "No items found"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {pantryItems?.length === 0 
                    ? "Start adding ingredients to keep track of what you have at home."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {pantryItems?.length === 0 && (
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-chef-orange hover:bg-chef-orange/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([categoryName, items]) => (
                <div key={categoryName}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    {categoryName}
                    <Badge variant="secondary">{(items as any[]).length}</Badge>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(items as any[]).map((item) => {
                      const expiryStatus = getExpiryStatus(item.expiryDate);
                      
                      return (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900 flex-1">{item.name}</h3>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove "{item.name}" from your pantry?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            
                            {item.quantity && (
                              <p className="text-sm text-gray-600 mb-2">
                                {item.quantity} {item.unit}
                              </p>
                            )}
                            
                            {expiryStatus && (
                              <div className="flex items-center gap-1 mb-2">
                                <Calendar className="w-3 h-3" />
                                <Badge 
                                  variant={
                                    expiryStatus.status === "expired" ? "destructive" :
                                    expiryStatus.status === "expiring" ? "default" :
                                    "secondary"
                                  }
                                  className={
                                    expiryStatus.status === "expiring" ? "bg-yellow-500 text-white" : ""
                                  }
                                >
                                  {expiryStatus.status === "expired" 
                                    ? `Expired ${expiryStatus.days}d ago`
                                    : expiryStatus.status === "expiring"
                                    ? `${expiryStatus.days}d left`
                                    : `${expiryStatus.days}d fresh`
                                  }
                                </Badge>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500">
                              Added {new Date(item.addedAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Pantry Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editName">Item Name</Label>
                  <Input
                    id="editName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Chicken Breast, Olive Oil"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editQuantity">Quantity</Label>
                    <Input
                      id="editQuantity"
                      type="number"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editUnit">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editCategory">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="editExpiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="editExpiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={updateItemMutation.isPending}
                  className="w-full bg-chef-orange hover:bg-chef-orange/90"
                >
                  Update Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
