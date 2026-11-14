import { OAuth2Client } from 'google-auth-library';

function cliente() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REDIRECT_URI en el .env');
  }
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

// URL de Google a la que mandamos al navegador para que inicie sesión
function urlDeLogin(state) {
  return cliente().generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account' // siempre deja elegir la cuenta
  });
}

// Cambia el "code" que devuelve Google por los datos del usuario
async function perfilDesdeCodigo(code) {
  const c = cliente();
  const { tokens } = await c.getToken(code);
  const ticket = await c.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const p = ticket.getPayload();

  return {
    google_id: p.sub,
    email: p.email,
    nombre: p.name || p.email,
    foto: p.picture || null
  };
}
export default { urlDeLogin, perfilDesdeCodigo };