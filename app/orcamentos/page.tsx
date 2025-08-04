"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Trash2, ArrowLeft, Eye, Edit } from "lucide-react"
import Link from "next/link"

interface Orcamento {
  id: string
  titulo: string
  data: string
  itens: any[]
  ajudante: {
    diaria: number
    dias: number
    transporte: number
    alimentacao: number
  }
  margemLucro: number
  taxaMaquininha: number
  usarTaxaMaquininha: boolean
  totais: {
    materiais: number
    maoObra: number
    custosAdicionais: number
    totalGeral: number
    totalParcelado: number
  }
  userEmail: string
}

export default function OrcamentosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    const email = localStorage.getItem("userEmail")
    if (auth === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
      loadOrcamentos(email)
    } else {
      router.push("/login")
    }
  }, [router])

  const loadOrcamentos = (email: string) => {
    const allOrcamentos = JSON.parse(localStorage.getItem("orcamentos") || "[]")
    const userOrcamentos = allOrcamentos.filter((o: Orcamento) => o.userEmail === email)
    setOrcamentos(userOrcamentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()))
  }

  const handleDelete = (id: string) => {
    const allOrcamentos = JSON.parse(localStorage.getItem("orcamentos") || "[]")
    const updatedOrcamentos = allOrcamentos.filter((o: Orcamento) => o.id !== id)
    localStorage.setItem("orcamentos", JSON.stringify(updatedOrcamentos))
    loadOrcamentos(userEmail)
    setMessage("Orçamento excluído com sucesso!")
  }

  const gerarPDF = (orcamento: Orcamento) => {
    const empresa = JSON.parse(localStorage.getItem("perfilEmpresa") || "{}")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orçamento - ${orcamento.titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .company-info { font-size: 14px; color: #666; }
          .title { font-size: 20px; font-weight: bold; margin: 30px 0 20px 0; text-align: center; }
          .date { text-align: right; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .text-right { text-align: right; }
          .total-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total-final { font-size: 18px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; position: fixed; bottom: 20px; width: 100%; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${empresa.nome || "Sua Empresa"}</div>
          <div class="company-info">
            ${empresa.dono ? `Proprietário: ${empresa.dono}<br>` : ""}
            ${empresa.cnpj ? `CNPJ: ${empresa.cnpj}<br>` : ""}
            ${empresa.telefone ? `Telefone: ${empresa.telefone}` : ""}
          </div>
        </div>
        
        <div class="title">ORÇAMENTO</div>
        <div class="date">Data: ${orcamento.data}</div>
        
        <h3>${orcamento.titulo}</h3>
        
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Unidade</th>
              <th class="text-right">Qtd</th>
              <th class="text-right">Valor Unit.</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orcamento.itens
              .map(
                (item) => `
              <tr>
                <td>${item.nome}</td>
                <td>${item.unidade}</td>
                <td class="text-right">${item.quantidade}</td>
                <td class="text-right">R$ ${item.valorUnitario.toFixed(2)}</td>
                <td class="text-right">R$ ${item.total.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>Total de Materiais:</span>
            <span>R$ ${orcamento.totais.materiais.toFixed(2)}</span>
          </div>
          ${
            orcamento.totais.maoObra > 0
              ? `
            <div class="total-row">
              <span>Mão de Obra:</span>
              <span>R$ ${orcamento.totais.maoObra.toFixed(2)}</span>
            </div>
          `
              : ""
          }
          ${
            orcamento.totais.custosAdicionais > 0
              ? `
            <div class="total-row">
              <span>Custos Adicionais:</span>
              <span>R$ ${orcamento.totais.custosAdicionais.toFixed(2)}</span>
            </div>
          `
              : ""
          }
          <div class="total-row total-final">
            <span>Total à Vista:</span>
            <span>R$ ${orcamento.totais.totalGeral.toFixed(2)}</span>
          </div>
          ${
            orcamento.usarTaxaMaquininha
              ? `
            <div class="total-row total-final">
              <span>Total Parcelado:</span>
              <span>R$ ${orcamento.totais.totalParcelado.toFixed(2)}</span>
            </div>
          `
              : ""
          }
        </div>
        
        <div>
            <p style="font-size: 10px; color: #888; margin-top: 20px;">
              *Este orçamento pode ser alterado ou cancelado sem aviso prévio.
            </p>
            <p style="font-size: 10px; color: #888;">
              *Validade do orçamento: 30 dias.
            </p>
        </div>

        <div class="footer">
          <p>Orçamento válido por 30 dias. Valores sujeitos a alteração sem aviso prévio.</p>
        </div>
      </body>
      </html>
    `

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()
      newWindow.print()
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Orçamentos Salvos</h1>
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

        <div className="mb-6">
          <Link href="/criar-orcamento">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Criar Novo Orçamento
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orcamentos.map((orcamento) => (
            <Card key={orcamento.id}>
              <CardHeader>
                <CardTitle className="text-lg">{orcamento.titulo}</CardTitle>
                <CardDescription>Data: {orcamento.data}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Materiais:</span>
                    <span>{orcamento.itens.length} itens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total à Vista:</span>
                    <span className="font-medium text-green-600">R$ {orcamento.totais.totalGeral.toFixed(2)}</span>
                  </div>
                  {orcamento.usarTaxaMaquininha && (
                    <div className="flex justify-between text-sm">
                      <span>Total Parcelado:</span>
                      <span className="font-medium text-blue-600">R$ {orcamento.totais.totalParcelado.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/orcamentos/${orcamento.id}/editar`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => gerarPDF(orcamento)}
                    className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(orcamento.id)}
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

        {orcamentos.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento salvo</h3>
              <p className="text-gray-600 mb-4">Comece criando seu primeiro orçamento profissional.</p>
              <Link href="/criar-orcamento">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Criar Primeiro Orçamento
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
