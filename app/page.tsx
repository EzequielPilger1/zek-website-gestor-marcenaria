"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Package, Building2, Calculator, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    const email = localStorage.getItem("userEmail")
    if (auth === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
    } else {
      router.push("/login")
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Orçamentos Marcenaria</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("auth")
                  localStorage.removeItem("userEmail")
                  router.push("/login")
                }}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao Sistema de Orçamentos</h2>
          <p className="text-gray-600">Gerencie seus orçamentos de marcenaria de forma profissional</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/criar-orcamento">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-amber-700 text-xl">Criar Orçamento Novo</CardTitle>
                <CardDescription className="text-amber-600">Inicie um novo orçamento profissional</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/orcamentos">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-green-200 hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-green-700 text-xl">Orçamentos</CardTitle>
                <CardDescription className="text-green-600">Visualize e gerencie orçamentos salvos</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/materiais">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-brown-200 hover:border-brown-400 bg-gradient-to-br from-brown-50 to-amber-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-brown-400 to-amber-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-brown-700 text-xl">Materiais</CardTitle>
                <CardDescription className="text-brown-600">Gerencie materiais e categorias</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/controle-financeiro">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Calculator className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-emerald-700 text-xl">Controle Financeiro</CardTitle>
                <CardDescription className="text-emerald-600">Gerencie custos operacionais</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/clientes">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-blue-700 text-xl">Clientes</CardTitle>
                <CardDescription className="text-blue-600">Gerencie sua base de clientes</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/perfil-empresa">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-teal-200 hover:border-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-teal-700 text-xl">Perfil da Empresa</CardTitle>
                <CardDescription className="text-teal-600">Configure dados da sua empresa</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-blue-100">
          <CardHeader>
            <CardTitle className="text-gray-900 text-xl">Resumo Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">
                  {JSON.parse(localStorage.getItem("orcamentos") || "[]").length}
                </div>
                <div className="text-sm text-gray-600">Orçamentos Salvos</div>
              </div>
              <div className="text-center p-4 bg-brown-50 rounded-lg">
                <div className="text-2xl font-bold text-brown-700">
                  {JSON.parse(localStorage.getItem("materiais") || "[]").length}
                </div>
                <div className="text-sm text-gray-600">Materiais Cadastrados</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-700">
                  {JSON.parse(localStorage.getItem("categorias") || "[]").length}
                </div>
                <div className="text-sm text-gray-600">Categorias</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
