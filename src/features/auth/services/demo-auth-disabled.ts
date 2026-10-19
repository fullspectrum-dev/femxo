const unavailable = (): never => {
  throw new Error("Demo authentication is not enabled for this production build.");
};

export const DEMO_CREDENTIALS = {};

export const demoAuth = {
  register: unavailable,
  requestLoginOtp: unavailable,
  loginWithPassword: unavailable,
  verifyOtp: unavailable,
  resendOtp: unavailable,
  requestPasswordRecovery: unavailable,
  resetPassword: unavailable,
};
