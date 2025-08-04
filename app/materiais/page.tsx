"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Package, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Material {
  id: string
  nome: string
  categoria: string
  unidade: string
  valorUnitario: number
  userEmail: string
}

interface Categoria {
  id: string
  nome: string
  userEmail: string
}

export default function MateriaisPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [materiais, setMateriais] = useState<Material[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    unidade: "m²",
    valorUnitario: "",
  })

  const [novaCategoria, setNovaCategoria] = useState("")

  const unidades = ["m²", "unidade", "metro linear", "litro", "kg", "m³", "peça"]

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    const email = localStorage.getItem("userEmail")
    if (auth === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
      loadMateriais(email)
      loadCategorias(email)
    } else {
      router.push("/login")
    }
  }, [router])

  const loadMateriais = (email: string) => {
    const allMateriais = JSON.parse(localStorage.getItem("materiais") || "[]")
    const userMateriais = allMateriais.filter((m: Material) => m.userEmail === email)
    setMateriais(userMateriais)
  }

  const loadCategorias = (email: string) => {
    const allCategorias = JSON.parse(localStorage.getItem("categorias") || "[]")
    const userCategorias = allCategorias.filter((c: Categoria) => c.userEmail === email)
    setCategorias(userCategorias)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.categoria || !formData.valorUnitario) {
      setMessage("Preencha todos os campos obrigatórios.")
      return
    }

    const allMateriais = JSON.parse(localStorage.getItem("materiais") || "[]")

    if (editingMaterial) {
      const updatedMateriais = allMateriais.map((m: Material) =>
        m.id === editingMaterial.id
          ? { ...m, ...formData, valorUnitario: Number.parseFloat(formData.valorUnitario) }
          : m,
      )
      localStorage.setItem("materiais", JSON.stringify(updatedMateriais))
      setMessage("Material atualizado com sucesso!")
    } else {
      const newMaterial: Material = {
        id: Date.now().toString(),
        nome: formData.nome,
        categoria: formData.categoria,
        unidade: formData.unidade,
        valorUnitario: Number.parseFloat(formData.valorUnitario),
        userEmail,
      }
      allMateriais.push(newMaterial)
      localStorage.setItem("materiais", JSON.stringify(allMateriais))
      setMessage("Material adicionado com sucesso!")
    }

    loadMateriais(userEmail)
    setFormData({ nome: "", categoria: "", unidade: "m²", valorUnitario: "" })
    setEditingMaterial(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      nome: material.nome,
      categoria: material.categoria,
      unidade: material.unidade,
      valorUnitario: material.valorUnitario.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const allMateriais = JSON.parse(localStorage.getItem("materiais") || "[]")
    const updatedMateriais = allMateriais.filter((m: Material) => m.id !== id)
    localStorage.setItem("materiais", JSON.stringify(updatedMateriais))
    loadMateriais(userEmail)
    setMessage("Material excluído com sucesso!")
  }

  const handleAddCategoria = (e: React.FormEvent) => {
    e.preventDefault()

    if (!novaCategoria) return

    const allCategorias = JSON.parse(localStorage.getItem("categorias") || "[]")
    const newCategoria: Categoria = {
      id: Date.now().toString(),
      nome: novaCategoria,
      userEmail,
    }
    allCategorias.push(newCategoria)
    localStorage.setItem("categorias", JSON.stringify(allCategorias))

    loadCategorias(userEmail)
    setNovaCategoria("")
    setIsCategoriaDialogOpen(false)
    setMessage("Categoria adicionada com sucesso!")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
            </div>
            <span className="text-sm text-gray-600">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMaterial ? "Editar Material" : "Adicionar Novo Material"}</DialogTitle>
                <DialogDescription>Preencha os dados do material para adicionar ao seu catálogo.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Material</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Tábua de Ipê"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.nome}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((unidade) => (
                        <SelectItem key={unidade} value={unidade}>
                          {unidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Unitário (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valorUnitario}
                    onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingMaterial ? "Atualizar Material" : "Adicionar Material"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                <DialogDescription>Crie uma nova categoria para organizar seus materiais.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategoria} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novaCategoria">Nome da Categoria</Label>
                  <Input
                    id="novaCategoria"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Ex: Madeiras, Ferragens, Acabamentos"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Adicionar Categoria
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiais.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{material.nome}</CardTitle>
                    <CardDescription>{material.categoria}</CardDescription>
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Unidade:</span>
                    <span className="text-sm font-medium">{material.unidade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valor:</span>
                    <span className="text-sm font-medium">R$ {material.valorUnitario.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(material)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(material.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {materiais.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum material cadastrado</h3>
              <p className="text-gray-600 mb-4">
                Comece adicionando materiais ao seu catálogo para usar nos orçamentos.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Material
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
