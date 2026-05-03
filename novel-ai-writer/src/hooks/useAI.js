import { useState, useCallback } from 'react';
import apiService from '../services/apiService';

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async (messages, onChunk, options = {}) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await apiService.callAI(messages, onChunk, options);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateStream = useCallback(async (prompt, systemPrompt, onChunk, options = {}) => {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });
    return generate(messages, onChunk, options);
  }, [generate]);

  return { isGenerating, error, generate, generateStream, setError };
};