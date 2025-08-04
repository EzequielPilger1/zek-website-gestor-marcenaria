"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Building2, Save, Upload } from "lucide-react"
import Link from "next/link"

interface PerfilEmpresa {
  nome: string
  dono: string
  cnpj: string
  telefone: string
  logo: string
}

export default function PerfilEmpresaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const [perfil, setPerfil] = useState<PerfilEmpresa>({
    nome: "",
    dono: "",
    cnpj: "",
    telefone: "",
    logo: "",
  })

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    const email = localStorage.getItem("userEmail")
    if (auth === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
      loadPerfil()
    } else {
      router.push("/login")
    }
  }, [router])

  const loadPerfil = () => {
    const savedPerfil = localStorage.getItem("perfilEmpresa")
    if (savedPerfil) {
      setPerfil(JSON.parse(savedPerfil))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    localStorage.setItem("perfilEmpresa", JSON.stringify(perfil))
    setMessage("Perfil da empresa salvo com sucesso!")
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPerfil({ ...perfil, logo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>
            </div>
            <span className="text-sm text-gray-600">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>Configure os dados da sua empresa que aparecerão nos orçamentos em PDF.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo da Empresa */}
              <div className="space-y-4">
                <Label>Logo da Empresa</Label>
                <div className="flex items-center gap-4">
                  {perfil.logo && (
                    <div className="w-20 h-20 border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={perfil.logo || "/placeholder.svg"}
                        alt="Logo da empresa"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {perfil.logo ? "Alterar Logo" : "Fazer Upload do Logo"}
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 2MB</p>
                  </div>
                </div>
              </div>

              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input
                  id="nome"
                  value={perfil.nome}
                  onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                  placeholder="Ex: Marcenaria Silva & Filhos"
                />
              </div>

              {/* Nome do Dono */}
              <div className="space-y-2">
                <Label htmlFor="dono">Nome do Proprietário</Label>
                <Input
                  id="dono"
                  value={perfil.dono}
                  onChange={(e) => setPerfil({ ...perfil, dono: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={perfil.cnpj}
                  onChange={(e) => setPerfil({ ...perfil, cnpj: formatCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={perfil.telefone}
                  onChange={(e) => setPerfil({ ...perfil, telefone: formatTelefone(e.target.value) })}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>

              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Perfil da Empresa
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview do Cabeçalho do PDF */}
        {(perfil.nome || perfil.dono || perfil.cnpj || perfil.telefone) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview do Cabeçalho do PDF</CardTitle>
              <CardDescription>Assim aparecerão os dados da sua empresa nos orçamentos em PDF.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-white">
                <div className="text-center border-b-2 border-blue-600 pb-4">
                  {perfil.logo && (
                    <div className="w-16 h-16 mx-auto mb-3 overflow-hidden rounded">
                      <img
                        src={perfil.logo || "/placeholder.svg"}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="text-xl font-bold text-blue-600 mb-1">{perfil.nome || "Nome da Empresa"}</div>
                  <div className="text-sm text-gray-600">
                    {perfil.dono && `Proprietário: ${perfil.dono}`}
                    {perfil.dono && (perfil.cnpj || perfil.telefone) && <br />}
                    {perfil.cnpj && `CNPJ: ${perfil.cnpj}`}
                    {perfil.cnpj && perfil.telefone && <br />}
                    {perfil.telefone && `Telefone: ${perfil.telefone}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
