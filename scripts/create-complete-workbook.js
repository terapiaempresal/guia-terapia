const fs = require('fs');
const path = require('path');

const workbookPageContent = `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface WorkbookResponse {
  field_key: string
  value: string
}

export default function WorkbookPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [responses, setResponses] = useState<Record<string, string>>({})

  // Verificar autenticação
  useEffect(() => {
    const employeeId = localStorage.getItem('employeeId')
    const userType = localStorage.getItem('userType')

    if (!employeeId || userType !== 'funcionario') {
      window.location.href = '/login'
      return
    }

    loadResponses()
  }, [])

  // Carregar respostas salvas
  const loadResponses = async () => {
    try {
      const employeeToken = localStorage.getItem('employeeToken')
      if (!employeeToken) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/workbook/responses', {
        headers: {
          'Authorization': \`Bearer \${employeeToken}\`
        }
      })

      if (response.ok) {
        const data: WorkbookResponse[] = await response.json()
        const responsesMap: Record<string, string> = {}
        data.forEach(item => {
          responsesMap[item.field_key] = item.value
        })
        setResponses(responsesMap)
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Salvar uma resposta individual
  const saveResponse = async (fieldKey: string, value: string) => {
    setSaving(prev => ({ ...prev, [fieldKey]: true }))
    
    try {
      const employeeToken = localStorage.getItem('employeeToken')
      if (!employeeToken) return

      await fetch('/api/workbook/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${employeeToken}\`
        },
        body: JSON.stringify({ field_key: fieldKey, value })
      })

      // Mostrar feedback visual de sucesso
      setTimeout(() => {
        setSaving(prev => ({ ...prev, [fieldKey]: false }))
      }, 500)

    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      setSaving(prev => ({ ...prev, [fieldKey]: false }))
    }
  }

  // Manipular mudanças nos campos com auto-save
  const handleInputChange = (fieldKey: string, value: string) => {
    setResponses(prev => ({ ...prev, [fieldKey]: value }))
    
    // Debounce para auto-save
    setTimeout(() => {
      saveResponse(fieldKey, value)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Caderno de Clareza e Carreira
          </h1>
          <p className="text-xl text-gray-600">
            Seu Guia de Performance e Influência
          </p>
        </div>

        {/* Seção 1: Cápsula do Tempo */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            A Cápsula do Tempo (Marco Zero da Carreira)
          </h2>
          
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">O que é?</h3>
            <p className="text-gray-700">
              Um exercício para criar um 'Marco Zero' da sua jornada. É uma fotografia honesta do seu estado 
              profissional e emocional, que será imensamente valiosa para medirmos sua evolução no futuro.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Qual é o maior desafio ou frustração que você sente na sua carreira hoje?
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['capsula_desafio'] || ''}
                onChange={(e) => handleInputChange('capsula_desafio', e.target.value)}
                placeholder="Descreva seus principais desafios e frustrações..."
              />
              {saving['capsula_desafio'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Onde você gostaria de estar profissionalmente daqui a um ano?
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['capsula_futuro'] || ''}
                onChange={(e) => handleInputChange('capsula_futuro', e.target.value)}
                placeholder="Pense em cargo, habilidades ou tipo de projeto..."
              />
              {saving['capsula_futuro'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Qual sentimento você mais busca no seu dia a dia de trabalho?
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['capsula_sentimento'] || ''}
                onChange={(e) => handleInputChange('capsula_sentimento', e.target.value)}
                placeholder="Ex: reconhecimento, tranquilidade, desafio, propósito..."
              />
              {saving['capsula_sentimento'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 2: Autoavaliação de Habilidades */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Autoavaliação de Habilidades
          </h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-gray-700">
              Avalie suas habilidades atuais de 1 a 5, onde 1 = Muito Fraco e 5 = Excelente.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { key: 'comunicacao', label: 'Comunicação (apresentações, reuniões, e-mails)' },
              { key: 'lideranca', label: 'Liderança (influenciar, motivar, delegar)' },
              { key: 'organizacao', label: 'Organização e Gestão do Tempo' },
              { key: 'resolucao_problemas', label: 'Resolução de Problemas' },
              { key: 'relacionamento', label: 'Relacionamento Interpessoal' },
              { key: 'adaptabilidade', label: 'Adaptabilidade a Mudanças' },
              { key: 'criatividade', label: 'Criatividade e Inovação' },
              { key: 'tomada_decisao', label: 'Tomada de Decisão' }
            ].map(skill => (
              <div key={skill.key} className="relative">
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  {skill.label}
                </label>
                <div className="flex space-x-4">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name={skill.key}
                        value={rating}
                        checked={responses[skill.key] === rating.toString()}
                        onChange={(e) => handleInputChange(skill.key, e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-lg">{rating}</span>
                    </label>
                  ))}
                </div>
                {saving[skill.key] && (
                  <div className="absolute top-0 right-0">
                    <span className="text-sm text-green-600">💾 Salvando...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seção 3: Análise de Valores Profissionais */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">
            Análise de Valores Profissionais
          </h2>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="text-gray-700">
              Classifique os valores abaixo de acordo com sua importância para você (1 = Mais importante, 10 = Menos importante).
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Estabilidade no emprego',
              'Reconhecimento e prestígio',
              'Crescimento e desenvolvimento',
              'Equilíbrio vida-trabalho',
              'Autonomia e independência',
              'Trabalho em equipe',
              'Desafios e variedade',
              'Contribuição social',
              'Remuneração competitiva',
              'Ambiente de trabalho agradável'
            ].map((valor, index) => (
              <div key={\`valor_\${index}\`} className="relative flex items-center space-x-4">
                <span className="flex-1 text-gray-700">{valor}</span>
                <select
                  value={responses[\`valor_\${index}\`] || ''}
                  onChange={(e) => handleInputChange(\`valor_\${index}\`, e.target.value)}
                  className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                {saving[\`valor_\${index}\`] && (
                  <span className="text-sm text-green-600">💾</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seção 4: Mapeamento de Objetivos */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Mapeamento de Objetivos de Carreira
          </h2>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Objetivos de Curto Prazo (próximos 6 meses)
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={responses['objetivos_curto'] || ''}
                onChange={(e) => handleInputChange('objetivos_curto', e.target.value)}
                placeholder="Liste 3-5 objetivos específicos que quer alcançar nos próximos 6 meses..."
              />
              {saving['objetivos_curto'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Objetivos de Médio Prazo (próximos 2 anos)
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={responses['objetivos_medio'] || ''}
                onChange={(e) => handleInputChange('objetivos_medio', e.target.value)}
                placeholder="Onde você quer estar em 2 anos? Que posição, habilidades, projetos..."
              />
              {saving['objetivos_medio'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Objetivos de Longo Prazo (próximos 5 anos)
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={responses['objetivos_longo'] || ''}
                onChange={(e) => handleInputChange('objetivos_longo', e.target.value)}
                placeholder="Sua visão de carreira em 5 anos. Seja ambicioso mas realista..."
              />
              {saving['objetivos_longo'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 5: Análise SWOT Pessoal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Análise SWOT Pessoal
          </h2>
          
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
            <p className="text-gray-700">
              Faça uma análise honesta dos seus pontos fortes, fracos, oportunidades e ameaças profissionais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-green-700 mb-2">
                Forças (Strengths)
              </label>
              <textarea
                rows={5}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={responses['swot_forcas'] || ''}
                onChange={(e) => handleInputChange('swot_forcas', e.target.value)}
                placeholder="Suas principais habilidades, qualidades e vantagens..."
              />
              {saving['swot_forcas'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-red-700 mb-2">
                Fraquezas (Weaknesses)
              </label>
              <textarea
                rows={5}
                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={responses['swot_fraquezas'] || ''}
                onChange={(e) => handleInputChange('swot_fraquezas', e.target.value)}
                placeholder="Áreas que precisa melhorar, limitações atuais..."
              />
              {saving['swot_fraquezas'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-blue-700 mb-2">
                Oportunidades (Opportunities)
              </label>
              <textarea
                rows={5}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['swot_oportunidades'] || ''}
                onChange={(e) => handleInputChange('swot_oportunidades', e.target.value)}
                placeholder="Tendências do mercado, novos projetos, networking..."
              />
              {saving['swot_oportunidades'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-yellow-700 mb-2">
                Ameaças (Threats)
              </label>
              <textarea
                rows={5}
                className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={responses['swot_ameacas'] || ''}
                onChange={(e) => handleInputChange('swot_ameacas', e.target.value)}
                placeholder="Concorrência, mudanças no mercado, obstáculos..."
              />
              {saving['swot_ameacas'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 6: Plano de Desenvolvimento */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Plano de Desenvolvimento Pessoal
          </h2>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Principais Habilidades a Desenvolver
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={responses['desenvolvimento_habilidades'] || ''}
                onChange={(e) => handleInputChange('desenvolvimento_habilidades', e.target.value)}
                placeholder="Liste as 3-5 habilidades mais importantes para seu crescimento..."
              />
              {saving['desenvolvimento_habilidades'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Como Planeja Desenvolver Essas Habilidades?
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={responses['desenvolvimento_como'] || ''}
                onChange={(e) => handleInputChange('desenvolvimento_como', e.target.value)}
                placeholder="Cursos, mentorias, projetos, leituras, práticas..."
              />
              {saving['desenvolvimento_como'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Cronograma e Metas Específicas
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={responses['desenvolvimento_cronograma'] || ''}
                onChange={(e) => handleInputChange('desenvolvimento_cronograma', e.target.value)}
                placeholder="Defina prazos e marcos para cada habilidade..."
              />
              {saving['desenvolvimento_cronograma'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 7: Reflexão Final */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Reflexão Final
          </h2>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Qual é o primeiro passo concreto que você dará esta semana?
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={responses['reflexao_primeiro_passo'] || ''}
                onChange={(e) => handleInputChange('reflexao_primeiro_passo', e.target.value)}
                placeholder="Seja específico e realize algo ainda esta semana..."
              />
              {saving['reflexao_primeiro_passo'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Como você medirá seu progresso ao longo do tempo?
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={responses['reflexao_medicao'] || ''}
                onChange={(e) => handleInputChange('reflexao_medicao', e.target.value)}
                placeholder="Que indicadores usará para acompanhar sua evolução..."
              />
              {saving['reflexao_medicao'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Mensagem para o "Eu do Futuro"
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={responses['reflexao_mensagem'] || ''}
                onChange={(e) => handleInputChange('reflexao_mensagem', e.target.value)}
                placeholder="Escreva uma mensagem motivacional para você mesmo daqui a um ano..."
              />
              {saving['reflexao_mensagem'] && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status de Salvamento */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-green-700 font-medium">
            ✅ Suas respostas são salvas automaticamente conforme você digita
          </p>
        </div>

        {/* Voltar */}
        <div className="text-center">
          <Link
            href="/funcionario"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}`;

// Criar diretório se não existir
const targetDir = path.join(__dirname, '..', 'src', 'app', 'funcionario', 'ferramentas');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Criar arquivo
const targetFile = path.join(targetDir, 'page.tsx');
fs.writeFileSync(targetFile, workbookPageContent);

console.log('✅ Página completa do caderno criada com sucesso!');