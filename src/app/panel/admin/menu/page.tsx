"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  X,
  Loader2,
  Calendar,
  ChefHat,
  AlertCircle,
  ArrowLeft,
  Eye,
  List,
} from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import type {
  WeeklyMenu,
  WeeklyMenuWithCount,
  WeeklyMenuFormData,
} from "@/types/menu";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, storageKey: "smakowalo_auth" },
      })
    : null;

export default function AdminMenuPage() {
  const router = useRouter();
  const [session, setSession] = useState<{
    access_token: string;
    user: { id: string; email?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<WeeklyMenuWithCount[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMenu, setEditingMenu] = useState<WeeklyMenu | null>(null);
  const [formData, setFormData] = useState<WeeklyMenuFormData>({
    week_start_date: "",
    week_end_date: "",
    label: "",
    is_active: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

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

        // TODO: If no role column exists, you can comment out this check
        // and allow all authenticated users for now
        if (profile?.role !== "admin") {
          // For now, we'll show an error but not redirect
          // This allows testing without admin role
          console.warn("User is not admin, access may be limited");
          // Uncomment below to enforce admin role:
          // setError('Brak uprawnień administratora');
          // router.push('/panel');
          // return;
        }

        setIsAdmin(profile?.role === "admin");
        setSession(session);
        await loadMenus(session.access_token);
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Błąd podczas weryfikacji uprawnień");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadMenus = useCallback(async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/weekly-menu", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMenus(data.menus || []);
      } else {
        setError(data.error || "Błąd podczas ładowania menu");
      }
    } catch (err) {
      console.error("Error loading menus:", err);
      setError("Błąd podczas ładowania menu");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateMenu = async () => {
    if (
      !formData.week_start_date ||
      !formData.week_end_date ||
      !formData.label
    ) {
      setError("Wypełnij wszystkie wymagane pola");
      return;
    }

    if (!session) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/weekly-menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          week_start_date: formData.week_start_date,
          week_end_date: formData.week_end_date,
          label: formData.label,
          is_active: formData.is_active,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateDialog(false);
        resetForm();
        await loadMenus(session.access_token);
      } else {
        setError(result.error || "Błąd podczas tworzenia menu");
      }
    } catch (err) {
      console.error("Error creating menu:", err);
      setError("Błąd podczas tworzenia menu");
    } finally {
      setSaving(false);
    }
  };

  const handleEditMenu = async () => {
    if (!editingMenu || !session) return;

    if (
      !formData.week_start_date ||
      !formData.week_end_date ||
      !formData.label
    ) {
      setError("Wypełnij wszystkie wymagane pola");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/weekly-menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          menu_id: editingMenu.id,
          week_start_date: formData.week_start_date,
          week_end_date: formData.week_end_date,
          label: formData.label,
          is_active: formData.is_active,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditDialog(false);
        setEditingMenu(null);
        resetForm();
        await loadMenus(session.access_token);
      } else {
        setError(result.error || "Błąd podczas aktualizacji menu");
      }
    } catch (err) {
      console.error("Error updating menu:", err);
      setError("Błąd podczas aktualizacji menu");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (menu: WeeklyMenu) => {
    if (!session) return;

    try {
      const response = await fetch("/api/admin/weekly-menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          menu_id: menu.id,
          is_active: !menu.is_active,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadMenus(session.access_token);
      } else {
        setError(result.error || "Błąd podczas zmiany statusu");
      }
    } catch (err) {
      console.error("Error toggling active:", err);
      setError("Błąd podczas zmiany statusu");
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć to menu?")) return;
    if (!session) return;

    try {
      const response = await fetch(`/api/admin/weekly-menu?id=${menuId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        await loadMenus(session.access_token);
      } else {
        setError(result.error || "Błąd podczas usuwania menu");
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      setError("Błąd podczas usuwania menu");
    }
  };

  const openEditDialog = (menu: WeeklyMenu) => {
    setEditingMenu(menu);
    setFormData({
      week_start_date: menu.week_start_date,
      week_end_date: menu.week_end_date,
      label: menu.label,
      is_active: menu.is_active,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      week_start_date: "",
      week_end_date: "",
      label: "",
      is_active: false,
    });
    setError(null);
  };

  const getItemsCount = (menu: WeeklyMenuWithCount): number => {
    if (menu.items && menu.items.length > 0) {
      return menu.items[0]?.count || 0;
    }
    return 0;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="/panel/admin/menu" />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/panel">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Panel
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Zarządzanie Menu Tygodniowym
                </h1>
                <p className="text-sm text-gray-600">
                  Twórz i edytuj menu na poszczególne tygodnie
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
              className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowe Menu
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

        {/* Admin warning if not admin */}
        {!isAdmin && session && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800">
              {/* TODO: Implement proper admin role check. Currently showing panel to all authenticated users. */}
              Uwaga: Ta strona wymaga uprawnień administratora. Jeśli nie
              widzisz danych, skontaktuj się z administratorem.
            </p>
          </div>
        )}

        {/* Empty state */}
        {menus.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Brak menu tygodniowych
              </h3>
              <p className="text-gray-600 mb-6">
                Utwórz pierwsze menu na nadchodzący tydzień
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateDialog(true);
                }}
                className="bg-[var(--smakowalo-green-primary)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Utwórz Menu
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Menus list */}
        {menus.length > 0 && (
          <div className="space-y-4">
            {menus.map((menu) => (
              <Card key={menu.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {menu.label}
                        </h3>
                        {menu.is_active && (
                          <Badge className="bg-green-100 text-green-800">
                            Aktywne
                          </Badge>
                        )}
                        {menu.is_published && !menu.is_active && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Opublikowane
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(menu.week_start_date).toLocaleDateString(
                              "pl-PL"
                            )}{" "}
                            -{" "}
                            {new Date(menu.week_end_date).toLocaleDateString(
                              "pl-PL"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <List className="w-4 h-4" />
                          <span>{getItemsCount(menu)} pozycji</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChefHat className="w-4 h-4" />
                          <span>
                            Utworzono:{" "}
                            {new Date(menu.created_at).toLocaleDateString(
                              "pl-PL"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(menu)}
                        title={
                          menu.is_active
                            ? "Dezaktywuj menu"
                            : "Aktywuj menu (tylko jedno może być aktywne)"
                        }
                      >
                        {menu.is_active ? (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Dezaktywuj
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Aktywuj
                          </>
                        )}
                      </Button>

                      <Link href={`/panel/admin/menu/${menu.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Pozycje
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(menu)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edytuj
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="text-red-600 hover:bg-red-50"
                        disabled={getItemsCount(menu) > 0}
                        title={
                          getItemsCount(menu) > 0
                            ? "Nie można usunąć menu z pozycjami"
                            : "Usuń menu"
                        }
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
      </div>

      {/* Create Menu Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Utwórz Nowe Menu Tygodniowe</DialogTitle>
            <DialogDescription>
              Wypełnij dane nowego menu tygodniowego
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="create-label">Nazwa menu *</Label>
              <Input
                id="create-label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="np. Menu tydzień 25.11-01.12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-start-date">Data rozpoczęcia *</Label>
                <Input
                  id="create-start-date"
                  type="date"
                  value={formData.week_start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      week_start_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="create-end-date">Data zakończenia *</Label>
                <Input
                  id="create-end-date"
                  type="date"
                  value={formData.week_end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, week_end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-is-active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-[var(--smakowalo-green-primary)] rounded"
              />
              <Label htmlFor="create-is-active" className="font-normal">
                Aktywuj menu (dezaktywuje inne aktywne menu)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={saving}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleCreateMenu}
              disabled={saving}
              className="bg-[var(--smakowalo-green-primary)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tworzenie...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Utwórz
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edytuj Menu</DialogTitle>
            <DialogDescription>Zaktualizuj dane menu</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-label">Nazwa menu *</Label>
              <Input
                id="edit-label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="np. Menu tydzień 25.11-01.12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start-date">Data rozpoczęcia *</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={formData.week_start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      week_start_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-end-date">Data zakończenia *</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={formData.week_end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, week_end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is-active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-[var(--smakowalo-green-primary)] rounded"
              />
              <Label htmlFor="edit-is-active" className="font-normal">
                Aktywuj menu (dezaktywuje inne aktywne menu)
              </Label>
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
              onClick={handleEditMenu}
              disabled={saving}
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
