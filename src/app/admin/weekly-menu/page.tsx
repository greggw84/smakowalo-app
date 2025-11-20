'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  X,
  Loader2,
  Calendar,
  ChefHat,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

export default function WeeklyMenuAdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menus, setMenus] = useState<any[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)

  // New menu form
  const [newMenu, setNewMenu] = useState({
    week_start_date: '',
    week_end_date: '',
    label: '',
    copy_from_id: ''
  })

  useEffect(() => {
    if (!supabase) return

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        alert('Brak uprawnień administratora')
        router.push('/panel')
        return
      }

      setSession(session)
      await loadMenus(session)
    }

    checkAuth()
  }, [router])

  const loadMenus = async (session: any) => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/weekly-menu', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setMenus(data.menus || [])
      }

    } catch (error) {
      console.error('Error loading menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMenu = async () => {
    if (!newMenu.week_start_date || !newMenu.week_end_date || !newMenu.label) {
      alert('Wypełnij wszystkie pola')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/admin/weekly-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...newMenu,
          copy_from_menu_id: newMenu.copy_from_id || null
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('✅ Menu utworzone!')
        setShowCreateDialog(false)
        setNewMenu({ week_start_date: '', week_end_date: '', label: '', copy_from_id: '' })
        await loadMenus(session)
      } else {
        throw new Error(result.error)
      }

    } catch (error: any) {
      alert(`❌ Błąd: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (menuId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/weekly-menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          menu_id: menuId,
          is_active: !isActive,
          is_published: true
        })
      })

      const result = await response.json()
      if (result.success) {
        await loadMenus(session)
      }

    } catch (error) {
      console.error('Error toggling active:', error)
    }
  }

  const handleDelete = async (menuId: string) => {
    if (!confirm('Czy na pewno usunąć to menu?')) return

    try {
      const response = await fetch(`/api/admin/weekly-menu?id=${menuId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        await loadMenus(session)
      } else {
        alert(result.error)
      }

    } catch (error: any) {
      alert(`❌ Błąd: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Zarządzanie Menu Tygodniowym
            </h1>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowy Tydzień
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {menus.length === 0 ? (
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
                onClick={() => setShowCreateDialog(true)}
                className="bg-[var(--smakowalo-green-primary)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Utwórz Menu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {menus.map((menu) => (
              <Card key={menu.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold">{menu.label}</h3>
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

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(menu.week_start_date).toLocaleDateString('pl-PL')} - {new Date(menu.week_end_date).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChefHat className="w-4 h-4" />
                          <span>Utworzono: {new Date(menu.created_at).toLocaleDateString('pl-PL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(menu.id, menu.is_active)}
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

                      <Link href={`/admin/weekly-menu/${menu.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edytuj
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewMenu({
                            ...newMenu,
                            copy_from_id: menu.id,
                            label: `Kopia: ${menu.label}`
                          })
                          setShowCreateDialog(true)
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Kopiuj
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(menu.id)}
                        className="text-red-600 hover:bg-red-50"
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Utwórz Nowe Menu Tygodniowe</DialogTitle>
            <DialogDescription>
              Wypełnij dane nowego menu lub skopiuj z istniejącego
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data rozpoczęcia</label>
                <input
                  type="date"
                  value={newMenu.week_start_date}
                  onChange={(e) => setNewMenu({ ...newMenu, week_start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data zakończenia</label>
                <input
                  type="date"
                  value={newMenu.week_end_date}
                  onChange={(e) => setNewMenu({ ...newMenu, week_end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Label (nazwa)</label>
              <input
                type="text"
                value={newMenu.label}
                onChange={(e) => setNewMenu({ ...newMenu, label: e.target.value })}
                placeholder="np. Tydzień 25.11-1.12.2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {menus.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Skopiuj z (opcjonalne)</label>
                <select
                  value={newMenu.copy_from_id}
                  onChange={(e) => setNewMenu({ ...newMenu, copy_from_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Nie kopiuj --</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Jeśli wybierzesz "Skopiuj z", wszystkie produkty z wybranego menu
                  zostaną skopiowane do nowego menu.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleCreateMenu}
              disabled={creating}
              className="bg-[var(--smakowalo-green-primary)]"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tworzenie...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Utwórz Menu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
