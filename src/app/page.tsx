"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Spinner,
  InputGroup,
  Card,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the types for our data
interface Scene {
  scene_description: string;
  narration: string;
  image_prompt?: string;
  image_url?: string | null | 'loading'; // Add 'loading' and null states
}

interface ScriptData {
  scenes: Scene[];
  // audio_url is removed as we use client-side Web Speech API
}

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("es-ES"); // Default: Spanish
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Gerando Roteiro...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScriptData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- LOCAL STORAGE HYDRATION ---
  useEffect(() => {
    const storedApiKey = localStorage.getItem("geminiApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // --- EVENT HANDLERS ---
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const saveApiKey = () => {
    localStorage.setItem("geminiApiKey", apiKey);
    alert("API Key salva no Local Storage!");
  };

  const handleSpeakScript = () => {
    if (!result || result.scenes.length === 0) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speech = window.speechSynthesis;
    let currentSceneIndex = 0;

    const speakNextScene = () => {
      if (currentSceneIndex < result.scenes.length) {
        const utterance = new SpeechSynthesisUtterance(result.scenes[currentSceneIndex].narration);
        utterance.lang = language; // Speak in selected language

        utterance.onend = () => {
          currentSceneIndex++;
          speakNextScene();
        };
        utterance.onerror = (event) => {
          console.error('SpeechSynthesisUtterance.onerror', event);
          setIsSpeaking(false);
        };
        speech.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    };

    // Cancel any ongoing speech before starting new one
    speech.cancel();
    speakNextScene();
  };

  // --- CORE LOGIC ---
  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Por favor, insira sua API Key do Gemini.");
      return;
    }
    if (!prompt) {
      setError("Por favor, insira uma ideia para o roteiro.");
      return;
    }

    setLoading(true);
    setLoadingMessage("1/2: Gerando roteiro de texto...");
    setError(null);
    setResult(null);
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    try {
      // --- 1. Generate the Script Text ---
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // CORRECTED MODEL NAME

      const languageNames: { [key: string]: string } = {
        'es-ES': 'español',
        'pt-BR': 'português brasileiro',
        'en-US': 'inglês',
        'fr-FR': 'francês',
        'de-DE': 'alemão',
        'it-IT': 'italiano',
        'ja-JP': 'japonês',
        'zh-CN': 'chinês',
      };

      const selectedLanguageName = languageNames[language] || 'español';

      const generationPrompt = `
        Você é um assistente de criação de roteiros para vídeos curtos.
        Sua tarefa é gerar um roteiro a partir do tema fornecido pelo usuário.
        O resultado DEVE ser um objeto JSON válido.
        O JSON deve ter uma chave "scenes", um array de objetos onde cada objeto contém "scene_description" e "narration".
        Ambos os campos devem estar em ${selectedLanguageName.toUpperCase()}.
        Exemplo: { "scenes": [{ "scene_description": "...", "narration": "..." }] }
        TEMA DO USUÁRIO: "${prompt}"
      `;

      const generationResult = await model.generateContent(generationPrompt);
      const responseText = generationResult.response.text();
      const cleanedJsonString = responseText.replace(/^```json\n|```$/g, "").trim();
      const scriptResult = JSON.parse(cleanedJsonString) as ScriptData;

      // --- 2. Display Script and Prepare for Images ---
      setLoadingMessage("2/2: Gerando imagens para as cenas...");
      scriptResult.scenes.forEach(scene => {
        scene.image_prompt = scene.scene_description;
        scene.image_url = 'loading'; // Set initial state to loading
      });
      setResult(scriptResult);

      // --- 3. Generate Images Asynchronously ---
      const imagePromises = scriptResult.scenes.map(async (scene) => {
        try {
          const imageResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: scene.scene_description }),
          });

          if (imageResponse.ok) {
            const { imageUrl } = await imageResponse.json();
            return { ...scene, image_url: imageUrl };
          }
        } catch (e) {
          console.error('Image generation error:', e);
        }
        // If anything fails, return the scene with a null URL to indicate failure
        return { ...scene, image_url: null };
      });

      const scenesWithImages = await Promise.all(imagePromises);
      setResult({ ...scriptResult, scenes: scenesWithImages });

    } catch (e: any) {
      console.error(e);
      setError(`Ocorreu um erro: ${e.message}. Verifique sua API Key e a formatação da resposta da IA.`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER METHOD ---
  return (
    <Container className="my-5">
      <header className="text-center mb-5 animated-fade">
        <h1><span role="img" aria-label="Clapper board">🎬</span> Script AI</h1>
        <p className="muted">Gere roteiros e imagens para seus vídeos com IA.</p>
      </header>

      <main>
        <Card className="mb-4 card">
          <Card.Body>
            <Card.Title>1. Configuração</Card.Title>
            <Form.Group className="mb-3" controlId="apiKey">
              <Form.Label>Google Gemini API Key</Form.Label>
              <InputGroup>
                <Form.Control type="password" placeholder="Insira sua API Key do Gemini" value={apiKey} onChange={handleApiKeyChange} disabled={loading} />
                <Button variant="outline-primary" onClick={saveApiKey} disabled={loading}>Salvar</Button>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="unsplashApiKey">
            </Form.Group>
            <Form.Group className="mb-3" controlId="language">
              <Form.Label>Idioma do Roteiro e Áudio</Form.Label>
              <Form.Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading}
              >
                <option value="es-ES">🇪🇸 Espanhol</option>
                <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                <option value="en-US">🇺🇸 Inglês</option>
                <option value="fr-FR">🇫🇷 Francês</option>
                <option value="de-DE">🇩🇪 Alemão</option>
                <option value="it-IT">🇮🇹 Italiano</option>
                <option value="ja-JP">🇯🇵 Japonês</option>
                <option value="zh-CN">🇨🇳 Chinês</option>
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4 card">
          <Card.Body>
            <Card.Title>2. Ideia do Vídeo</Card.Title>
            <Form.Group className="mb-3" controlId="prompt">
              <Form.Control as="textarea" rows={4} placeholder="Ex: Gere uma história de Romance..." value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={loading} />
            </Form.Group>
            <Button variant="primary" size="lg" onClick={handleGenerate} disabled={loading || !apiKey} className="w-100">
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">{loadingMessage}</span>
                </>
              ) : ("Gerar Roteiro e Imagens")}
            </Button>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}

        {result && (
          <Card className="card">
            <Card.Header as="h3">Roteiro Gerado</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Button
                  variant={isSpeaking ? "danger" : "success"}
                  onClick={handleSpeakScript}
                  disabled={!result.scenes.length || isSpeaking && !window.speechSynthesis.speaking}
                >
                  {isSpeaking ? "Parar Leitura" : "Ouvir Roteiro Completo"}
                </Button>
              </div>
              <h5>Cenas</h5>
              {result.scenes.map((scene, index) => (
                <Card key={index} className="mb-3 card animated-fade">
                  {/* Image on top, content below for clearer layout on all devices */}
                  <div>
                    {scene.image_url === 'loading' && (
                      <div className="image-placeholder p-3" style={{ height: 220 }}>
                        <Spinner animation="border" variant="secondary" />
                      </div>
                    )}

                    {scene.image_url && scene.image_url !== 'loading' && (
                      // use plain img to apply our .scene-image class
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="scene-image" src={scene.image_url as string} alt={scene.scene_description} />
                    )}

                    {!scene.image_url && scene.image_url !== 'loading' && (
                      <div className="image-placeholder p-3 muted">
                        <span role="img" aria-label="Cross mark">❌</span>
                        <div>Imagem não encontrada.</div>
                      </div>
                    )}
                  </div>

                  <Card.Body className="scene-content">
                    <Card.Title>Cena {index + 1}</Card.Title>
                    <Card.Text><strong>Narração:</strong> {scene.narration}</Card.Text>
                    <Card.Footer className="muted" style={{ fontSize: '0.8rem' }}><strong>Prompt da Imagem:</strong> {scene.image_prompt}</Card.Footer>
                  </Card.Body>
                </Card>
              ))}
              {/* Full script (combined narrations) */}
              <Card className="mt-3 card">
                <Card.Header as="h3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Roteiro Completo</span>
                    <Button
                      variant={copied ? "success" : "outline-primary"}
                      size="sm"
                      onClick={async () => {
                        try {
                          const text = result.scenes.map((s) => s.narration).join("\n\n");
                          await navigator.clipboard.writeText(text);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (err) {
                          console.error('Erro ao copiar:', err);
                        }
                      }}
                      aria-label="Copiar roteiro completo"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                    {result.scenes.map((s) => s.narration).join("\n\n")}
                  </div>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        )}
      </main>
    </Container>
  );
}