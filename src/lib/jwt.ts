// Simple JWT implementation for unsubscribe tokens
export const createUnsubscribeToken = (subscriberId: string, email: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: subscriberId,
    email: email,
    purpose: 'unsubscribe',
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  }));
  
  const signature = btoa(`${header}.${payload}.${import.meta.env.VITE_ADMIN_PASSWORD}`);
  return `${header}.${payload}.${signature}`;
};

export const verifyUnsubscribeToken = (token: string): { subscriberId: string; email: string } | null => {
  try {
    const [header, payload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = btoa(`${header}.${payload}.${import.meta.env.VITE_ADMIN_PASSWORD}`);
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    // Verify purpose
    if (decodedPayload.purpose !== 'unsubscribe') {
      return null;
    }
    
    return {
      subscriberId: decodedPayload.sub,
      email: decodedPayload.email
    };
  } catch {
    return null;
  }
};