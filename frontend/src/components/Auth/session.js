// utils/session.js
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9) + Date.now();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};