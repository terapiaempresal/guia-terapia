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
  const [saving, setSaving] = useState(false)
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
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
    }
  }

  // Salvar todas as respostas
  const saveAllResponses = async () => {
    setSaving(true)
    try {
      const promises = Object.entries(responses).map(([field_key, value]) => 
        saveResponse(field_key, value)
      )
      
      await Promise.all(promises)
      alert('Respostas salvas com sucesso!')
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar as respostas')
    } finally {
      setSaving(false)
    }
  }

  // Manipular mudanças nos campos
  const handleInputChange = (fieldKey: string, value: string) => {
    setResponses(prev => ({ ...prev, [fieldKey]: value }))
    setHasUnsavedChanges(true)
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
      {/* Botão de Salvar Fixo */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={saveAllResponses}
          disabled={saving || !hasUnsavedChanges}
          className={\`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all \${
            hasUnsavedChanges
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          }\`}
        >
          {saving ? '💾 Salvando...' : hasUnsavedChanges ? '💾 Salvar Alterações' : '✅ Tudo Salvo'}
        </button>
      </div>

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

        {/* Seção: Cápsula do Tempo */}
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
            </div>

            <div>
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
            </div>

            <div>
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

// Criar diretório se não existir
const targetDir = path.join(__dirname, '..', 'src', 'app', 'funcionario', 'ferramentas');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Criar arquivo
const targetFile = path.join(targetDir, 'page.tsx');
fs.writeFileSync(targetFile, workbookPageContent);

console.log('✅ Arquivo criado com sucesso:', targetFile);