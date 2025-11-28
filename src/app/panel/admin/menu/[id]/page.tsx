"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  Loader2,
  Calendar,
  ChefHat,
  AlertCircle,
  ArrowLeft,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import type {
  WeeklyMenu,
  WeeklyMenuItemWithProduct,
  Product,
  DayOfWeek,
} from "@/types/menu";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, storageKey: "smakowalo_auth" },
      })
    : null;

// Day of week options
const DAY_OPTIONS: { value: DayOfWeek | ""; label: string }[] = [
  { value: "", label: "Wszystkie dni" },
  { value: "monday", label: "Poniedziałek" },
  { value: "tuesday", label: "Wtorek" },
  { value: "wednesday", label: "Środa" },
  { value: "thursday", label: "Czwartek" },
  { value: "friday", label: "Piątek" },
  { value: "saturday", label: "Sobota" },
  { value: "sunday", label: "Niedziela" },
];

export default function AdminMenuDetailPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params?.id as string;

  const [session, setSession] = useState<{
    access_token: string;
    user: { id: string; email?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [items, setItems] = useState<WeeklyMenuItemWithProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<WeeklyMenuItemWithProduct | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeek | "">("");
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth check and data loading
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadMenuDetail = async (accessToken: string) => {
      if (!menuId) return;

      try {
        setError(null);

        // Fetch menu details
        const response = await fetch(`/api/admin/weekly-menu/items?menu_id=${menuId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setMenu(data.menu);
          setItems(data.items || []);
        } else {
          setError(data.error || "Błąd podczas ładowania menu");
        }
      } catch (err) {
        console.error("Error loading menu:", err);
        setError("Błąd podczas ładowania menu");
      }
    };

    const loadProducts = async (accessToken: string) => {
      try {
        const response = await fetch("/api/admin/products", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login?callbackUrl=/panel/admin/menu");
          return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role !== "admin") {
          console.warn("User is not admin, access may be limited");
        }

        setSession(session);
        await Promise.all([
          loadMenuDetail(session.access_token),
          loadProducts(session.access_token),
        ]);
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Błąd podczas weryfikacji uprawnień");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, menuId]);

  // Function to reload menu detail (used after CRUD operations)
  const reloadMenuDetail = useCallback(
    async (accessToken: string) => {
      if (!menuId) return;

      try {
        setError(null);

        const response = await fetch(`/api/admin/weekly-menu/items?menu_id=${menuId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setMenu(data.menu);
          setItems(data.items || []);
        } else {
          setError(data.error || "Błąd podczas ładowania menu");
        }
      } catch (err) {
        console.error("Error loading menu:", err);
        setError("Błąd podczas ładowania menu");
      }
    },
    [menuId]
  );

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const search = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    );
  }, [products, productSearch]);

  const handleAddItem = async () => {
    if (!selectedProductId || !session) {
      setError("Wybierz produkt");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/weekly-menu/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          weekly_menu_id: Number(menuId),
          product_id: selectedProductId,
          day_of_week: selectedDayOfWeek || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowAddDialog(false);
        resetForm();
        await reloadMenuDetail(session.access_token);
      } else {
        setError(result.error || "Błąd podczas dodawania pozycji");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Błąd podczas dodawania pozycji");
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !selectedProductId || !session) {
      setError("Wybierz produkt");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/weekly-menu/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          item_id: editingItem.id,
          product_id: selectedProductId,
          day_of_week: selectedDayOfWeek || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditDialog(false);
        setEditingItem(null);
        resetForm();
        await reloadMenuDetail(session.access_token);
      } else {
        setError(result.error || "Błąd podczas aktualizacji pozycji");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Błąd podczas aktualizacji pozycji");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę pozycję?")) return;
    if (!session) return;

    try {
      const response = await fetch(`/api/admin/weekly-menu/items?id=${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        await reloadMenuDetail(session.access_token);
      } else {
        setError(result.error || "Błąd podczas usuwania pozycji");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Błąd podczas usuwania pozycji");
    }
  };

  const openEditDialog = (item: WeeklyMenuItemWithProduct) => {
    setEditingItem(item);
    setSelectedProductId(item.product_id);
    setSelectedDayOfWeek(item.day_of_week || "");
    setProductSearch("");
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setSelectedProductId(null);
    setSelectedDayOfWeek("");
    setProductSearch("");
    setError(null);
  };

  const getDayLabel = (day: DayOfWeek | null): string => {
    if (!day) return "Wszystkie dni";
    const option = DAY_OPTIONS.find((o) => o.value === day);
    return option?.label || day;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="/panel/admin/menu" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--smakowalo-green-primary)]" />
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="/panel/admin/menu" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Menu nie znalezione
              </h3>
              <p className="text-gray-600 mb-6">
                Nie udało się załadować menu o podanym ID
              </p>
              <Link href="/panel/admin/menu">
                <Button className="bg-[var(--smakowalo-green-primary)]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć do listy
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="/panel/admin/menu" />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/panel/admin/menu">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Powrót
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{menu.label}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(menu.week_start_date).toLocaleDateString("pl-PL")} -{" "}
                      {new Date(menu.week_end_date).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                  {menu.is_active && (
                    <Badge className="bg-green-100 text-green-800">Aktywne</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj Pozycję
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-600 text-sm underline mt-1"
              >
                Zamknij
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Brak pozycji w menu
              </h3>
              <p className="text-gray-600 mb-6">
                Dodaj produkty do tego menu tygodniowego
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="bg-[var(--smakowalo-green-primary)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj Pozycję
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Items list */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Product image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product?.image || item.product?.image_url ? (
                        <Image
                          src={item.product.image || item.product.image_url || ""}
                          alt={item.product?.name || "Product"}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.product?.name || `Produkt #${item.product_id}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getDayLabel(item.day_of_week)}
                      </p>
                      {item.product?.price && (
                        <p className="text-sm font-medium text-[var(--smakowalo-green-primary)] mt-1">
                          {item.product.price.toFixed(2)} zł
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <div className="mt-6 text-sm text-gray-600">
            Łącznie: {items.length} pozycji w menu
          </div>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj Pozycję do Menu</DialogTitle>
            <DialogDescription>
              Wybierz produkt i opcjonalnie dzień tygodnia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product search */}
            <div>
              <Label htmlFor="product-search">Szukaj produktu</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="product-search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Wpisz nazwę produktu..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Product list */}
            <div>
              <Label>Wybierz produkt *</Label>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    Brak produktów do wyświetlenia
                  </p>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 text-left ${
                        selectedProductId === product.id
                          ? "bg-green-50 border-l-4 border-l-[var(--smakowalo-green-primary)]"
                          : ""
                      }`}
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        {product.image || product.image_url ? (
                          <Image
                            src={product.image || product.image_url || ""}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        {product.price && (
                          <p className="text-xs text-gray-500">
                            {product.price.toFixed(2)} zł
                          </p>
                        )}
                      </div>
                      {selectedProductId === product.id && (
                        <Check className="w-5 h-5 text-[var(--smakowalo-green-primary)]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Day of week */}
            <div>
              <Label htmlFor="day-of-week">Dzień tygodnia (opcjonalnie)</Label>
              <select
                id="day-of-week"
                value={selectedDayOfWeek}
                onChange={(e) => setSelectedDayOfWeek(e.target.value as DayOfWeek | "")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--smakowalo-green-primary)] focus:border-[var(--smakowalo-green-primary)]"
              >
                {DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={saving}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={saving || !selectedProductId}
              className="bg-[var(--smakowalo-green-primary)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Dodawanie...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edytuj Pozycję</DialogTitle>
            <DialogDescription>Zmień produkt lub dzień tygodnia</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product search */}
            <div>
              <Label htmlFor="edit-product-search">Szukaj produktu</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="edit-product-search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Wpisz nazwę produktu..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Product list */}
            <div>
              <Label>Wybierz produkt *</Label>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    Brak produktów do wyświetlenia
                  </p>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 text-left ${
                        selectedProductId === product.id
                          ? "bg-green-50 border-l-4 border-l-[var(--smakowalo-green-primary)]"
                          : ""
                      }`}
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        {product.image || product.image_url ? (
                          <Image
                            src={product.image || product.image_url || ""}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        {product.price && (
                          <p className="text-xs text-gray-500">
                            {product.price.toFixed(2)} zł
                          </p>
                        )}
                      </div>
                      {selectedProductId === product.id && (
                        <Check className="w-5 h-5 text-[var(--smakowalo-green-primary)]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Day of week */}
            <div>
              <Label htmlFor="edit-day-of-week">Dzień tygodnia (opcjonalnie)</Label>
              <select
                id="edit-day-of-week"
                value={selectedDayOfWeek}
                onChange={(e) => setSelectedDayOfWeek(e.target.value as DayOfWeek | "")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--smakowalo-green-primary)] focus:border-[var(--smakowalo-green-primary)]"
              >
                {DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={saving}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleEditItem}
              disabled={saving || !selectedProductId}
              className="bg-[var(--smakowalo-green-primary)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Zapisz
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
