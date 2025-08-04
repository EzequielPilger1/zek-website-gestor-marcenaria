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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, ArrowLeft, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  status: "ativo" | "inativo" | "prospecto"
  dataCadastro: string
  observacoes: string
  userEmail: string
}

export default function ClientesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [message, setMessage] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    status: "prospecto" as "ativo" | "inativo" | "prospecto",
    observacoes: "",
  })

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    const email = localStorage.getItem("userEmail")
    if (auth === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
      loadClientes(email)
    } else {
      router.push("/login")
    }
  }, [router])

  const loadClientes = (email: string) => {
    const allClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    const userClientes = allClientes.filter((c: Cliente) => c.userEmail === email)
    setClientes(userClientes.sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.email) {
      setMessage("Nome e email são obrigatórios.")
      return
    }

    const allClientes = JSON.parse(localStorage.getItem("clientes") || "[]")

    if (editingCliente) {
      const updatedClientes = allClientes.map((c: Cliente) => (c.id === editingCliente.id ? { ...c, ...formData } : c))
      localStorage.setItem("clientes", JSON.stringify(updatedClientes))
      setMessage("Cliente atualizado com sucesso!")
    } else {
      const newCliente: Cliente = {
        id: Date.now().toString(),
        ...formData,
        dataCadastro: new Date().toLocaleDateString("pt-BR"),
        userEmail,
      }
      allClientes.push(newCliente)
      localStorage.setItem("clientes", JSON.stringify(allClientes))
      setMessage("Cliente adicionado com sucesso!")
    }

    loadClientes(userEmail)
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      status: "prospecto",
      observacoes: "",
    })
    setEditingCliente(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      status: cliente.status,
      observacoes: cliente.observacoes,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const allClientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    const updatedClientes = allClientes.filter((c: Cliente) => c.id !== id)
    localStorage.setItem("clientes", JSON.stringify(updatedClientes))
    loadClientes(userEmail)
    setMessage("Cliente excluído com sucesso!")
  }

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: "Cliente Ativo", color: "bg-green-100 text-green-800" },
      inativo: { label: "Ex-Cliente", color: "bg-gray-100 text-gray-800" },
      prospecto: { label: "Prospecto", color: "bg-blue-100 text-blue-800" },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    if (filtroStatus === "todos") return true
    return cliente.status === filtroStatus
  })

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Gestão de Clientes
              </h1>
            </div>
            <span className="text-sm text-blue-700 font-medium">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">{message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCliente ? "Editar Cliente" : "Adicionar Novo Cliente"}</DialogTitle>
                <DialogDescription>Preencha os dados do cliente para adicionar à sua base.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="joao@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status do Cliente</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ativo" | "inativo" | "prospecto") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospecto">Prospecto (Interessado)</SelectItem>
                        <SelectItem value="ativo">Cliente Ativo</SelectItem>
                        <SelectItem value="inativo">Ex-Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Notas sobre o cliente, preferências, histórico..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingCliente ? "Atualizar Cliente" : "Adicionar Cliente"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Clientes</SelectItem>
              <SelectItem value="prospecto">Prospectos</SelectItem>
              <SelectItem value="ativo">Clientes Ativos</SelectItem>
              <SelectItem value="inativo">Ex-Clientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="border-blue-200 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-blue-800">{cliente.nome}</CardTitle>
                    <CardDescription className="text-blue-600">Cadastrado em {cliente.dataCadastro}</CardDescription>
                  </div>
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div className="mt-2">{getStatusBadge(cliente.status)}</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cliente.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700">{cliente.telefone}</span>
                    </div>
                  )}
                  {cliente.endereco && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700 text-xs">{cliente.endereco}</span>
                    </div>
                  )}
                  {cliente.observacoes && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">{cliente.observacoes}</div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cliente)}
                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cliente.id)}
                    className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {clientesFiltrados.length === 0 && (
          <Card className="text-center py-12 border-blue-200 bg-white/50">
            <CardContent>
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                {filtroStatus === "todos" ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"}
              </h3>
              <p className="text-blue-600 mb-4">
                {filtroStatus === "todos"
                  ? "Comece adicionando clientes à sua base."
                  : "Tente alterar o filtro para ver outros clientes."}
              </p>
              {filtroStatus === "todos" && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resumo */}
        <Card className="mt-8 border-blue-200 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800">Resumo da Base de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{clientes.length}</div>
                <div className="text-sm text-blue-600">Total de Clientes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {clientes.filter((c) => c.status === "ativo").length}
                </div>
                <div className="text-sm text-green-600">Clientes Ativos</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {clientes.filter((c) => c.status === "prospecto").length}
                </div>
                <div className="text-sm text-blue-600">Prospectos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">
                  {clientes.filter((c) => c.status === "inativo").length}
                </div>
                <div className="text-sm text-gray-600">Ex-Clientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
