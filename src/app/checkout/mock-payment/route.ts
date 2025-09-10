import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const amount = searchParams.get('amount')
    const company = searchParams.get('company')

    return new Response(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Mock - Guia de Terapia</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Mock
          </h1>
          
          <p class="text-gray-600 text-sm mb-4">
            Esta é uma simulação de pagamento para desenvolvimento
          </p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Empresa:</span>
            <span class="font-medium">${decodeURIComponent(company || 'N/A')}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Valor:</span>
            <span class="font-bold text-xl text-green-600">R$ ${amount || '0'}</span>
          </div>
        </div>

        <div class="space-y-3">
          <button 
            onclick="simulatePayment(true)"
            class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Simular Pagamento Aprovado
          </button>
          
          <button 
            onclick="simulatePayment(false)"
            class="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Simular Pagamento Rejeitado
          </button>
          
          <a href="/checkout" class="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Voltar ao Checkout
          </a>
        </div>
      </div>

      <script>
        function simulatePayment(approved) {
          if (approved) {
            alert('Pagamento aprovado! Redirecionando...');
            window.location.href = '/checkout/sucesso';
          } else {
            alert('Pagamento rejeitado!');
            window.location.href = '/checkout';
          }
        }
      </script>
    </body>
    </html>
  `, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
