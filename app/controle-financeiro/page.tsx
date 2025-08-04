"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, ArrowLeft, Save, Calculator, Filter } from "lucide-react"
import Link from "next/link"

interface Gasto {
  id: string
  data: string
  tipo: "ajudante" | "transporte" | "alimentacao" | "outros"
  descricao: string
  valor: number
  observacoes: string
  userEmail: string
}

export default function ControleFinanceiroPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [message, setMessage] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("mes")
  const router = useRouter()

  const [formData, setFormData] = useState({
    tipo: "ajudante" as "ajudante" | "transporte" | "alimentacao" | "outros",
    descricao: "",
    valor: "",
    observacoes: "",
  })

  const tiposGasto = {
    ajudante: { label: "Diária do Ajudante", color: "bg-blue-100 text-blue-800", icon: "👷" },
    transporte: { label: "Transporte", color: "bg-green-100 text-green-800", icon: "🚗" },
    alimentacao: { label: "Alimentação", color: "bg-orange-100 text-orange-800", icon: "🍽️" },
    outros: { label: "Outros Custos", color: "bg-purple-100 text-purple-800", icon: "💰" },
  }

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    const email = localStorage.getItem("userEmail")
    if (auth === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
      loadGastos(email)
    } else {
      router.push("/login")
    }
  }, [router])

  const loadGastos = (email: string) => {
    const allGastos = JSON.parse(localStorage.getItem("gastos") || "[]")
    const userGastos = allGastos.filter((g: Gasto) => g.userEmail === email)
    setGastos(userGastos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.descricao || !formData.valor) {
      setMessage("Descrição e valor são obrigatórios.")
      return
    }

    const novoGasto: Gasto = {
      id: Date.now().toString(),
      data: new Date().toISOString().split("T")[0],
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: Number.parseFloat(formData.valor),
      observacoes: formData.observacoes,
      userEmail,
    }

    const allGastos = JSON.parse(localStorage.getItem("gastos") || "[]")
    allGastos.push(novoGasto)
    localStorage.setItem("gastos", JSON.stringify(allGastos))

    loadGastos(userEmail)
    setFormData({
      tipo: "ajudante",
      descricao: "",
      valor: "",
      observacoes: "",
    })
    setMessage("Gasto registrado com sucesso!")
  }

  const handleDelete = (id: string) => {
    const allGastos = JSON.parse(localStorage.getItem("gastos") || "[]")
    const updatedGastos = allGastos.filter((g: Gasto) => g.id !== id)
    localStorage.setItem("gastos", JSON.stringify(updatedGastos))
    loadGastos(userEmail)
    setMessage("Gasto excluído com sucesso!")
  }

  const filtrarGastos = () => {
    let gastosFiltrados = gastos

    // Filtro por tipo
    if (filtroTipo !== "todos") {
      gastosFiltrados = gastosFiltrados.filter((gasto) => gasto.tipo === filtroTipo)
    }

    // Filtro por período
    const hoje = new Date()
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()))
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    gastosFiltrados = gastosFiltrados.filter((gasto) => {
      const dataGasto = new Date(gasto.data)
      switch (filtroPeriodo) {
        case "dia":
          return dataGasto.toDateString() === new Date().toDateString()
        case "semana":
          return dataGasto >= inicioSemana
        case "mes":
          return dataGasto >= inicioMes
        default:
          return true
      }
    })

    return gastosFiltrados
  }

  const calcularTotais = (gastosFiltrados: Gasto[]) => {
    const totais = {
      ajudante: 0,
      transporte: 0,
      alimentacao: 0,
      outros: 0,
      total: 0,
    }

    gastosFiltrados.forEach((gasto) => {
      totais[gasto.tipo] += gasto.valor
      totais.total += gasto.valor
    })

    return totais
  }

  if (!isAuthenticated) {
    return null
  }

  const gastosFiltrados = filtrarGastos()
  const totais = calcularTotais(gastosFiltrados)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-emerald-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Controle de Custos
              </h1>
            </div>
            <span className="text-sm text-emerald-700 font-medium">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-emerald-800">{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Registro */}
          <Card className="border-emerald-200 bg-white/70 backdrop-blur-sm shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Registrar Novo Gasto
              </CardTitle>
              <CardDescription className="text-emerald-100">Adicione um novo custo ao controle</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-emerald-800 font-medium">Tipo de Gasto</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: "ajudante" | "transporte" | "alimentacao" | "outros") =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tiposGasto).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-800 font-medium">Descrição</Label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Ajudante João - 1 dia, Combustível, Almoço..."
                    className="border-emerald-200 focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-800 font-medium">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    placeholder="0.00"
                    className="border-emerald-200 focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-800 font-medium">Observações</Label>
                  <Input
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Detalhes adicionais..."
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Gasto
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Gastos e Filtros */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtros */}
            <Card className="border-emerald-200 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-emerald-700">Tipo de Gasto</Label>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Tipos</SelectItem>
                        {Object.entries(tiposGasto).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.icon} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-700">Período</Label>
                    <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dia">Hoje</SelectItem>
                        <SelectItem value="semana">Esta Semana</SelectItem>
                        <SelectItem value="mes">Este Mês</SelectItem>
                        <SelectItem value="todos">Todos os Períodos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo de Totais */}
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-800">Resumo de Custos</CardTitle>
                <CardDescription className="text-emerald-600">
                  Período:{" "}
                  {filtroPeriodo === "dia"
                    ? "Hoje"
                    : filtroPeriodo === "semana"
                      ? "Esta Semana"
                      : filtroPeriodo === "mes"
                        ? "Este Mês"
                        : "Todos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(tiposGasto).map(([key, config]) => (
                    <div key={key} className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-lg font-bold text-emerald-700">
                        R$ {totais[key as keyof typeof totais].toFixed(2)}
                      </div>
                      <div className="text-xs text-emerald-600">
                        {config.icon} {config.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-emerald-100 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-800">R$ {totais.total.toFixed(2)}</div>
                  <div className="text-sm text-emerald-600">Total de Custos</div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Gastos */}
            <Card className="border-emerald-200 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-800">Histórico de Gastos</CardTitle>
                <CardDescription className="text-emerald-600">
                  {gastosFiltrados.length} registro(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gastosFiltrados.map((gasto) => {
                    const config = tiposGasto[gasto.tipo]
                    return (
                      <div
                        key={gasto.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-emerald-50 rounded-lg border border-emerald-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={config.color}>
                              {config.icon} {config.label}
                            </Badge>
                            <span className="text-xs text-emerald-600">
                              {new Date(gasto.data).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <h4 className="font-medium text-emerald-800">{gasto.descricao}</h4>
                          {gasto.observacoes && <p className="text-sm text-emerald-600 mt-1">{gasto.observacoes}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-800 text-lg">R$ {gasto.valor.toFixed(2)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(gasto.id)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {gastosFiltrados.length === 0 && (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-emerald-800 mb-2">Nenhum gasto encontrado</h3>
                    <p className="text-emerald-600">
                      {filtroTipo !== "todos" || filtroPeriodo !== "todos"
                        ? "Tente alterar os filtros para ver outros gastos."
                        : "Comece registrando seus primeiros custos."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
