const fs = require('fs');
const path = require('path');

const fullWorkbookContent = `'use client'

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

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
      
      // Mostrar feedback visual de salvamento
      setTimeout(() => {
        setSaving(prev => ({ ...prev, [fieldKey]: false }))
      }, 1000)
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      setSaving(prev => ({ ...prev, [fieldKey]: false }))
    }
  }

  // Manipular mudanças nos campos com auto-save
  const handleInputChange = (fieldKey: string, value: string) => {
    setResponses(prev => ({ ...prev, [fieldKey]: value }))
    setHasUnsavedChanges(true)
    
    // Auto-save após 2 segundos de inatividade
    setTimeout(() => {
      saveResponse(fieldKey, value)
    }, 2000)
  }

  // Componente de botão de salvar individual
  const SaveButton = ({ fieldKey }: { fieldKey: string }) => (
    <button
      onClick={() => saveResponse(fieldKey, responses[fieldKey] || '')}
      disabled={saving[fieldKey]}
      className={\`ml-2 px-3 py-1 text-sm rounded-md transition-all \${
        saving[fieldKey]
          ? 'bg-green-500 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }\`}
    >
      {saving[fieldKey] ? '✅ Salvo!' : '💾 Salvar'}
    </button>
  )

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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Qual é o maior desafio ou frustração que você sente na sua carreira hoje?
                </label>
                <SaveButton fieldKey="capsula_desafio" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['capsula_desafio'] || ''}
                onChange={(e) => handleInputChange('capsula_desafio', e.target.value)}
                placeholder="Descreva seus principais desafios e frustrações..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Onde você gostaria de estar profissionalmente daqui a um ano?
                </label>
                <SaveButton fieldKey="capsula_futuro" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['capsula_futuro'] || ''}
                onChange={(e) => handleInputChange('capsula_futuro', e.target.value)}
                placeholder="Pense em cargo, habilidades ou tipo de projeto..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Qual sentimento você mais busca no seu dia a dia de trabalho?
                </label>
                <SaveButton fieldKey="capsula_sentimento" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['capsula_sentimento'] || ''}
                onChange={(e) => handleInputChange('capsula_sentimento', e.target.value)}
                placeholder="Ex: reconhecimento, tranquilidade, desafio, propósito..."
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Audit da Performance */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Audit da Performance
          </h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Performance Atual</h3>
            <p className="text-gray-700">
              Avalie honestamente seu desempenho atual em diferentes áreas profissionais.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Como você avalia sua performance técnica atual? (1-10)
                </label>
                <SaveButton fieldKey="audit_performance_tecnica" />
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="flex-1"
                  value={responses['audit_performance_tecnica'] || '5'}
                  onChange={(e) => handleInputChange('audit_performance_tecnica', e.target.value)}
                />
                <span className="text-2xl font-bold text-blue-600 min-w-[40px]">
                  {responses['audit_performance_tecnica'] || '5'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Como você avalia sua capacidade de comunicação? (1-10)
                </label>
                <SaveButton fieldKey="audit_comunicacao" />
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="flex-1"
                  value={responses['audit_comunicacao'] || '5'}
                  onChange={(e) => handleInputChange('audit_comunicacao', e.target.value)}
                />
                <span className="text-2xl font-bold text-blue-600 min-w-[40px]">
                  {responses['audit_comunicacao'] || '5'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Como você avalia sua capacidade de liderança? (1-10)
                </label>
                <SaveButton fieldKey="audit_lideranca" />
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="flex-1"
                  value={responses['audit_lideranca'] || '5'}
                  onChange={(e) => handleInputChange('audit_lideranca', e.target.value)}
                />
                <span className="text-2xl font-bold text-blue-600 min-w-[40px]">
                  {responses['audit_lideranca'] || '5'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Quais são seus três maiores pontos fortes profissionais?
                </label>
                <SaveButton fieldKey="audit_pontos_fortes" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['audit_pontos_fortes'] || ''}
                onChange={(e) => handleInputChange('audit_pontos_fortes', e.target.value)}
                placeholder="Liste seus três maiores pontos fortes..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Quais são suas três principais áreas de melhoria?
                </label>
                <SaveButton fieldKey="audit_areas_melhoria" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={responses['audit_areas_melhoria'] || ''}
                onChange={(e) => handleInputChange('audit_areas_melhoria', e.target.value)}
                placeholder="Liste suas três principais áreas para desenvolvimento..."
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Mapeamento de Stakeholders */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Mapeamento de Stakeholders
          </h2>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Rede de Relacionamentos</h3>
            <p className="text-gray-700">
              Identifique as pessoas-chave que influenciam sua carreira e como você pode fortalecer essas relações.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Quem são os 3 principais tomadores de decisão que afetam sua carreira?
                </label>
                <SaveButton fieldKey="stakeholders_decisores" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={responses['stakeholders_decisores'] || ''}
                onChange={(e) => handleInputChange('stakeholders_decisores', e.target.value)}
                placeholder="Liste os nomes e cargos das pessoas que têm poder de decisão sobre sua carreira..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Quem são seus principais influenciadores internos?
                </label>
                <SaveButton fieldKey="stakeholders_influenciadores" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={responses['stakeholders_influenciadores'] || ''}
                onChange={(e) => handleInputChange('stakeholders_influenciadores', e.target.value)}
                placeholder="Pessoas que têm influência política e podem apoiar sua carreira..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Quais stakeholders você precisa conquistar ou melhorar o relacionamento?
                </label>
                <SaveButton fieldKey="stakeholders_conquistar" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={responses['stakeholders_conquistar'] || ''}
                onChange={(e) => handleInputChange('stakeholders_conquistar', e.target.value)}
                placeholder="Identifique pessoas com quem você precisa construir ou melhorar o relacionamento..."
              />
            </div>
          </div>
        </div>

        {/* Seção 4: Plano de Ação */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">
            Plano de Ação - Próximos 90 Dias
          </h2>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Objetivos Estratégicos</h3>
            <p className="text-gray-700">
              Defina ações concretas para os próximos 3 meses baseadas nas reflexões anteriores.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Qual é sua principal meta profissional para os próximos 90 dias?
                </label>
                <SaveButton fieldKey="plano_meta_90_dias" />
              </div>
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={responses['plano_meta_90_dias'] || ''}
                onChange={(e) => handleInputChange('plano_meta_90_dias', e.target.value)}
                placeholder="Defina uma meta específica e mensurável..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Quais 3 ações específicas você vai tomar para melhorar sua performance?
                </label>
                <SaveButton fieldKey="plano_acoes_performance" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={responses['plano_acoes_performance'] || ''}
                onChange={(e) => handleInputChange('plano_acoes_performance', e.target.value)}
                placeholder="Ações concretas com prazos definidos..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Como você vai fortalecer seus relacionamentos com stakeholders-chave?
                </label>
                <SaveButton fieldKey="plano_relacionamentos" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={responses['plano_relacionamentos'] || ''}
                onChange={(e) => handleInputChange('plano_relacionamentos', e.target.value)}
                placeholder="Estratégias específicas para cada pessoa identificada..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">
                  Quais habilidades você vai desenvolver neste período?
                </label>
                <SaveButton fieldKey="plano_habilidades" />
              </div>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={responses['plano_habilidades'] || ''}
                onChange={(e) => handleInputChange('plano_habilidades', e.target.value)}
                placeholder="Cursos, treinamentos, projetos para desenvolvimento..."
              />
            </div>
          </div>
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

// Substituir arquivo existente
const targetFile = path.join(__dirname, '..', 'src', 'app', 'funcionario', 'ferramentas', 'page.tsx');
fs.writeFileSync(targetFile, fullWorkbookContent);

console.log('✅ Arquivo atualizado com todas as seções do caderno!');