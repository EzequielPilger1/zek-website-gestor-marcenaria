"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { Alert, AlertTitle } from "@/components/ui/alert"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  exclusoes: {
    pintura: boolean
    eletrica: boolean
    encanamento: boolean
    alvenaria: boolean
    impermeabilizacao: boolean
    acabamentos: boolean
  }
  exclusoesPersonalizadas: string[]
  totais: {
    materiais: number
    totalGeral: number
    totalParcelado: number
  }
  userEmail: string
}

export default function CriarOrcamentoPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [materiais, setMateriais] = useState<Material[]>([])
  const [itensOrcamento, setItensOrcamento] = useState<ItemOrcamento[]>([])
  const [message, setMessage] = useState("")
  const router = useRouter()

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
    } else {
      router.push("/login")
    }
  }, [router])

  const loadMateriais = (email: string) => {
    const allMateriais = JSON.parse(localStorage.getItem("materiais") || "[]")
    const userMateriais = allMateriais.filter((m: Material) => m.userEmail === email)
    setMateriais(userMateriais)
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

    const novoOrcamento: Orcamento = {
      id: Date.now().toString(),
      titulo: tituloOrcamento,
      data: new Date().toLocaleDateString("pt-BR"),
      itens: itensOrcamento,
      margemLucro: Number.parseFloat(margemLucro) || 0,
      taxaMaquininha: Number.parseFloat(taxaMaquininha) || 0,
      usarTaxaMaquininha,
      exclusoes,
      exclusoesPersonalizadas,
      totais,
      userEmail,
    }

    const allOrcamentos = JSON.parse(localStorage.getItem("orcamentos") || "[]")
    allOrcamentos.push(novoOrcamento)
    localStorage.setItem("orcamentos", JSON.stringify(allOrcamentos))

    setMessage("Orçamento salvo com sucesso!")

    // Limpar formulário
    setTituloOrcamento("")
    setItensOrcamento([])
    setMargemLucro("")
    setTaxaMaquininha("")
    setUsarTaxaMaquininha(false)
    setExclusoes({
      pintura: false,
      eletrica: false,
      encanamento: false,
      alvenaria: false,
      impermeabilizacao: false,
      acabamentos: false,
    })
    setExclusoesPersonalizadas([])
  }

  const gerarPDF = () => {
    if (itensOrcamento.length === 0) {
      setMessage("Adicione materiais antes de gerar o PDF.")
      return
    }

    const totais = calcularTotais()
    const empresa = JSON.parse(localStorage.getItem("perfilEmpresa") || "{}")

    // Criar conteúdo HTML para o PDF
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
      color: #1a202c; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
      box-shadow: 0 0 50px rgba(0,0,0,0.3);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center; 
      padding: 40px 30px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    .company-name { 
      font-size: 32px; 
      font-weight: 700; 
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      position: relative;
      z-index: 2;
    }
    .company-info { 
      font-size: 16px; 
      opacity: 0.95;
      line-height: 1.8;
      position: relative;
      z-index: 2;
    }
    .content-wrapper {
      padding: 40px;
    }
    .title { 
      font-size: 28px; 
      font-weight: 700; 
      text-align: center; 
      color: #2d3748;
      margin-bottom: 30px;
      position: relative;
      padding-bottom: 15px;
    }
    .title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
    }
    .date-project {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 12px;
      border-left: 5px solid #667eea;
    }
    .date { 
      color: #4a5568; 
      font-size: 14px;
      font-weight: 500;
    }
    .project-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .table-container {
      margin: 30px 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    th { 
      background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%); 
      color: white; 
      font-weight: 600; 
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 20px 16px;
      text-align: left;
    }
    td {
      padding: 16px;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
      background: white;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    tr:hover td {
      background: #edf2f7;
      transition: background 0.3s ease;
    }
    .text-right { text-align: right; }
    .total-section { 
      background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%); 
      padding: 30px; 
      border-radius: 16px; 
      margin: 40px 0; 
      border: 2px solid #48bb78;
      box-shadow: 0 8px 25px rgba(72, 187, 120, 0.2);
      position: relative;
      overflow: hidden;
    }
    .total-section::before {
      content: '💰';
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 40px;
      opacity: 0.3;
    }
    .total-row { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 15px; 
      font-size: 16px;
      font-weight: 500;
    }
    .total-final { 
      font-size: 24px; 
      font-weight: 700; 
      color: #2f855a; 
      border-top: 3px solid #48bb78; 
      padding-top: 20px; 
      margin-top: 20px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .exclusions-section {
      margin: 40px 0;
      padding: 25px;
      background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
      border: 2px solid #e53e3e;
      border-radius: 16px;
      box-shadow: 0 8px 25px rgba(229, 62, 62, 0.2);
      position: relative;
    }
    .exclusions-section::before {
      content: '⚠️';
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 30px;
    }
    .exclusions-title {
      color: #c53030;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .exclusions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    .exclusion-item {
      font-size: 14px;
      color: #742a2a;
      font-weight: 500;
      padding: 8px 12px;
      background: rgba(255,255,255,0.7);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-section {
      margin: 40px 0;
      padding: 30px;
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border: 2px solid #3182ce;
      border-radius: 16px;
      box-shadow: 0 8px 25px rgba(49, 130, 206, 0.2);
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .info-block h4 {
      color: #2c5282;
      font-weight: 700;
      margin-bottom: 15px;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-block p {
      margin-bottom: 8px;
      color: #2d3748;
      font-size: 14px;
    }
    .footer { 
      margin-top: 60px; 
      text-align: center; 
      color: #4a5568; 
      font-size: 12px; 
      padding: 30px;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 12px;
      border-top: 3px solid #667eea;
    }
    .footer p {
      margin-bottom: 5px;
    }
    .footer .highlight {
      font-weight: 600;
      color: #2d3748;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
      .header::before { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-name">${empresa.nome || "Sua Empresa de Marcenaria"}</div>
      <div class="company-info">
        ${empresa.dono ? `Proprietário: ${empresa.dono}<br>` : ""}
        ${empresa.cnpj ? `CNPJ: ${empresa.cnpj}<br>` : ""}
        ${empresa.telefone ? `Telefone: ${empresa.telefone}` : ""}
      </div>
    </div>
    
    <div class="content-wrapper">
      <div class="title">ORÇAMENTO PROFISSIONAL</div>
      
      <div class="date-project">
        <div class="project-title">${tituloOrcamento}</div>
        <div class="date">Data: ${new Date().toLocaleDateString("pt-BR")}</div>
      </div>
      
      <div class="table-container">
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
      </div>
      
      <div class="total-section">
        <div class="total-row">
          <span>Subtotal de Materiais:</span>
          <span>R$ ${totais.materiais.toFixed(2)}</span>
        </div>
        <div class="total-row total-final">
          <span>TOTAL À VISTA:</span>
          <span>R$ ${totais.totalGeral.toFixed(2)}</span>
        </div>
        ${
          usarTaxaMaquininha
            ? `
          <div class="total-row total-final" style="color: #2c5282;">
            <span>TOTAL PARCELADO:</span>
            <span>R$ ${totais.totalParcelado.toFixed(2)}</span>
          </div>
        `
            : ""
        }
      </div>
      
      ${
        Object.values(exclusoes).some(Boolean) || exclusoesPersonalizadas.length > 0
          ? `
      <div class="exclusions-section">
        <div class="exclusions-title">
          ❌ NÃO INCLUÍDO NESTE ORÇAMENTO
        </div>
        <div class="exclusions-grid">
          ${exclusoes.pintura ? '<div class="exclusion-item">❌ Pintura</div>' : ""}
          ${exclusoes.eletrica ? '<div class="exclusion-item">❌ Instalação elétrica</div>' : ""}
          ${exclusoes.encanamento ? '<div class="exclusion-item">❌ Encanamento</div>' : ""}
          ${exclusoes.alvenaria ? '<div class="exclusion-item">❌ Alvenaria</div>' : ""}
          ${exclusoes.impermeabilizacao ? '<div class="exclusion-item">❌ Impermeabilização</div>' : ""}
          ${exclusoes.acabamentos ? '<div class="exclusion-item">❌ Acabamentos especiais</div>' : ""}
          ${exclusoesPersonalizadas.map((exclusao) => `<div class="exclusion-item">❌ ${exclusao}</div>`).join("")}
        </div>
      </div>
      `
          : ""
      }
      
      <div class="info-section">
        <div class="info-grid">
          <div class="info-block">
            <h4>📅 PRAZOS E VALIDADE</h4>
            <p><strong>Validade do Orçamento:</strong> 30 dias</p>
            <p><strong>Prazo de Entrega:</strong> 15 dias úteis</p>
            <p><strong>Garantia:</strong> 12 meses</p>
          </div>
          <div class="info-block">
            <h4>💳 FORMAS DE PAGAMENTO</h4>
            <p><strong>À Vista:</strong> 70% no fechamento + 30% na instalação</p>
            <p><strong>Cartão:</strong> Até 8x no fechamento do contrato</p>
            <p><strong>PIX:</strong> 5% de desconto adicional</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p class="highlight">Orçamento válido por 30 dias</p>
      <p>Valores sujeitos a alteração sem aviso prévio • Materiais sujeitos à disponibilidade</p>
      <p style="margin-top: 15px; font-style: italic; color: #667eea;">Obrigado pela confiança em nossos serviços!</p>
    </div>
  </div>
</body>
</html>
`

    // Abrir em nova janela para impressão/salvamento
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

  const totais = calcularTotais()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Criar Orçamento</h1>
            </div>
            <span className="text-sm text-gray-600">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertTitle>{message}</AlertTitle>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Título do Orçamento */}
            <Card className="overflow-hidden border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardTitle className="flex items-center gap-2">📋 Informações do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Orçamento</Label>
                  <Input
                    id="titulo"
                    value={tituloOrcamento}
                    onChange={(e) => setTituloOrcamento(e.target.value)}
                    placeholder="Ex: Deck de Madeira - Cliente João"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Materiais */}
            <Card className="overflow-hidden border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle className="flex items-center gap-2">📦 Adicionar Materiais</CardTitle>
                <CardDescription className="text-green-100">Selecione materiais do seu catálogo</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                      <SelectTrigger>
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
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={adicionarMaterial} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Materiais */}
            {itensOrcamento.length > 0 && (
              <Card className="overflow-hidden border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                  <CardTitle className="flex items-center gap-2">📋 Materiais do Orçamento</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {itensOrcamento.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-teal-200 shadow-sm"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-teal-800">{item.nome}</h4>
                          <p className="text-sm text-teal-600">
                            {item.quantidade} {item.unidade} × R$ {item.valorUnitario.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-teal-800">R$ {item.total.toFixed(2)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerMaterial(item.id)}
                            className="text-red-600 hover:text-red-700"
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
            <Card className="overflow-hidden border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardTitle className="flex items-center gap-2">⚙️ Configurações Internas</CardTitle>
                <CardDescription className="text-amber-100">
                  Estas informações são apenas para seu controle e não aparecerão no orçamento do cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-amber-700">Margem de Lucro (%)</Label>
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
                </div>
              </CardContent>
            </Card>

            {/* Configurações Adicionais */}
            <Card className="overflow-hidden border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-500 to-gray-500 text-white">
                <CardTitle className="flex items-center gap-2">🔧 Configurações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="taxaMaquininha"
                      checked={usarTaxaMaquininha}
                      onCheckedChange={setUsarTaxaMaquininha}
                    />
                    <Label htmlFor="taxaMaquininha">Adicionar Taxa da Maquininha</Label>
                  </div>

                  {usarTaxaMaquininha && (
                    <div className="space-y-2">
                      <Label>Taxa da Maquininha (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxaMaquininha}
                        onChange={(e) => setTaxaMaquininha(e.target.value)}
                        placeholder="3.5"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Exclusões Opcionais para PDF */}
            <Card className="overflow-hidden border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-2">❌ Exclusões no Orçamento (Opcional)</CardTitle>
                <CardDescription className="text-red-100">
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
                    <Label htmlFor="excluir-pintura" className="text-sm">
                      Pintura
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-eletrica"
                      checked={exclusoes.eletrica}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, eletrica: checked })}
                    />
                    <Label htmlFor="excluir-eletrica" className="text-sm">
                      Instalação elétrica
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-encanamento"
                      checked={exclusoes.encanamento}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, encanamento: checked })}
                    />
                    <Label htmlFor="excluir-encanamento" className="text-sm">
                      Encanamento
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-alvenaria"
                      checked={exclusoes.alvenaria}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, alvenaria: checked })}
                    />
                    <Label htmlFor="excluir-alvenaria" className="text-sm">
                      Alvenaria
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-impermeabilizacao"
                      checked={exclusoes.impermeabilizacao}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, impermeabilizacao: checked })}
                    />
                    <Label htmlFor="excluir-impermeabilizacao" className="text-sm">
                      Impermeabilização
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excluir-acabamentos"
                      checked={exclusoes.acabamentos}
                      onCheckedChange={(checked) => setExclusoes({ ...exclusoes, acabamentos: checked })}
                    />
                    <Label htmlFor="excluir-acabamentos" className="text-sm">
                      Acabamentos especiais
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exclusões Personalizadas */}
            <Card className="overflow-hidden border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-2">✏️ Exclusões Personalizadas</CardTitle>
                <CardDescription className="text-purple-100">
                  Adicione textos personalizados de itens não incluídos no orçamento
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
            <Card className="sticky top-4 overflow-hidden border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <CardTitle className="flex items-center gap-2">💰 Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Materiais:</span>
                    <span className="font-medium">R$ {totais.materiais.toFixed(2)}</span>
                  </div>

                  <hr />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total à Vista:</span>
                    <span className="text-green-600">R$ {totais.totalGeral.toFixed(2)}</span>
                  </div>

                  {usarTaxaMaquininha && (
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Parcelado:</span>
                      <span className="text-blue-600">R$ {totais.totalParcelado.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <Button onClick={salvarOrcamento} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Orçamento
                  </Button>
                  <Button onClick={gerarPDF} variant="outline" className="w-full bg-transparent">
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
