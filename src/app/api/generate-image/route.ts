import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Helpful environment logs for debugging on Vercel (do not log secrets)
    console.info('NODE_ENV:', process.env.NODE_ENV);
    console.info('VERCEL:', process.env.VERCEL);
    console.info('VERCEL_ENV:', process.env.VERCEL_ENV);
    console.info('VERCEL_URL:', process.env.VERCEL_URL);
    // 1. Extrai o 'prompt' do corpo da requisição.
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "O prompt da cena é obrigatório" },
        { status: 400 }
      );
    }

    // 2. Pega a chave de acesso do Unsplash das variáveis de ambiente (mais seguro).
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    // Do not log the key value in production; just log presence to help debugging
    console.info("UNSPLASH_ACCESS_KEY configured:", !!unsplashAccessKey);
    // Log the prompt for easy trace (avoid logging in production if sensitive)
    try { const body = await req.clone().json().catch(() => null); console.info('request body prompt:', body?.prompt ?? '(none)'); } catch (e) { /* ignore */ }
    if (!unsplashAccessKey) {
      console.error("A chave da API do Unsplash não foi configurada no servidor.");
      return NextResponse.json(
        { error: "A API de imagem não está configurada corretamente." },
        { status: 500 }
      );
    }

    // 3. Monta a URL da API do Unsplash para buscar a melhor foto em paisagem.
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      prompt
    )}&per_page=1&orientation=landscape`;

    // 4. Faz a chamada para a API do Unsplash.
    // Helper: fetch with a couple retries for transient errors (e.g., 429)
    async function fetchWithRetry(input: string, init: RequestInit, attempts = 2, delayMs = 700) {
      let lastErr: any;
      for (let i = 0; i <= attempts; i++) {
        try {
          const res = await fetch(input, init);
          return res;
        } catch (err) {
          lastErr = err;
          if (i < attempts) await new Promise((r) => setTimeout(r, delayMs));
        }
      }
      throw lastErr;
    }

    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Client-ID ${unsplashAccessKey}`,
      },
    }, 2, 700);

    if (!response.ok) {
      const body = await response.text().catch(() => "(no body)");
      console.error("Erro na API do Unsplash:", response.status, body.slice ? body.slice(0, 200) : body);
      // Map Unsplash failures to a 502/503 for the client, but provide a fallback image when possible
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: "Chave do Unsplash inválida ou sem permissão." }, { status: 502 });
      }
      if (response.status === 429) {
        // Rate limited — return a 503 so client may retry later
        return NextResponse.json({ error: "Rate limited pelo Unsplash. Tente novamente mais tarde." }, { status: 503 });
      }
      // For other failures, continue and return a friendly fallback image
      console.warn("Usando imagem fallback por problema no Unsplash.");
      const fallback = "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=400&auto=format&fit=crop";
      return NextResponse.json({ imageUrl: fallback });
    }

    const data = await response.json();
    const imageUrl = data.results[0]?.urls?.small; // Pega a URL da imagem em tamanho pequeno.

    if (!imageUrl) {
      // Se não encontrar imagem, use um placeholder para não quebrar o front-end.
      console.warn(`Nenhuma imagem encontrada no Unsplash para o prompt: "${prompt}"`);
      const fallback = "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=400&auto=format&fit=crop";
      return NextResponse.json({ imageUrl: fallback });
    }

    // 5. Retorna a URL da imagem encontrada.
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("Erro interno no servidor ao buscar imagem:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}
