"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, ArrowLeft, Save, FileText } from "lucide-react"
import Link from "next/link"

interface Material {
  id: string
  nome: string
  categoria: string
  unidade: string
  valorUnitario: number
  userEmail: string
}

interface ItemOrcamento {
  id: string
  materialId: string
  nome: string
  unidade: string
  valorUnitario: number
  quantidade: number
  total: number
}

interface Orcamento {
  id: string
  titulo: string
  data: string
  itens: ItemOrcamento[]
  margemLucro: number
  taxaMaquininha: number
  usarTaxaMaquininha: boolean
  totais: {
    materiais: number
    totalGeral: number
    totalParcelado: number
  }
  userEmail: string
  exclusoes: {
    pintura: boolean
    eletrica: boolean
    encanamento: boolean
    alvenaria: boolean
    impermeabilizacao: boolean
    acabamentos: boolean
  }
  exclusoesPersonalizadas: string[]
}

export default function EditarOrcamentoPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [materiais, setMateriais] = useState<Material[]>([])
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [itensOrcamento, setItensOrcamento] = useState<ItemOrcamento[]>([])
  const [message, setMessage] = useState("")
  const router = useRouter()
  const params = useParams()

  const [tituloOrcamento, setTituloOrcamento] = useState("")
  const [materialSelecionado, setMaterialSelecionado] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [margemLucro, setMargemLucro] = useState("")
  const [taxaMaquininha, setTaxaMaquininha] = useState("")
  const [usarTaxaMaquininha, setUsarTaxaMaquininha] = useState(false)
  const [exclusoes, setExclusoes] = useState({
    pintura: false,
    eletrica: false,
    encanamento: false,
    alvenaria: false,
    impermeabilizacao: false,
    acabamentos: false,
  })
  const [exclusoesPersonalizadas, setExclusoesPersonalizadas] = useState<string[]>([])
  const [novaExclusao, setNovaExclusao] = useState("")

  useEffect(() => {
    const auth = localStorage.getItem("auth")
    const email = localStorage.getItem("userEmail")
    if (auth === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
      loadMateriais(email)
      loadOrcamento(params.id as string, email)
    } else {
      router.push("/login")
    }
  }, [router, params.id])

  const loadMateriais = (email: string) => {
    const allMateriais = JSON.parse(localStorage.getItem("materiais") || "[]")
    const userMateriais = allMateriais.filter((m: Material) => m.userEmail === email)
    setMateriais(userMateriais)
  }

  const loadOrcamento = (id: string, email: string) => {
    const allOrcamentos = JSON.parse(localStorage.getItem("orcamentos") || "[]")
    const orcamentoEncontrado = allOrcamentos.find((o: Orcamento) => o.id === id && o.userEmail === email)

    if (orcamentoEncontrado) {
      setOrcamento(orcamentoEncontrado)
      setTituloOrcamento(orcamentoEncontrado.titulo)
      setItensOrcamento(orcamentoEncontrado.itens)
      setMargemLucro(orcamentoEncontrado.margemLucro.toString())
      setTaxaMaquininha(orcamentoEncontrado.taxaMaquininha.toString())
      setUsarTaxaMaquininha(orcamentoEncontrado.usarTaxaMaquininha)
      setExclusoes(
        orcamentoEncontrado.exclusoes || {
          pintura: false,
          eletrica: false,
          encanamento: false,
          alvenaria: false,
          impermeabilizacao: false,
          acabamentos: false,
        },
      )
      setExclusoesPersonalizadas(orcamentoEncontrado.exclusoesPersonalizadas || [])
    } else {
      setMessage("Orçamento não encontrado.")
      router.push("/orcamentos")
    }
  }

  const adicionarMaterial = () => {
    if (!materialSelecionado || !quantidade) {
      setMessage("Selecione um material e informe a quantidade.")
      return
    }

    const material = materiais.find((m) => m.id === materialSelecionado)
    if (!material) return

    const novoItem: ItemOrcamento = {
      id: Date.now().toString(),
      materialId: material.id,
      nome: material.nome,
      unidade: material.unidade,
      valorUnitario: material.valorUnitario,
      quantidade: Number.parseFloat(quantidade),
      total: material.valorUnitario * Number.parseFloat(quantidade),
    }

    setItensOrcamento([...itensOrcamento, novoItem])
    setMaterialSelecionado("")
    setQuantidade("")
    setMessage("Material adicionado ao orçamento!")
  }

  const removerMaterial = (id: string) => {
    setItensOrcamento(itensOrcamento.filter((item) => item.id !== id))
  }

  const adicionarExclusaoPersonalizada = () => {
    if (novaExclusao.trim() && !exclusoesPersonalizadas.includes(novaExclusao.trim())) {
      setExclusoesPersonalizadas([...exclusoesPersonalizadas, novaExclusao.trim()])
      setNovaExclusao("")
      setMessage("Exclusão personalizada adicionada!")
    }
  }

  const removerExclusaoPersonalizada = (index: number) => {
    setExclusoesPersonalizadas(exclusoesPersonalizadas.filter((_, i) => i !== index))
  }

  const calcularTotais = () => {
    const totalMateriais = itensOrcamento.reduce((sum, item) => sum + item.total, 0)
    const margem = Number.parseFloat(margemLucro) || 0
    const totalComMargem = totalMateriais * (1 + margem / 100)
    const taxa = Number.parseFloat(taxaMaquininha) || 0
    const totalParcelado = usarTaxaMaquininha ? totalComMargem * (1 + taxa / 100) : totalComMargem

    return {
      materiais: totalMateriais,
      totalGeral: totalComMargem,
      totalParcelado: totalParcelado,
    }
  }

  const salvarOrcamento = () => {
    if (!tituloOrcamento || itensOrcamento.length === 0) {
      setMessage("Informe um título e adicione pelo menos um material.")
      return
    }

    const totais = calcularTotais()

    const orcamentoAtualizado: Orcamento = {
      ...orcamento!,
      titulo: tituloOrcamento,
      itens: itensOrcamento,
      margemLucro: Number.parseFloat(margemLucro) || 0,
      taxaMaquininha: Number.parseFloat(taxaMaquininha) || 0,
      usarTaxaMaquininha,
      exclusoes,
      exclusoesPersonalizadas,
      totais,
    }

    const allOrcamentos = JSON.parse(localStorage.getItem("orcamentos") || "[]")
    const updatedOrcamentos = allOrcamentos.map((o: Orcamento) => (o.id === orcamento!.id ? orcamentoAtualizado : o))
    localStorage.setItem("orcamentos", JSON.stringify(updatedOrcamentos))

    setMessage("Orçamento atualizado com sucesso!")
    setTimeout(() => {
      router.push("/orcamentos")
    }, 2000)
  }

  const gerarPDF = () => {
    if (itensOrcamento.length === 0) {
      setMessage("Adicione materiais antes de gerar o PDF.")
      return
    }

    const totais = calcularTotais()
    const empresa = JSON.parse(localStorage.getItem("perfilEmpresa") || "{}")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orçamento - ${tituloOrcamento}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2d3748; 
            background: white;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #0f766e; 
            padding-bottom: 30px; 
            margin-bottom: 40px; 
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
            padding: 30px;
            border-radius: 12px;
          }
          .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #0f766e; 
            margin-bottom: 8px; 
          }
          .company-info { 
            font-size: 16px; 
            color: #0d9488; 
            line-height: 1.8;
          }
          .title { 
            font-size: 24px; 
            font-weight: bold; 
            margin: 40px 0 20px 0; 
            text-align: center; 
            color: #0f766e;
            background: linear-gradient(135deg, #0f766e, #0d9488);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .date { 
            text-align: right; 
            margin-bottom: 30px; 
            color: #64748b; 
            font-size: 14px;
          }
          .project-title {
            font-size: 20px;
            font-weight: 600;
            color: #0f766e;
            margin-bottom: 30px;
            padding: 15px;
            background: #f0fdfa;
            border-left: 4px solid #0f766e;
            border-radius: 0 8px 8px 0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td { 
            padding: 16px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0; 
          }
          th { 
            background: linear-gradient(135deg, #0f766e, #0d9488); 
            color: white; 
            font-weight: 600; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            background: white;
            font-size: 14px;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          .text-right { text-align: right; }
          .total-section { 
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); 
            padding: 30px; 
            border-radius: 12px; 
            margin-top: 30px; 
            border: 2px solid #0f766e;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            font-size: 16px;
          }
          .total-final { 
            font-size: 20px; 
            font-weight: bold; 
            color: #0f766e; 
            border-top: 2px solid #0f766e; 
            padding-top: 15px; 
            margin-top: 15px;
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #64748b; 
            font-size: 12px; 
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border-top: 3px solid #0f766e;
          }
          @media print {
            body { padding: 20px; }
            .header { break-inside: avoid; }
            .total-section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${empresa.nome || "Sua Empresa de Marcenaria"}</div>
          <div class="company-info">
            ${empresa.dono ? `Proprietário: ${empresa.dono}<br>` : ""}
            ${empresa.cnpj ? `CNPJ: ${empresa.cnpj}<br>` : ""}
            ${empresa.telefone ? `Telefone: ${empresa.telefone}` : ""}
          </div>
        </div>
        
        <div class="title">ORÇAMENTO PROFISSIONAL</div>
        <div class="date">Data: ${new Date().toLocaleDateString("pt-BR")}</div>
        
        <div class="project-title">${tituloOrcamento}</div>
        
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Unidade</th>
              <th class="text-right">Quantidade</th>
              <th class="text-right">Valor Unitário</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itensOrcamento
              .map(
                (item) => `
              <tr>
                <td><strong>${item.nome}</strong></td>
                <td>${item.unidade}</td>
                <td class="text-right">${item.quantidade}</td>
                <td class="text-right">R$ ${item.valorUnitario.toFixed(2)}</td>
                <td class="text-right"><strong>R$ ${item.total.toFixed(2)}</strong></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span><strong>Subtotal de Materiais:</strong></span>
            <span><strong>R$ ${totais.materiais.toFixed(2)}</strong></span>
          </div>
          <div class="total-row total-final">
            <span>TOTAL À VISTA:</span>
            <span>R$ ${totais.totalGeral.toFixed(2)}</span>
          </div>
          ${
            usarTaxaMaquininha
              ? `
            <div class="total-row total-final" style="color: #0369a1;">
              <span>TOTAL PARCELADO:</span>
              <span>R$ ${totais.totalParcelado.toFixed(2)}</span>
            </div>
          `
              : ""
          }
        </div>
        
        ${
          Object.values(exclusoes).some(Boolean)
            ? `
<div style="margin-top: 30px; padding: 20px; background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px;">
  <h4 style="color: #dc2626; font-size: 16px; font-weight: bold; margin-bottom: 15px;">❌ NÃO INCLUÍDO NESTE ORÇAMENTO:</h4>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; color: #7f1d1d;">
    ${exclusoes.pintura ? "<div>❌ Pintura</div>" : ""}
    ${exclusoes.eletrica ? "<div>❌ Instalação elétrica</div>" : ""}
    ${exclusoes.encanamento ? "<div>❌ Encanamento</div>" : ""}
    ${exclusoes.alvenaria ? "<div>❌ Alvenaria</div>" : ""}
    ${exclusoes.impermeabilizacao ? "<div>❌ Impermeabilização</div>" : ""}
    ${exclusoes.acabamentos ? "<div>❌ Acabamentos especiais</div>" : ""}
  </div>
</div>
`
            : ""
        }

        ${
          exclusoesPersonalizadas.length > 0
            ? `
<div style="margin-top: 30px; padding: 20px; background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px;">
  <h4 style="color: #dc2626; font-size: 16px; font-weight: bold; margin-bottom: 15px;">❌ ITENS NÃO INCLUÍDOS:</h4>
  <div style="font-size: 14px; color: #7f1d1d;">
    ${exclusoesPersonalizadas.map((exclusao) => `<div>❌ ${exclusao}</div>`).join("")}
  </div>
</div>
`
            : ""
        }
        
        <div style="margin-top: 20px; padding: 20px; background: #f0f9ff; border: 2px solid #0369a1; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px;">
            <div>
              <h4 style="color: #0369a1; font-weight: bold; margin-bottom: 10px;">📅 PRAZOS:</h4>
              <p><strong>Validade do Orçamento:</strong> 30 dias</p>
              <p><strong>Prazo de Entrega:</strong> 15 dias úteis</p>
            </div>
            <div>
              <h4 style="color: #0369a1; font-weight: bold; margin-bottom: 10px;">💳 FORMAS DE PAGAMENTO:</h4>
              <p><strong>À Vista:</strong> 70% no fechamento + 30% na instalação</p>
              <p><strong>Cartão:</strong> Até 8x no fechamento do contrato</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Orçamento válido por 30 dias</strong></p>
          <p>Valores sujeitos a alteração sem aviso prévio • Materiais sujeitos à disponibilidade</p>
          <p style="margin-top: 10px; font-style: italic;">Obrigado pela preferência!</p>
        </div>
      </body>
      </html>
    `

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()

      // Aguardar o carregamento completo antes de imprimir
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print()
        }, 500)
      }
    }
  }

  if (!isAuthenticated || !orcamento) {
    return null
  }

  const totais = calcularTotais()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/orcamentos">
                <Button variant="ghost" size="sm" className="hover:bg-amber-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Editar Orçamento
              </h1>
            </div>
            <span className="text-sm text-amber-700 font-medium">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Título do Orçamento */}
            <Card className="border-amber-200 bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle>Informações do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-amber-800 font-medium">
                    Título do Orçamento
                  </Label>
                  <Input
                    id="titulo"
                    value={tituloOrcamento}
                    onChange={(e) => setTituloOrcamento(e.target.value)}
                    placeholder="Ex: Deck de Madeira - Cliente João"
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Materiais */}
            <Card className="border-amber-200 bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle>Adicionar Materiais</CardTitle>
                <CardDescription className="text-amber-100">Selecione materiais do seu catálogo</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-amber-800 font-medium">Material</Label>
                    <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                      <SelectTrigger className="border-amber-200 focus:border-amber-400">
                        <SelectValue placeholder="Selecione um material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materiais.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.nome} - R$ {material.valorUnitario.toFixed(2)}/{material.unidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-amber-800 font-medium">Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="0"
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={adicionarMaterial}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Materiais */}
            {itensOrcamento.length > 0 && (
              <Card className="border-amber-200 bg-white/70 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                  <CardTitle>Materiais do Orçamento</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {itensOrcamento.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-800">{item.nome}</h4>
                          <p className="text-sm text-amber-600">
                            {item.quantidade} {item.unidade} × R$ {item.valorUnitario.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-amber-800">R$ {item.total.toFixed(2)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerMaterial(item.id)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configurações Internas */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-800">Configurações Internas</CardTitle>
                <CardDescription className="text-amber-600">
                  Estas informações são apenas para seu controle e não aparecerão no orçamento do cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-amber-700 font-medium">Margem de Lucro (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={margemLucro}
                      onChange={(e) => setMargemLucro(e.target.value)}
                      placeholder="20"
                      className="border-amber-200 focus:border-amber-400"
                    />
                    <p className="text-xs text-amber-600 bg-amber-100 p-2 rounded">
                      ℹ️ Esta margem é apenas para seu controle interno e não será exibida no PDF do cliente
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="taxaMaquininha"
                      checked={usarTaxaMaquininha}
                      onCheckedChange={setUsarTaxaMaquininha}
                    />
                    <Label htmlFor="taxaMaquininha" className="text-amber-700 font-medium">
                      Adicionar Taxa da Maquininha
                    </Label>
                  </div>

                  {usarTaxaMaquininha && (
                    <div className="space-y-2">
                      <Label className="text-amber-700 font-medium">Taxa da Maquininha (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxaMaquininha}
                        onChange={(e) => setTaxaMaquininha(e.target.value)}
                        placeholder="3.5"
                        className="border-amber-200 focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Exclusões Opcionais para PDF */}
            <Card className="border-amber-200 bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle>Exclusões no Orçamento (Opcional)</CardTitle>
                <CardDescription className="text-amber-100">
                  Selecione os itens que NÃO estão incluídos no orçamento
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-pintura"
                      checked={exclusoes.pintura}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, pintura: checked })}
                    />
                    <Label htmlFor="excluir-pintura" className="text-sm text-amber-800">
                      Pintura
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-eletrica"
                      checked={exclusoes.eletrica}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, eletrica: checked })}
                    />
                    <Label htmlFor="excluir-eletrica" className="text-sm text-amber-800">
                      Instalação elétrica
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-encanamento"
                      checked={exclusoes.encanamento}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, encanamento: checked })}
                    />
                    <Label htmlFor="excluir-encanamento" className="text-sm text-amber-800">
                      Encanamento
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-alvenaria"
                      checked={exclusoes.alvenaria}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, alvenaria: checked })}
                    />
                    <Label htmlFor="excluir-alvenaria" className="text-sm text-amber-800">
                      Alvenaria
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-impermeabilizacao"
                      checked={exclusoes.impermeabilizacao}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, impermeabilizacao: checked })}
                    />
                    <Label htmlFor="excluir-impermeabilizacao" className="text-sm text-amber-800">
                      Impermeabilização
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-acabamentos"
                      checked={exclusoes.acabamentos}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, acabamentos: checked })}
                    />
                    <Label htmlFor="excluir-acabamentos" className="text-sm text-amber-800">
                      Acabamentos especiais
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exclusões Personalizadas */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">✏️ Exclusões Personalizadas</CardTitle>
                <CardDescription className="text-purple-100">
                  Adicione textos personalizados de itens não incluídos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={novaExclusao}
                      onChange={(e) => setNovaExclusao(e.target.value)}
                      placeholder="Ex: Instalação de tomadas, Remoção de entulho..."
                      className="flex-1 border-purple-200 focus:border-purple-400"
                      onKeyPress={(e) => e.key === "Enter" && adicionarExclusaoPersonalizada()}
                    />
                    <Button
                      onClick={adicionarExclusaoPersonalizada}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {exclusoesPersonalizadas.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-purple-800 font-medium">Exclusões Adicionadas:</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {exclusoesPersonalizadas.map((exclusao, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
                          >
                            <span className="text-sm text-purple-800">❌ {exclusao}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerExclusaoPersonalizada(index)}
                              className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Orçamento */}
          <div className="space-y-6">
            <Card className="sticky top-4 border-emerald-200 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle>Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Total de Materiais:</span>
                    <span className="font-medium text-emerald-800">R$ {totais.materiais.toFixed(2)}</span>
                  </div>

                  <hr className="border-emerald-200" />

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-emerald-800">Total à Vista:</span>
                    <span className="text-emerald-600">R$ {totais.totalGeral.toFixed(2)}</span>
                  </div>

                  {usarTaxaMaquininha && (
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-blue-800">Total Parcelado:</span>
                      <span className="text-blue-600">R$ {totais.totalParcelado.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <Button
                    onClick={salvarOrcamento}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button
                    onClick={gerarPDF}
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
