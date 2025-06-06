const OPENROUTER_API_KEY = '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';

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // Early return for empty text
    if (!text.trim()) {
      return 'Aucun texte à traduire';
    }

    // Map language codes to prompts
    const languagePrompt = {
      'en': 'Translate this text to English',
      'es': 'Translate this text to Spanish',
      'fr': 'Translate this text to French',
      'it': 'Translate this text to Italian'
    }[targetLanguage] || 'Translate this text to English';

    // Make API request with proper headers and error handling
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'OkMeeting',
        'OpenAI-Organization': 'OkMeeting'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          {
            role: 'user',
            content: `${languagePrompt}:\n\n${text.trim()}\n\nProvide only the translation, no explanations or additional text.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `API error ${response.status}: ${
          errorData?.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Format de réponse API invalide');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Translation error:', errorMessage);
    throw new Error(`Erreur de traduction: ${errorMessage}`);
  }
}