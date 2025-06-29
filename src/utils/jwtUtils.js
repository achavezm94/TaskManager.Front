// src/utils/jwtUtils.js
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const claims = JSON.parse(jsonPayload);
    
    // Mapear claims específicos a propiedades amigables
    return {
      id: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      name: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      email: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      role: claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      exp: claims.exp
    };
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
};