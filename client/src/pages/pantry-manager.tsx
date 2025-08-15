import { useState } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Package, Edit, Trash2, Calendar, Loader2, Search } from "lucide-react";
import { format, isAfter, differenceInDays } from "date-fns";

const categories = [
  "Vegetables", "Fruits", "Meat & Poultry", "Seafood", "Dairy", "Grains & Cereals",
  "Herbs & Spices", "Condiments", "Beverages", "Frozen", "Canned", "Other"
];

const units = ["pieces", "kg", "g", "lb", "oz", "cups", "liters", "ml", "bottles", "packages"];

export default function PantryManager() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unit: "",
    category: "",
    expiryDate: "",
  });

  // Redirect if not authenticated
  React.useEffect(() => {
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

  // Fetch pantry items
  const { data: pantryItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/pantry'],
    enabled: isAuthenticated,
  });

  // Add item mutation
  const addItem = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await apiRequest('POST', '/api/pantry', itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pantry'] });
      setIsAddDialogOpen(false);
      setNewItem({ name: "", quantity: "", unit: "", category: "", expiryDate: "" });
      toast({
        title: "Item Added! ✅",
        description: "Pantry item has been added successfully.",
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
        title: "Failed to Add Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/pantry/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pantry'] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Item Updated! ✅",
        description: "Pantry item has been updated successfully.",
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
        title: "Failed to Update Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete item mutation
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/pantry/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pantry'] });
      toast({
        title: "Item Deleted! 🗑️",
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
        title: "Failed to Delete Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddItem = () => {
    if (!newItem.name) {
      toast({
        title: "Missing Information",
        description: "Please provide an item name.",
        variant: "destructive",
      });
      return;
    }

    addItem.mutate({
      name: newItem.name,
      quantity: parseFloat(newItem.quantity) || 1,
      unit: newItem.unit || 'pieces',
      category: newItem.category || 'Other',
      expiryDate: newItem.expiryDate ? new Date(newItem.expiryDate) : null,
    });
  };

  const handleEditItem = () => {
    if (!editingItem?.name) {
      toast({
        title: "Missing Information",
        description: "Please provide an item name.",
        variant: "destructive",
      });
      return;
    }

    updateItem.mutate({
      id: editingItem.id,
      data: {
        name: editingItem.name,
        quantity: parseFloat(editingItem.quantity) || 1,
        unit: editingItem.unit || 'pieces',
        category: editingItem.category || 'Other',
        expiryDate: editingItem.expiryDate ? new Date(editingItem.expiryDate) : null,
      },
    });
  };

  const openEditDialog = (item: any) => {
    setEditingItem({
      ...item,
      expiryDate: item.expiryDate ? format(new Date(item.expiryDate), 'yyyy-MM-dd') : '',
    });
    setIsEditDialogOpen(true);
  };

  // Filter items based on search and category
  const filteredItems = pantryItems?.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get expiry status
  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) return { status: 'expired', color: 'bg-red-500', text: 'Expired' };
    if (daysUntilExpiry <= 3) return { status: 'expiring', color: 'bg-orange-500', text: `${daysUntilExpiry}d left` };
    if (daysUntilExpiry <= 7) return { status: 'warning', color: 'bg-yellow-500', text: `${daysUntilExpiry}d left` };
    return { status: 'fresh', color: 'bg-green-500', text: `${daysUntilExpiry}d left` };
  };

  // Count items by status
  const statusCounts = filteredItems.reduce((acc: any, item: any) => {
    const status = getExpiryStatus(item.expiryDate);
    if (status) {
      acc[status.status] = (acc[status.status] || 0) + 1;
    } else {
      acc.noExpiry = (acc.noExpiry || 0) + 1;
    }
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              📦 Pantry Manager
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Keep Your Kitchen Organized
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Track your ingredients, monitor expiry dates, and never run out of essentials. ChefGPT keeps your pantry organized and suggests recipes based on what you have.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{filteredItems.length}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.expired || 0}</div>
                <div className="text-sm text-gray-600">Expired</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{statusCounts.expiring || 0}</div>
                <div className="text-sm text-gray-600">Expiring Soon</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.warning || 0}</div>
                <div className="text-sm text-gray-600">Use This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.fresh || 0}</div>
                <div className="text-sm text-gray-600">Fresh</div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search pantry items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-chef-orange hover:bg-chef-orange/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Pantry Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to your pantry inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Olive Oil, Chicken Breast"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={newItem.unit} onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} disabled={addItem.isPending}>
                    {addItem.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Item"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pantry Items Grid */}
          {itemsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading pantry items...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item: any) => {
                const expiryStatus = getExpiryStatus(item.expiryDate);
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem.mutate(item.id)}
                            disabled={deleteItem.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {item.expiryDate && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {expiryStatus && (
                            <Badge className={`text-white text-xs ${expiryStatus.color}`}>
                              {expiryStatus.text}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || selectedCategory !== "All" ? "No items found" : "Your pantry is empty"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding ingredients to track your kitchen inventory"
                  }
                </p>
                {!searchQuery && selectedCategory === "All" && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-chef-orange hover:bg-chef-orange/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Pantry Item</DialogTitle>
                <DialogDescription>
                  Update the details of your pantry item
                </DialogDescription>
              </DialogHeader>
              {editingItem && (
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="editName">Item Name</Label>
                    <Input
                      id="editName"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editQuantity">Quantity</Label>
                      <Input
                        id="editQuantity"
                        type="number"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editUnit">Unit</Label>
                      <Select value={editingItem.unit} onValueChange={(value) => setEditingItem(prev => ({ ...prev, unit: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editCategory">Category</Label>
                    <Select value={editingItem.category} onValueChange={(value) => setEditingItem(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="editExpiryDate">Expiry Date</Label>
                    <Input
                      id="editExpiryDate"
                      type="date"
                      value={editingItem.expiryDate}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditItem} disabled={updateItem.isPending}>
                  {updateItem.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Item"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}