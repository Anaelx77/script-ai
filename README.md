# 🎬 Script AI

Um gerador inteligente de roteiros com áudios para vídeos curtos, alimentado por IA. Crie roteiros profissionais em múltiplos idiomas com imagens geradas automaticamente e síntese de voz.

## 🌐 Visualização Online

🚀 [Visualizar o site](https://script-ai-eta.vercel.app/)

## ✨ Características

- 🤖 **Geração de Roteiros com IA** - Usa Google Gemini 2.5 Flash para gerar roteiros criativos
- 🎨 **Imagens Automáticas** - Gera imagens para cada cena usando Unsplash API
- 🌍 **Múltiplos Idiomas** - Suporte para 8 idiomas:
  - 🇪🇸 Espanhol
  - 🇧🇷 Português (Brasil)
  - 🇺🇸 Inglês
  - 🇫🇷 Francês
  - 🇩🇪 Alemão
  - 🇮🇹 Italiano
  - 🇯🇵 Japonês
  - 🇨🇳 Chinês
- 🔊 **Síntese de Voz** - Ouve o roteiro completo com pronúncia natural no idioma selecionado
- 📋 **Interface Moderna** - Design elegante e responsivo com tema escuro
- 📋 **Copiar Roteiro** - Exporte o roteiro completo facilmente

## 🚀 Como Usar

### 1. **Instalar Dependências**

```bash
npm install
```

### 2. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
UNSPLASH_ACCESS_KEY=sua_chave_do_unsplash_aqui
```

**Obter as chaves:**
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) - Gratuita, crie uma conta Google
- [Unsplash API Key](https://unsplash.com/oauth/applications) - Gratuita, crie uma conta no Unsplash

### 3. **Executar o Projeto**

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📖 Guia de Uso

### Passo 1: Configuração
1. **Insira sua Google Gemini API Key** no campo "Google Gemini API Key"
2. Clique em **"Salvar"** para armazenar localmente
3. **Selecione o idioma** desejado no dropdown "Idioma do Roteiro e Áudio"

### Passo 2: Criar Roteiro
1. **Digite a ideia** do vídeo no campo "Ideia do Vídeo"
   - Exemplo: "Um tutorial sobre como fazer café perfeito"
   - Seja descritivo para melhores resultados
2. Clique em **"Gerar Roteiro e Imagens"**
3. Aguarde enquanto a IA cria o roteiro e gera as imagens

### Passo 3: Visualizar e Usar
- **Ouvir**: Clique em "Ouvir Roteiro Completo" para ouvir com síntese de voz
- **Copiar**: Use o botão "Copy" para copiar todo o roteiro para a área de transferência
- **Visualizar**: Veja cada cena com imagem, descrição e narração

## 🛠️ Tecnologias Utilizadas

- **[Next.js](https://nextjs.org/)** - Framework React moderno
- **[React](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem tipada
- **[Google Generative AI](https://ai.google.dev/)** - Geração de roteiros
- **[Unsplash API](https://unsplash.com/api)** - Banco de imagens
- **[React Bootstrap](https://react-bootstrap.github.io/)** - Componentes UI
- **[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)** - Síntese de voz

## 📁 Estrutura do Projeto

```
scriptai/
├── src/
│   └── app/
│       ├── api/
│       │   └── generate-image/
│       │       └── route.ts          # API para gerar imagens
│       ├── globals.css               # Estilos globais
│       ├── layout.tsx                # Layout principal
│       └── page.tsx                  # Página principal
├── public/                           # Arquivos estáticos
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Como Obter |
|----------|-----------|-----------|
| `UNSPLASH_ACCESS_KEY` | Chave da API Unsplash | [https://unsplash.com/oauth/applications](https://unsplash.com/oauth/applications) |

**Nota:** A Google Gemini API Key é inserida diretamente no app e armazenada localmente (não é enviada ao servidor).

## 🎯 Exemplos de Uso

### Exemplo 1: Tutorial de Culinária
```
Ideia: "Como fazer um smoothie de frutas vermelhas saudável"
Idioma: Português (Brasil)
Resultado: Roteiro com 4-5 cenas, imagens de ingredientes e smoothie, áudio em português
```

### Exemplo 2: Story de História
```
Ideia: "Uma história de aventura em uma floresta misteriosa"
Idioma: Espanhol
Resultado: Roteiro narrativo com cenários da floresta e áudio em espanhol
```


## 🐛 Troubleshooting

### "API Key inválida"
- Verifique se a chave do Google Gemini está correta
- Certifique-se de que a API está ativada em [aistudio.google.com](https://aistudio.google.com)

### "Rate limited pelo Unsplash"
- Aguarde alguns minutos
- A API tem limite de requisições gratuitas

### "Imagem não encontrada"
- A aplicação usa uma imagem fallback automaticamente
- Tente com descritivos mais específicos

## 📝 Licença

Este projeto está disponível para uso livre.
