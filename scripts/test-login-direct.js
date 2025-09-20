// Script para testar login diretamente
const fetch = require('node-fetch')

async function testLogin() {
    try {
        console.log('🧪 Testando login diretamente na API...')

        const loginData = {
            cpf: '019.329.996-80',
            password: '19092004'
        }

        console.log('Dados enviados:', loginData)

        const response = await fetch('http://localhost:3000/api/employees/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        })

        console.log('Status da resposta:', response.status)
        console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()))

        const responseText = await response.text()
        console.log('Resposta bruta:', responseText)

        try {
            const responseJson = JSON.parse(responseText)
            console.log('Resposta JSON:', responseJson)
        } catch (parseError) {
            console.log('❌ Erro ao fazer parse do JSON:', parseError.message)
        }

    } catch (error) {
        console.error('❌ Erro na requisição:', error.message)
        console.error('Stack trace:', error.stack)
    }
}

testLogin()