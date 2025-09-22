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

  // Salvar uma resposta individual com debounce
  const saveResponse = async (fieldKey: string, value: string) => {
    if (!value.trim()) return // Não salvar se estiver vazio
    
    setSaving(prev => ({ ...prev, [fieldKey]: true }))
    
    try {
      const employeeToken = localStorage.getItem('employeeToken')
      if (!employeeToken) {
        console.error('Token não encontrado')
        return
      }

      console.log('Salvando:', { field_key: fieldKey, value })

      const response = await fetch('/api/workbook/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${employeeToken}\`
        },
        body: JSON.stringify({ field_key: fieldKey, value })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na resposta:', errorData)
        throw new Error(\`Erro HTTP: \${response.status}\`)
      }

      const result = await response.json()
      console.log('Salvo com sucesso:', result)

      // Mostrar feedback visual de sucesso
      setTimeout(() => {
        setSaving(prev => ({ ...prev, [fieldKey]: false }))
      }, 1000)

    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      setSaving(prev => ({ ...prev, [fieldKey]: false }))
    }
  }

  // Debounce para auto-save
  const debounceTimers: Record<string, NodeJS.Timeout> = {}

  // Manipular mudanças nos campos com auto-save
  const handleInputChange = (fieldKey: string, value: string) => {
    setResponses(prev => ({ ...prev, [fieldKey]: value }))
    
    // Limpar timer anterior se existir
    if (debounceTimers[fieldKey]) {
      clearTimeout(debounceTimers[fieldKey])
    }
    
    // Criar novo timer para auto-save após 2 segundos
    debounceTimers[fieldKey] = setTimeout(() => {
      saveResponse(fieldKey, value)
    }, 2000)
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
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              💡 <strong>Dica:</strong> Suas respostas são salvas automaticamente após 2 segundos de digitação
            </p>
          </div>
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
            <p className="text-gray-700 mt-2">
              <strong>Instrução:</strong> Responda de forma honesta e detalhada. Não há respostas certas ou erradas. 
              Esta é uma reflexão para você mesmo.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                1. Qual é o maior desafio ou frustração que você sente na sua carreira hoje?
              </label>
              <textarea
                rows={5}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                value={responses['capsula_desafio'] || ''}
                onChange={(e) => handleInputChange('capsula_desafio', e.target.value)}
                placeholder="Seja específico: é falta de reconhecimento? Estagnação? Pressão excessiva? Falta de clareza sobre seu futuro? Descreva o que mais te incomoda hoje..."
              />
              {saving['capsula_desafio'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                2. Onde você gostaria de estar profissionalmente daqui a um ano?
              </label>
              <textarea
                rows={5}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                value={responses['capsula_futuro'] || ''}
                onChange={(e) => handleInputChange('capsula_futuro', e.target.value)}
                placeholder="Pense em cargo, salário, tipo de empresa, habilidades que quer ter, projetos que quer liderar. Seja específico e ambicioso, mas realista..."
              />
              {saving['capsula_futuro'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                3. Qual sentimento você mais busca no seu dia a dia de trabalho?
              </label>
              <textarea
                rows={5}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                value={responses['capsula_sentimento'] || ''}
                onChange={(e) => handleInputChange('capsula_sentimento', e.target.value)}
                placeholder="Exemplos: reconhecimento, tranquilidade, desafio, propósito, autonomia, senso de contribuição, diversão, crescimento, segurança. Explique por que esse sentimento é importante para você..."
              />
              {saving['capsula_sentimento'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 2: Roda da Vida Profissional */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Roda da Vida Profissional
          </h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Instruções:</h3>
            <p className="text-gray-700 mb-2">
              Avalie cada área da sua vida profissional em uma escala de 0 a 10, onde:
            </p>
            <ul className="text-gray-700 list-disc list-inside space-y-1">
              <li><strong>0-2:</strong> Muito insatisfeito/Área crítica</li>
              <li><strong>3-4:</strong> Insatisfeito/Precisa de atenção</li>
              <li><strong>5-6:</strong> Neutro/Aceitável</li>
              <li><strong>7-8:</strong> Satisfeito/Boa área</li>
              <li><strong>9-10:</strong> Muito satisfeito/Área de destaque</li>
            </ul>
            <p className="text-gray-700 mt-2">
              <strong>Seja honesto!</strong> Não existe resposta certa. O objetivo é mapear sua situação atual.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { key: 'roda_realizacao', label: '1. Realização com o Trabalho', desc: 'O quanto você se sente realizado com suas atividades diárias, projetos e responsabilidades' },
              { key: 'roda_remuneracao', label: '2. Remuneração e Benefícios', desc: 'O quanto sua remuneração atual atende suas necessidades e expectativas' },
              { key: 'roda_crescimento', label: '3. Oportunidades de Crescimento', desc: 'Possibilidades de promoção, novos desafios e desenvolvimento de carreira' },
              { key: 'roda_lideranca', label: '4. Relacionamento com a Liderança', desc: 'Qualidade da relação com seu gestor direto e liderança da empresa' },
              { key: 'roda_pares', label: '5. Relacionamento com Pares', desc: 'Relacionamento com colegas de trabalho, colaboração e ambiente de equipe' },
              { key: 'roda_equilibrio', label: '6. Equilíbrio Vida/Trabalho', desc: 'Capacidade de conciliar trabalho com vida pessoal, família e hobbies' },
              { key: 'roda_ambiente', label: '7. Ambiente e Cultura', desc: 'Cultura da empresa, valores organizacionais e ambiente físico/virtual de trabalho' },
              { key: 'roda_energia', label: '8. Energia e Bem-estar Físico', desc: 'Seu nível de energia, saúde física e mental relacionados ao trabalho' }
            ].map(item => (
              <div key={item.key} className="relative border border-gray-200 rounded-lg p-4">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  {item.label}
                </label>
                <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">0</span>
                  <div className="flex space-x-2 flex-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                      <label key={rating} className="flex flex-col items-center">
                        <input
                          type="radio"
                          name={item.key}
                          value={rating}
                          checked={responses[item.key] === rating.toString()}
                          onChange={(e) => handleInputChange(item.key, e.target.value)}
                          className="mb-1"
                        />
                        <span className="text-xs">{rating}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">10</span>
                </div>
                {saving[item.key] && (
                  <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                    <span className="text-xs text-green-600">💾</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Análise da Roda */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Análise da Sua Roda</h3>
            
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  1. Qual área da sua roda com a nota mais baixa mais te surpreendeu? Por quê?
                </label>
                <textarea
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={responses['roda_analise_1'] || ''}
                  onChange={(e) => handleInputChange('roda_analise_1', e.target.value)}
                  placeholder="Reflita sobre qual área teve uma nota que você não esperava. Isso pode revelar pontos cegos importantes..."
                />
                {saving['roda_analise_1'] && (
                  <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                    <span className="text-sm text-green-600">💾 Salvando...</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  2. Qual única área, se você melhorasse em 10% nos próximos 90 dias, teria o maior impacto positivo em todas as outras? (Sua Área de Foco)
                </label>
                <textarea
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={responses['roda_analise_2'] || ''}
                  onChange={(e) => handleInputChange('roda_analise_2', e.target.value)}
                  placeholder="Pense no efeito dominó: qual área, se melhorada, traria benefícios para as outras? Esta será sua prioridade..."
                />
                {saving['roda_analise_2'] && (
                  <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                    <span className="text-sm text-green-600">💾 Salvando...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção 3: Matriz de Habilidades */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">
            Matriz de Habilidades: Suas Forças vs. Suas Paixões
          </h2>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Objetivo:</h3>
            <p className="text-gray-700">
              Identificar onde estão suas maiores oportunidades de crescimento através do cruzamento 
              entre o que você faz bem e o que te motiva.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista de Forças */}
            <div className="relative">
              <h3 className="text-lg font-bold text-green-600 mb-4">
                🎯 Suas Principais FORÇAS
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Liste suas 5-8 principais habilidades, talentos ou qualidades que outros reconhecem em você:
              </p>
              <textarea
                rows={12}
                className="w-full p-4 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                value={responses['matriz_forcas'] || ''}
                onChange={(e) => handleInputChange('matriz_forcas', e.target.value)}
                placeholder={\`Exemplos:
• Comunicação clara e persuasiva
• Organização e gestão de tempo
• Capacidade analítica
• Relacionamento interpessoal
• Resolução de problemas
• Liderança natural
• Criatividade
• Atenção aos detalhes

Liste as suas:\`}
              />
              {saving['matriz_forcas'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            {/* Lista de Paixões */}
            <div className="relative">
              <h3 className="text-lg font-bold text-red-600 mb-4">
                ❤️ Suas Principais PAIXÕES
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Liste 5-8 atividades, temas ou tipos de trabalho que te energizam e motivam:
              </p>
              <textarea
                rows={12}
                className="w-full p-4 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                value={responses['matriz_paixoes'] || ''}
                onChange={(e) => handleInputChange('matriz_paixoes', e.target.value)}
                placeholder={\`Exemplos:
• Ensinar e desenvolver pessoas
• Inovar e criar soluções
• Trabalhar com dados e análises
• Liderar equipes e projetos
• Atendimento ao cliente
• Estratégia e planejamento
• Tecnologia e automação
• Vendas e negociação

Liste as suas:\`}
              />
              {saving['matriz_paixoes'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>

          {/* Zona de Oportunidade */}
          <div className="mt-8 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">
              🌟 Sua ZONA DE OPORTUNIDADE
            </h3>
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Identifique 3-5 intersecções entre suas FORÇAS e PAIXÕES que representam suas maiores oportunidades de carreira:
              </label>
              <textarea
                rows={6}
                className="w-full p-4 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                value={responses['matriz_oportunidades'] || ''}
                onChange={(e) => handleInputChange('matriz_oportunidades', e.target.value)}
                placeholder={\`Exemplo: Se você tem FORÇA em "comunicação" e PAIXÃO por "ensinar pessoas", sua oportunidade pode ser "Liderar treinamentos internos" ou "Mentoria de novos funcionários".

Identifique suas intersecções:\`}
              />
              {saving['matriz_oportunidades'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 4: Plano de Ação 90 Dias */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Plano de Ação: Próximos 90 Dias
          </h2>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Foco em Resultados:</h3>
            <p className="text-gray-700">
              Com base em suas reflexões anteriores, defina ações específicas e mensuráveis para os próximos 90 dias. 
              Concentre-se na área de foco que você identificou na Roda da Vida.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                1. Sua ÚNICA Prioridade (baseada na análise da Roda da Vida)
              </label>
              <textarea
                rows={3}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                value={responses['plano_prioridade'] || ''}
                onChange={(e) => handleInputChange('plano_prioridade', e.target.value)}
                placeholder="Qual a única área/habilidade/comportamento você vai focar nos próximos 90 dias?"
              />
              {saving['plano_prioridade'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                2. Ações Específicas (3-5 ações concretas)
              </label>
              <textarea
                rows={6}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                value={responses['plano_acoes'] || ''}
                onChange={(e) => handleInputChange('plano_acoes', e.target.value)}
                placeholder={\`Seja específico! Exemplos:
• "Fazer 1 reunião semanal de 30min com meu gestor para feedback"
• "Completar curso X até dia Y"
• "Propor liderar o projeto Z até o final do mês"
• "Organizar minha agenda usando método X"

Suas ações:\`}
              />
              {saving['plano_acoes'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                3. Como você vai medir o progresso?
              </label>
              <textarea
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                value={responses['plano_medicao'] || ''}
                onChange={(e) => handleInputChange('plano_medicao', e.target.value)}
                placeholder={\`Defina indicadores concretos:
• "Nota na Roda da Vida da área X passará de Y para Z"
• "Receberei feedback positivo sobre X de pelo menos 2 pessoas"
• "Completarei 100% das ações planejadas"

Seus indicadores:\`}
              />
              {saving['plano_medicao'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                4. Qual será seu sistema de acompanhamento?
              </label>
              <textarea
                rows={3}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                value={responses['plano_acompanhamento'] || ''}
                onChange={(e) => handleInputChange('plano_acompanhamento', e.target.value)}
                placeholder="Como e quando você vai revisar seu progresso? (Ex: revisão semanal nas sextas, check-in mensal, etc.)"
              />
              {saving['plano_acompanhamento'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 5: Compromisso e Reflexão Final */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Compromisso e Reflexão Final
          </h2>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                1. Escreva seu compromisso pessoal com esta jornada:
              </label>
              <textarea
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                value={responses['compromisso_pessoal'] || ''}
                onChange={(e) => handleInputChange('compromisso_pessoal', e.target.value)}
                placeholder="Ex: 'Eu me comprometo a...' - Seja específico sobre o que você promete fazer por você mesmo nos próximos 90 dias."
              />
              {saving['compromisso_pessoal'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                2. Mensagem para o "Eu do Futuro" (daqui a 90 dias):
              </label>
              <textarea
                rows={5}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                value={responses['mensagem_futuro'] || ''}
                onChange={(e) => handleInputChange('mensagem_futuro', e.target.value)}
                placeholder="Escreva uma carta para você mesmo que lerá daqui a 90 dias. Inclua suas expectativas, motivações e o que espera ter conquistado..."
              />
              {saving['mensagem_futuro'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                3. Qual foi o maior insight ou descoberta ao preencher este caderno?
              </label>
              <textarea
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                value={responses['maior_insight'] || ''}
                onChange={(e) => handleInputChange('maior_insight', e.target.value)}
                placeholder="O que você descobriu sobre si mesmo? Que padrão identificou? Que oportunidade viu pela primeira vez?"
              />
              {saving['maior_insight'] && (
                <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded">
                  <span className="text-sm text-green-600">💾 Salvando...</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumo de Status */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Status do Seu Caderno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded">
                <span className="font-semibold text-orange-600">Cápsula do Tempo:</span>
                <span className="ml-2">{Object.keys(responses).filter(k => k.startsWith('capsula_')).length}/3 perguntas</span>
              </div>
              <div className="bg-white p-3 rounded">
                <span className="font-semibold text-blue-600">Roda da Vida:</span>
                <span className="ml-2">{Object.keys(responses).filter(k => k.startsWith('roda_')).length}/10 itens</span>
              </div>
              <div className="bg-white p-3 rounded">
                <span className="font-semibold text-purple-600">Matriz de Habilidades:</span>
                <span className="ml-2">{Object.keys(responses).filter(k => k.startsWith('matriz_')).length}/3 seções</span>
              </div>
              <div className="bg-white p-3 rounded">
                <span className="font-semibold text-green-600">Plano 90 Dias:</span>
                <span className="ml-2">{Object.keys(responses).filter(k => k.startsWith('plano_')).length}/4 seções</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status de Salvamento */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-green-700 font-medium">
            ✅ Suas respostas são salvas automaticamente após 2 segundos de digitação
          </p>
          <p className="text-green-600 text-sm mt-1">
            Total de respostas salvas: <strong>{Object.keys(responses).length}</strong>
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

console.log('✅ Caderno completo criado com sucesso! Inclui debug de salvamento.');