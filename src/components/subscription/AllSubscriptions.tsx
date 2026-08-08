"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { type Subscription } from "@prisma/client";
import  AddSubscriptionCard  from "@/components/subscription/AddSubscriptionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Search } from "lucide-react";
import { toast } from "sonner";

// Helper to format currency
const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(value);
};

const normalizeStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

export default function AllSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("nextBillingDate-asc");

  // State for the edit modal
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions");
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      
      const subsData = await response.json();
      setSubscriptions(subsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Could not load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (subscription: Subscription) => {
    if (!window.confirm(`Delete ${subscription.name}? This cannot be undone.`)) {
      return;
    }

    try {
        const response = await fetch(`/api/subscriptions/${subscription.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        toast.success('Subscription deleted!');
        fetchData(); // Re-fetch all data to ensure consistency
    } catch {
        toast.error('Failed to delete subscription.');
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };
  
  const handleSuccess = () => {
    setEditingSubscription(null);
    fetchData();
  }

  // Memoized derivation of filtered and sorted data
  const filteredAndSortedSubscriptions = useMemo(() => {
    let subs = [...subscriptions];

    if (searchTerm) {
      subs = subs.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (categoryFilter !== "All") {
      subs = subs.filter(s => s.category === categoryFilter);
    }

    const [sortKey, sortDirection] = sortBy.split('-');
    subs.sort((a, b) => {
        let valA, valB;

        switch (sortKey) {
            case 'name':
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                break;
            case 'nextBillingDate':
            default:
                valA = new Date(a.nextBillingDate).getTime();
                valB = new Date(b.nextBillingDate).getTime();
                break;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    return subs;
  }, [subscriptions, searchTerm, categoryFilter, sortBy]);
  
  const uniqueCategories = useMemo(() => ["All", ...new Set(subscriptions.map(s => s.category).filter(Boolean))], [subscriptions]);


  if (loading) return <div className="p-4 text-center">Loading your subscriptions...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-8">
        {/* Modal for Editing */}
        {editingSubscription && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <AddSubscriptionCard 
                        subscriptionToEdit={editingSubscription}
                        onSuccess={handleSuccess}
                        onClose={() => setEditingSubscription(null)}
                    />
                </div>
            </div>
        )}

        <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">All Subscriptions</h1>
            <p className="text-muted-foreground">View, manage, and filter all of your recurring payments.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-2 mb-6 p-4 border rounded-lg bg-card">
            <div className="relative w-full md:flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Filter by name..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    {uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="nextBillingDate-asc">Next Payment</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* Subscriptions Grid */}
        {filteredAndSortedSubscriptions.length > 0 ? (
             <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedSubscriptions.map(sub => (
                    <Card key={sub.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{sub.name}</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(sub)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(sub)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardDescription>{sub.billingCycle}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                             <p className="text-2xl font-bold">{formatCurrency(Number(sub.cost), sub.currency)}</p>
                             <p className="text-sm text-muted-foreground">
                                Next payment on {new Date(sub.nextBillingDate).toLocaleDateString()}
                            </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Badge variant="outline">{sub.category}</Badge>
                             <Badge variant={sub.status.toLowerCase() === 'active' ? 'default' : 'secondary'}>{normalizeStatus(sub.status)}</Badge>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">No subscriptions found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or add a new subscription.</p>
            </div>
        )}
    </div>
  );
}
