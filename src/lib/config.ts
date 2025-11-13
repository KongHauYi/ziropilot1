export const HF_ENDPOINT = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

export function getHfToken(): string {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) {
    throw new Error('HUGGINGFACE_API_TOKEN is not set. Please configure it in your environment variables.');
  }
  return token;
}

export function maskToken(token: string): string {
  if (!token) return '***';
  if (token.length < 8) return '***';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
