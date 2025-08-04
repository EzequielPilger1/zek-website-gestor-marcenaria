"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hammer, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [whitelistMessage, setWhitelistMessage] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Admin login
    if (email === "admin@admin.com" && password === "123456") {
      localStorage.setItem("auth", "true")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("isAdmin", "true")
      router.push("/")
      return
    }

    // Client login - check whitelist
    const whitelist = JSON.parse(localStorage.getItem("whitelist") || "[]")
    if (whitelist.includes(email)) {
      localStorage.setItem("auth", "true")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("isAdmin", "false")
      router.push("/")
      return
    }

    setError("Email ou senha incorretos, ou email não autorizado pelo administrador.")
  }

  const handleAddToWhitelist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientEmail) return

    const whitelist = JSON.parse(localStorage.getItem("whitelist") || "[]")
    if (!whitelist.includes(newClientEmail)) {
      whitelist.push(newClientEmail)
      localStorage.setItem("whitelist", JSON.stringify(whitelist))
      setWhitelistMessage(`Email ${newClientEmail} adicionado à lista de clientes autorizados.`)
      setNewClientEmail("")
    } else {
      setWhitelistMessage("Este email já está na lista de clientes autorizados.")
    }
  }

  const isAdmin = email === "admin@admin.com"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-lg shadow-md">
        <CardHeader className="text-center p-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Hammer className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Orçamentos Marcenaria</CardTitle>
          <CardDescription>Faça login para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Entrar
                </Button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Acesso Admin:</h3>
                <p className="text-xs text-gray-600">Email: admin@admin.com</p>
                <p className="text-xs text-gray-600">Senha: 123456</p>
              </div>
            </TabsContent>

            <TabsContent value="admin">
              {isAdmin && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Liberar Cliente</h3>
                  <form onSubmit={handleAddToWhitelist} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Email do Cliente</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="cliente@email.com"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                      Adicionar à Lista de Clientes
                    </Button>
                  </form>
                  {whitelistMessage && (
                    <Alert>
                      <AlertDescription>{whitelistMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Clientes Autorizados:</h4>
                    <div className="space-y-1">
                      {JSON.parse(localStorage.getItem("whitelist") || "[]").map(
                        (clientEmail: string, index: number) => (
                          <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {clientEmail}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!isAdmin && (
                <Alert>
                  <AlertDescription>Faça login como administrador para gerenciar clientes.</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
