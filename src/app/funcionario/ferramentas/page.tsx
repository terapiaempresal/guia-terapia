'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/navigation'

interface WorkbookResponse {
  field_key: string
  value: string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function WorkbookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastPosition, setLastPosition] = useState<string | null>(null)
  const timersRef = useRef<Record<string, number>>({})

  // --- AUTH + LOAD ---
  useEffect(() => {
    const employeeId = localStorage.getItem('employeeId')
    const userType = localStorage.getItem('userType')
    if (!employeeId || userType !== 'funcionario') {
      router.replace('/login')
      return
    }
    loadResponses()
    loadLastPosition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadResponses = async () => {
    try {
      const employeeToken = localStorage.getItem('employeeToken')
      if (!employeeToken) { setLoading(false); return }
      const r = await fetch('/api/workbook/responses', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      })
      if (r.ok) {
        const data: WorkbookResponse[] = await r.json()
        const map: Record<string, string> = {}
        data.forEach(it => { map[it.field_key] = it.value })
        setResponses(map)
      }
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  // --- SAVE (debounced por campo) ---
  const saveResponse = async (fieldKey: string, value: string) => {
    setSaveState(s => ({ ...s, [fieldKey]: 'saving' }))
    try {
      const employeeToken = localStorage.getItem('employeeToken')
      if (!employeeToken) throw new Error('sem token')
      const r = await fetch('/api/workbook/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`
        },
        body: JSON.stringify({ field_key: fieldKey, value })
      })
      if (!r.ok) throw new Error('erro ao salvar')
      setSaveState(s => ({ ...s, [fieldKey]: 'saved' }))
      setTimeout(() => setSaveState(s => ({ ...s, [fieldKey]: 'idle' })), 1200)
      setHasUnsavedChanges(false)
    } catch (e) {
      console.error(e)
      setSaveState(s => ({ ...s, [fieldKey]: 'error' }))
    }
  }

  const handleInputChange = (fieldKey: string, value: string) => {
    setResponses(prev => ({ ...prev, [fieldKey]: value }))
    setHasUnsavedChanges(true)

    // Salvar posição atual
    saveCurrentPosition(fieldKey)

    // clear previous timer
    if (timersRef.current[fieldKey]) window.clearTimeout(timersRef.current[fieldKey])
    // debounce 800ms
    timersRef.current[fieldKey] = window.setTimeout(() => {
      saveResponse(fieldKey, value)
    }, 800)
  }

  // Salvar posição atual no localStorage
  const saveCurrentPosition = (fieldKey: string) => {
    const employeeId = localStorage.getItem('employeeId')
    if (employeeId) {
      localStorage.setItem(`workbook_position_${employeeId}`, fieldKey)
      setLastPosition(fieldKey)
    }
  }

  // Carregar última posição salva
  const loadLastPosition = () => {
    const employeeId = localStorage.getItem('employeeId')
    if (employeeId) {
      const savedPosition = localStorage.getItem(`workbook_position_${employeeId}`)
      if (savedPosition) {
        setLastPosition(savedPosition)
        // Scroll para a posição após um pequeno delay
        setTimeout(() => {
          const element = document.querySelector(`[data-field="${savedPosition}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 500)
      }
    }
  }

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsavedChanges])

  const Status = ({ k }: { k: string }) => {
    const s = saveState[k]
    const isLastPosition = lastPosition === k
    return (
      <div className="flex items-center justify-between mt-1">
        <div>
          {s === 'saving' && <span className="text-blue-600 text-xs">💾 salvando…</span>}
          {s === 'saved' && <span className="text-green-600 text-xs">✅ salvo</span>}
          {s === 'error' && <span className="text-red-600 text-xs">❌ erro ao salvar</span>}
        </div>
        {/* {isLastPosition && (
          <div className="bg-yellow-100 border border-yellow-300 rounded px-2 py-1">
            <span className="text-yellow-800 text-xs font-medium">📍 Última posição</span>
          </div>
        )} */}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Lora:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <title>Caderno de Clareza e Carreira</title>
      </Head>

      {/* CONTROLES DO APP */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Caderno de Clareza e Carreira
              {hasUnsavedChanges ? <span className="ml-2 text-amber-600">• alterações pendentes</span> : null}
            </div>
            <Link
              href="/funcionario"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>

          {/* Banner de última posição
          {lastPosition && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
              <span className="text-yellow-800 text-xs">
                📍 <strong>Continue de onde parou:</strong> Scroll automático para a última pergunta respondida
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* PÁGINAS IMPRIMÍVEIS */}
      <div className="py-6">
        {/* Capa */}
        <div className="page">
          <header className="page-header" />
          <main className="page-content flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl">Terapia Empresarial</h3>
            <h1 className="text-5xl mt-4">Caderno de Clareza e Carreira</h1>
            <p className="text-xl text-gray-600 mt-4">Seu Guia de Performance e Influência</p>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 1: Ponto de Partida */}
        <div className="page">
          <header className="page-header">Parte 1: Ponto de Partida</header>
          <main className="page-content">
            <h2 className="section-title">Meu Ponto de Partida</h2>
            <h3 className="tool-title">Bem-vindo(a) à sua Jornada</h3>
            <p className="text-lg leading-relaxed">
              O caderno que você tem em mãos é muito mais do que um material de apoio. Ele é um espaço seguro, um confidente estratégico e o seu campo de treinamento pessoal. Aqui, a confusão tem permissão para aparecer, pois é o primeiro passo para a clareza.
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              Use estas páginas para ser honesto(a) consigo mesmo(a). Não há respostas erradas. Há apenas o seu processo, a sua jornada e a sua busca por uma carreira com mais propósito e impacto.
            </p>

            <hr className="my-8" />

            <h3 className="tool-title">O Contrato Comigo Mesmo</h3>
            <p className="mb-4">Leia em voz alta antes de assinar. Este é um ato de compromisso com você e com sua carreira.</p>
            <blockquote className="border-l-4 border-gray-300 pl-6 py-2 text-lg italic">
              Eu, entendo que a clareza é uma construção ativa e que a transformação da minha carreira começa com a minha própria transformação.<br /><br />
              Eu me comprometo a encarar a verdade, dedicar tempo e energia para usar estas ferramentas, e confiar no processo, celebrando cada pequena vitória.
            </blockquote>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Cápsula do Tempo */}
        <div className="page">
          <header className="page-header">Parte 1: Ponto de Partida</header>
          <main className="page-content">
            <h3 className="tool-title">A Cápsula do Tempo (Marco Zero da Carreira)</h3>
            <div className="explanation-block">
              <h5>O que é?</h5>
              <p>Um exercício para criar um 'Marco Zero' da sua jornada. É uma fotografia honesta do seu estado profissional e emocional, que será imensamente valiosa para medirmos sua evolução no futuro.</p>
            </div>
            <fieldset>
              <legend>Minha Realidade Hoje</legend>
              <div className="space-y-6 mt-4">
                <div data-field="capsula_desafio">
                  <label>Qual é o maior desafio ou frustração que você sente na sua carreira hoje?</label>
                  <textarea
                    rows={4}
                    value={responses['capsula_desafio'] || ''}
                    onChange={(e) => handleInputChange('capsula_desafio', e.target.value)}
                  />
                  <Status k="capsula_desafio" />
                </div>
                <div data-field="capsula_futuro">
                  <label>Onde você gostaria de estar profissionalmente daqui a um ano? (Pense em cargo, habilidades ou tipo de projeto)</label>
                  <textarea
                    rows={4}
                    value={responses['capsula_futuro'] || ''}
                    onChange={(e) => handleInputChange('capsula_futuro', e.target.value)}
                  />
                  <Status k="capsula_futuro" />
                </div>
                <div data-field="capsula_sentimento">
                  <label>Qual sentimento você mais busca no seu dia a dia de trabalho? (Ex: reconhecimento, tranquilidade, desafio, propósito)</label>
                  <textarea
                    rows={4}
                    value={responses['capsula_sentimento'] || ''}
                    onChange={(e) => handleInputChange('capsula_sentimento', e.target.value)}
                  />
                  <Status k="capsula_sentimento" />
                </div>
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 2: Roda da Vida Profissional (1/2) */}
        <div className="page">
          <header className="page-header">Parte 2: Autoconhecimento</header>
          <main className="page-content">
            <h2 className="section-title">A Jornada de Autoconhecimento</h2>
            <h3 className="tool-title">Ferramenta: A Roda da Vida Profissional (1 de 2)</h3>
            <div className="explanation-block">
              <h5>O que é?</h5><p>Uma fotografia instantânea do seu nível de satisfação nas áreas-chave da sua vida profissional.</p>
              <h5>Como usar?</h5><p>Para cada uma das 8 áreas abaixo, dê uma nota de 1 (muito insatisfeito) a 10 (muito satisfeito).</p>
            </div>

            <fieldset className="mt-8">
              <legend>Autoavaliação (1 a 10)</legend>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4">
                {[
                  ['roda_realizacao', '1. Realização com o Trabalho'],
                  ['roda_remuneracao', '2. Remuneração e Benefícios'],
                  ['roda_crescimento', '3. Oportunidades de Crescimento'],
                  ['roda_lideranca_relacao', '4. Relacionamento com a Liderança'],
                  ['roda_pares', '5. Relacionamento com Pares'],
                  ['roda_equilibrio', '6. Equilíbrio Vida/Trabalho'],
                  ['roda_cultura', '7. Ambiente e Cultura'],
                  ['roda_bemestar', '8. Energia e Bem-estar Físico'],
                ].map(([key, label]) => (
                  <div key={key} className="grid grid-cols-3 items-center gap-2">
                    <label className="col-span-2">{label}</label>
                    <input
                      type="text"
                      className="text-center"
                      placeholder="1-10"
                      value={responses[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                    <div className="col-span-3"><Status k={key} /></div>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend>Análise da Roda</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>1. Qual área da sua roda com a nota mais baixa mais te surpreendeu? Por quê?</label>
                  <textarea
                    rows={3}
                    value={responses['roda_insight_surpresa'] || ''}
                    onChange={(e) => handleInputChange('roda_insight_surpresa', e.target.value)}
                  />
                  <Status k="roda_insight_surpresa" />
                </div>
                <div>
                  <label>2. Qual única área, se você melhorasse em 10% nos próximos 90 dias, teria o maior impacto positivo? (Área de Foco)</label>
                  <textarea
                    rows={3}
                    value={responses['roda_area_foco'] || ''}
                    onChange={(e) => handleInputChange('roda_area_foco', e.target.value)}
                  />
                  <Status k="roda_area_foco" />
                </div>
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 2: Roda (2/2) */}
        <div className="page">
          <header className="page-header">Parte 2: Autoconhecimento</header>
          <main className="page-content">
            <h3 className="tool-title">Ferramenta: A Roda da Vida Profissional (2 de 2)</h3>
            <div className="explanation-block">
              <h5>Fechamento: Plano de Ação de 90 Dias</h5>
              <p>Transforme sua reflexão em um plano de ação concreto para a Área de Foco.</p>
            </div>
            <fieldset>
              <legend>Meu Mini-Projeto de 90 Dias</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>Área de Foco Escolhida:</label>
                  <input
                    type="text"
                    value={responses['roda_foco_escolhido'] || ''}
                    onChange={(e) => handleInputChange('roda_foco_escolhido', e.target.value)}
                  />
                  <Status k="roda_foco_escolhido" />
                </div>
                <div>
                  <label>Objetivo principal (próx. 90 dias):</label>
                  <textarea
                    rows={3}
                    value={responses['roda_objetivo90'] || ''}
                    onChange={(e) => handleInputChange('roda_objetivo90', e.target.value)}
                    placeholder="Ex: Criar reserva de emergência de 3 meses…"
                  />
                  <Status k="roda_objetivo90" />
                </div>
                <div>
                  <label>3 primeiras ações:</label>
                  <textarea
                    rows={4}
                    value={responses['roda_acoes_iniciais'] || ''}
                    onChange={(e) => handleInputChange('roda_acoes_iniciais', e.target.value)}
                    placeholder={`1. ...\n2. ...\n3. ...`}
                  />
                  <Status k="roda_acoes_iniciais" />
                </div>
                <div>
                  <label>Como medir o progresso:</label>
                  <textarea
                    rows={3}
                    value={responses['roda_medir_progresso'] || ''}
                    onChange={(e) => handleInputChange('roda_medir_progresso', e.target.value)}
                  />
                  <Status k="roda_medir_progresso" />
                </div>
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 2: SWOT (1/2) */}
        <div className="page">
          <header className="page-header">Parte 2: Autoconhecimento</header>
          <main className="page-content">
            <h3 className="tool-title">Ferramenta: Análise SWOT Pessoal (1 de 2)</h3>
            <div className="explanation-block">
              <h5>O que é?</h5><p>Mapa do seu campo profissional: internos (forças/fraquezas) e externos (oportunidades/ameaças).</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="font-bold text-green-800 block mb-2">Forças</label>
                <textarea
                  rows={10}
                  className="border-green-200"
                  value={responses['swot_forcas'] || ''}
                  onChange={(e) => handleInputChange('swot_forcas', e.target.value)}
                  placeholder="Habilidades, soft skills, networking…"
                />
                <Status k="swot_forcas" />
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <label className="font-bold text-red-800 block mb-2">Fraquezas</label>
                <textarea
                  rows={10}
                  className="border-red-200"
                  value={responses['swot_fraquezas'] || ''}
                  onChange={(e) => handleInputChange('swot_fraquezas', e.target.value)}
                />
                <Status k="swot_fraquezas" />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="font-bold text-blue-800 block mb-2">Oportunidades</label>
                <textarea
                  rows={10}
                  className="border-blue-200"
                  value={responses['swot_oportunidades'] || ''}
                  onChange={(e) => handleInputChange('swot_oportunidades', e.target.value)}
                />
                <Status k="swot_oportunidades" />
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <label className="font-bold text-yellow-800 block mb-2">Ameaças</label>
                <textarea
                  rows={10}
                  className="border-yellow-200"
                  value={responses['swot_ameacas'] || ''}
                  onChange={(e) => handleInputChange('swot_ameacas', e.target.value)}
                />
                <Status k="swot_ameacas" />
              </div>
            </div>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 2: SWOT (2/2) */}
        <div className="page">
          <header className="page-header">Parte 2: Autoconhecimento</header>
          <main className="page-content">
            <h3 className="tool-title">Ferramenta: Análise SWOT Pessoal (2 de 2)</h3>
            <div className="explanation-block">
              <h5>Fechamento: Plano de Desenvolvimento</h5>
              <p>Transforme o diagnóstico em ação focada.</p>
            </div>
            <fieldset>
              <legend>Cruzamento Estratégico</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>Usar uma <b>Força</b> para aproveitar uma <b>Oportunidade</b>:</label>
                  <textarea
                    rows={3}
                    value={responses['swot_fo'] || ''}
                    onChange={(e) => handleInputChange('swot_fo', e.target.value)}
                  />
                  <Status k="swot_fo" />
                </div>
                <div>
                  <label>Usar uma <b>Força</b> para defender de uma <b>Ameaça</b>:</label>
                  <textarea
                    rows={3}
                    value={responses['swot_fa'] || ''}
                    onChange={(e) => handleInputChange('swot_fa', e.target.value)}
                  />
                  <Status k="swot_fa" />
                </div>
                <div>
                  <label>Qual <b>Oportunidade</b> neutraliza uma <b>Fraqueza</b>?</label>
                  <textarea
                    rows={3}
                    value={responses['swot_of'] || ''}
                    onChange={(e) => handleInputChange('swot_of', e.target.value)}
                  />
                  <Status k="swot_of" />
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend>Ação Prioritária</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>Estratégia-Chave (próx. 90 dias):</label>
                  <textarea
                    rows={3}
                    value={responses['swot_estrategia90'] || ''}
                    onChange={(e) => handleInputChange('swot_estrategia90', e.target.value)}
                  />
                  <Status k="swot_estrategia90" />
                </div>
                <div>
                  <label>Primeira ação concreta:</label>
                  <textarea
                    rows={3}
                    value={responses['swot_primeira_acao'] || ''}
                    onChange={(e) => handleInputChange('swot_primeira_acao', e.target.value)}
                  />
                  <Status k="swot_primeira_acao" />
                </div>
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 3: Cultura e Bem-Estar (intro) */}
        <div className="page">
          <header className="page-header">Parte 3: Cultura e Bem-Estar</header>
          <main className="page-content">
            <h2 className="section-title">Navegando na Cultura e no Bem-Estar</h2>
            <p className="text-lg leading-relaxed">
              O sucesso na carreira também depende de entender e interagir com o ambiente ao seu redor.
            </p>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 3: Termômetro de Bem-Estar */}
        <div className="page">
          <header className="page-header">Parte 3: Cultura e Bem-Estar</header>
          <main className="page-content">
            <h3 className="tool-title">Meu Termômetro de Bem-Estar no Trabalho</h3>
            <div className="explanation-block">
              <h5>O que é?</h5><p>Autoavaliação guiada pelo modelo "Cabeça, Coração e Mãos".</p>
            </div>

            <fieldset>
              <legend>Etapa 1: Autoavaliação (1 a 10)</legend>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="font-bold">A Cabeça (Exigências do Trabalho):</label>
                  <div className="grid grid-cols-5 items-center gap-2">
                    <span className="col-span-4">Minhas metas são claras e realistas.</span>
                    <input
                      type="text"
                      className="text-center"
                      placeholder="1-10"
                      value={responses['bem_cabeca_metas'] || ''}
                      onChange={(e) => handleInputChange('bem_cabeca_metas', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-2 mt-2">
                    <span className="col-span-4">Meu volume de trabalho é sustentável.</span>
                    <input
                      type="text"
                      className="text-center"
                      placeholder="1-10"
                      value={responses['bem_cabeca_volume'] || ''}
                      onChange={(e) => handleInputChange('bem_cabeca_volume', e.target.value)}
                    />
                  </div>
                  <Status k="bem_cabeca_metas" />
                  <Status k="bem_cabeca_volume" />
                </div>

                <div>
                  <label className="font-bold">O Coração (Relações e Cultura):</label>
                  <div className="grid grid-cols-5 items-center gap-2">
                    <span className="col-span-4">Sinto-me seguro(a) para expressar opinião divergente.</span>
                    <input
                      type="text"
                      className="text-center"
                      placeholder="1-10"
                      value={responses['bem_coracao_seguranca'] || ''}
                      onChange={(e) => handleInputChange('bem_coracao_seguranca', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-2 mt-2">
                    <span className="col-span-4">Recebo apoio que preciso da liderança.</span>
                    <input
                      type="text"
                      className="text-center"
                      placeholder="1-10"
                      value={responses['bem_coracao_apoio'] || ''}
                      onChange={(e) => handleInputChange('bem_coracao_apoio', e.target.value)}
                    />
                  </div>
                  <Status k="bem_coracao_seguranca" />
                  <Status k="bem_coracao_apoio" />
                </div>

                <div>
                  <label className="font-bold">As Mãos (Organização do Trabalho):</label>
                  <div className="grid grid-cols-5 items-center gap-2">
                    <span className="col-span-4">Clareza sobre papel e responsabilidades.</span>
                    <input
                      type="text"
                      className="text-center"
                      placeholder="1-10"
                      value={responses['bem_maos_clareza'] || ''}
                      onChange={(e) => handleInputChange('bem_maos_clareza', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-2 mt-2">
                    <span className="col-span-4">Ferramentas adequadas para o trabalho.</span>
                    <input
                      type="text"
                      className="text-center"
                      placeholder="1-10"
                      value={responses['bem_maos_ferramentas'] || ''}
                      onChange={(e) => handleInputChange('bem_maos_ferramentas', e.target.value)}
                    />
                  </div>
                  <Status k="bem_maos_clareza" />
                  <Status k="bem_maos_ferramentas" />
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-6 bg-blue-50">
              <legend>Etapa 2: Análise e Ação</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>Item de menor nota (maior ralo de energia):</label>
                  <textarea
                    rows={3}
                    value={responses['bem_analise_ralo'] || ''}
                    onChange={(e) => handleInputChange('bem_analise_ralo', e.target.value)}
                  />
                  <Status k="bem_analise_ralo" />
                </div>
                <div>
                  <label>Pequena ação/conversa desta semana:</label>
                  <textarea
                    rows={3}
                    value={responses['bem_analise_acao'] || ''}
                    onChange={(e) => handleInputChange('bem_analise_acao', e.target.value)}
                    placeholder="Ex: marcar 15 min com o líder…"
                  />
                  <Status k="bem_analise_acao" />
                </div>
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 3: Mapa de Recursos */}
        <div className="page">
          <header className="page-header">Parte 3: Cultura e Bem-Estar</header>
          <main className="page-content">
            <h3 className="tool-title">Mapa de Recursos de Apoio</h3>
            <div className="explanation-block">
              <h5>O que é?</h5><p>Mapeie canais de ajuda formais e informais.</p>
            </div>
            <fieldset>
              <legend>Minha Rede de Segurança</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>Canal Oficial da Empresa:</label>
                  <textarea
                    rows={3}
                    value={responses['recursos_canal_oficial'] || ''}
                    onChange={(e) => handleInputChange('recursos_canal_oficial', e.target.value)}
                    placeholder="Qual é o canal e como acessá-lo?"
                  />
                  <Status k="recursos_canal_oficial" />
                </div>
                <div>
                  <label>Pessoa de Confiança Interna:</label>
                  <textarea
                    rows={3}
                    value={responses['recursos_pessoa_confianca'] || ''}
                    onChange={(e) => handleInputChange('recursos_pessoa_confianca', e.target.value)}
                  />
                  <Status k="recursos_pessoa_confianca" />
                </div>
                <div>
                  <label>Recurso Externo:</label>
                  <textarea
                    rows={3}
                    value={responses['recursos_externo'] || ''}
                    onChange={(e) => handleInputChange('recursos_externo', e.target.value)}
                  />
                  <Status k="recursos_externo" />
                </div>
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 4: Carreira em Ação – Mapa de Influência */}
        <div className="page">
          <header className="page-header">Parte 4: Carreira em Ação</header>
          <main className="page-content">
            <h2 className="section-title">Carreira em Ação</h2>
            <h3 className="tool-title">Mapa de Influência e Comunicação</h3>
            <div className="explanation-block">
              <h5>O que é?</h5><p>Plano para vender ideias internamente.</p>
            </div>
            <fieldset>
              <legend>Planejamento da Influência</legend>
              <div className="space-y-4 mt-2">
                {[
                  ['infl_ideia', '1. A Ideia / Projeto a ser "Vendido":'],
                  ['infl_decisor', '2. Decisor Principal e o que ele(a) valoriza/risco:'],
                  ['infl_pitch', '3. Pitch de 1 Minuto:'],
                  ['infl_aliados_ceticos', '4. Aliados e Céticos:'],
                  ['infl_obje', '5. Principal risco/objeção e preparo:'],
                  ['infl_proximo_passo', '6. Próximo passo imediato:'],
                ].map(([key, label], i) => (
                  <div key={key}>
                    <label>{label}</label>
                    <textarea
                      rows={i === 0 ? 2 : 3}
                      value={responses[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                    <Status k={key} />
                  </div>
                ))}
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 4: Conversas Corajosas */}
        <div className="page">
          <header className="page-header">Parte 4: Carreira em Ação</header>
          <main className="page-content">
            <h3 className="tool-title">Roteiro para Conversas Corajosas</h3>
            <div className="explanation-block">
              <h5>O que é?</h5><p>Guia para estruturar conversas difíceis com foco em fatos e soluções.</p>
            </div>
            <fieldset>
              <legend>Estruturando a Conversa</legend>
              <div className="space-y-4 mt-2">
                {[
                  ['conv_medo_resultado', '1. Preparação: maior medo e resultado ideal:'],
                  ['conv_intencao', '2. Intenção (objetivo positivo):'],
                  ['conv_fatos', '3. Fatos (situação sem julgamento):'],
                  ['conv_impacto', '4. Impacto em mim:'],
                  ['conv_pedido', '5. Pedido (claro e negociável):'],
                  ['conv_pos', '6. Pós-conversa: reação, aprendizado e próximo passo:'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label>{label}</label>
                    <textarea
                      rows={2}
                      value={responses[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                    <Status k={key} />
                  </div>
                ))}
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 5: Encerramento – Sessão Final */}
        <div className="page">
          <header className="page-header">Parte 5: Encerramento</header>
          <main className="page-content">
            <h2 className="section-title">A Sessão Final</h2>
            <h3 className="tool-title">O Balanço da Transformação</h3>
            <fieldset>
              <legend>Seu Antes e Depois</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>O "Antes": maior frustração ou dúvida ao abrir o caderno?</label>
                  <textarea
                    rows={4}
                    value={responses['enc_antes'] || ''}
                    onChange={(e) => handleInputChange('enc_antes', e.target.value)}
                  />
                  <Status k="enc_antes" />
                </div>
                <div>
                  <label>O "Depois": maior mudança na perspectiva ou autoconfiança?</label>
                  <textarea
                    rows={4}
                    value={responses['enc_depois'] || ''}
                    onChange={(e) => handleInputChange('enc_depois', e.target.value)}
                  />
                  <Status k="enc_depois" />
                </div>
                <div>
                  <label>Ferramenta-chave que gerou a maior virada:</label>
                  <textarea
                    rows={4}
                    value={responses['enc_ferramenta_chave'] || ''}
                    onChange={(e) => handleInputChange('enc_ferramenta_chave', e.target.value)}
                  />
                  <Status k="enc_ferramenta_chave" />
                </div>
              </div>
            </fieldset>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>

        {/* Parte 5: Plano de Voo */}
        <div className="page">
          <header className="page-header">Parte 5: Encerramento</header>
          <main className="page-content">
            <h3 className="tool-title">O Plano de Voo</h3>
            <div className="explanation-block">
              <h5>O que é?</h5><p>Transforme a clareza em um plano de ação focado, com suporte.</p>
            </div>
            <fieldset>
              <legend>Da Clareza à Ação Consciente</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <label>A “Grande Rocha” (único projeto/habilidade de maior impacto – 90 dias):</label>
                  <textarea
                    rows={4}
                    value={responses['plano_grande_rocha'] || ''}
                    onChange={(e) => handleInputChange('plano_grande_rocha', e.target.value)}
                  />
                  <Status k="plano_grande_rocha" />
                </div>
                <div>
                  <label>Sprint inicial (3 primeiros passos – 2 semanas):</label>
                  <textarea
                    rows={4}
                    value={responses['plano_sprint_inicial'] || ''}
                    onChange={(e) => handleInputChange('plano_sprint_inicial', e.target.value)}
                    placeholder={`1. ...\n2. ...\n3. ...`}
                  />
                  <Status k="plano_sprint_inicial" />
                </div>
                <div>
                  <label>Sistema de suporte:</label>
                  <textarea
                    rows={3}
                    value={responses['plano_sistema_suporte'] || ''}
                    onChange={(e) => handleInputChange('plano_sistema_suporte', e.target.value)}
                    placeholder="Ex: colega, mentor, alarme na agenda…"
                  />
                  <Status k="plano_sistema_suporte" />
                </div>
              </div>
            </fieldset>
            <div className="tip">
              <strong>Dica Final da Terapia:</strong> Agende um horário semanal/quinzenal para revisar seu Plano de Voo.
            </div>
          </main>
          <footer className="page-footer"><span>Terapia Empresarial © 2025</span></footer>
        </div>
      </div>

      {/* CSS GLOBAL (layout A4 + tipografia + print) */}
      <style jsx global>{`
        body {
          background-color: #EAEAEA;
          font-family: 'Lora', serif;
          color: #34495E;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          counter-reset: page;
          font-size: 12px;
        }
        .page {
          width: 21cm;
          min-height: 29.7cm;
          margin: 20px auto;
          background-color: white;
          box-shadow: 0 0 15px rgba(0,0,0,0.15);
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 2.5cm 2cm;
          box-sizing: border-box;
        }
        .page-header, .page-footer {
          position: absolute;
          left: 2cm; right: 2cm;
          font-size: 0.8em;
          color: #7f8c8d;
        }
        .page-header {
          top: 1.5cm; text-align: right;
          border-bottom: 1px solid #dfe4ea; padding-bottom: 0.5rem;
        }
        .page-footer {
          bottom: 1.5cm; border-top: 1px solid #dfe4ea; padding-top: 0.5rem;
          display: flex; justify-content: space-between;
        }
        .page-footer::after {
          content: counter(page);
          counter-increment: page;
        }
        .page-content { flex-grow: 1; padding-top: 1rem; padding-bottom: 1rem; }
        h1, h2, h3, h4, legend { font-family: 'Montserrat', sans-serif; color: #2C3E50; }
        .section-title { font-size: 2.2em; }
        .tool-title { font-size: 1.6em; margin-bottom: 1rem; color: #E67E22; }
        .explanation-block {
          background-color: #f8f9fa; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;
          border-left: 4px solid #E67E22;
        }
        .explanation-block h5 { font-family: 'Montserrat', sans-serif; color: #2C3E50; font-size: 1.1em; margin-bottom: 0.25rem; }
        .tip {
          background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0.25rem;
          font-style: italic; color: #b45309; margin-top: 1.5rem;
        }
        textarea, input[type="text"] {
          border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.75rem; width: 100%;
          font-size: 1em; font-family: 'Lora', serif; transition: border-color 0.2s, box-shadow 0.2s;
        }
        textarea:focus, input[type="text"]:focus {
          outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe;
        }
        label { font-family: 'Montserrat', sans-serif; font-weight: 700; display: block; margin-bottom: 0.5rem; font-size: 1em; color: #34495E; }
        fieldset { border: 1px solid #e5e7eb; padding: 1rem 1.5rem 1.5rem 1.5rem; }
        legend { padding: 0 0.5rem; font-size: 1.2em; }
        @media print {
          body { background: none; }
          .page { margin: 0; box-shadow: none; min-height: 29.7cm; page-break-after: always; }
          .page:last-child { page-break-after: avoid; }
          .sticky { display: none !important; }
        }
      `}</style>
    </>
  )
}
