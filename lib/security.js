export function validateStrongPassword(password){
  const p=String(password||'');
  if(p.length<8)return 'La contraseña debe tener al menos 8 caracteres.';
  if(!/[A-Z]/.test(p)||!/[a-z]/.test(p)||!/[0-9]/.test(p)||!/[^A-Za-z0-9]/.test(p))return 'Usa mayúscula, minúscula, número y símbolo.';
  return null;
}
export const LOCKOUT_ATTEMPTS=5;
export const LOCKOUT_MINUTES=15;
