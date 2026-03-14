import BeamsBackground from './BeamsBackground';

/**
 * AuthLayout — Layout commun pour les pages d'authentification (Login, Register)
 * Applique le fond animé BeamsBackground
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu à afficher (Card formulaire)
 * @param {'subtle'|'medium'|'strong'} [props.intensity='strong'] - Intensité du fond
 */
function AuthLayout({ children, intensity = 'strong' }) {
  return (
    <BeamsBackground intensity={intensity}>
      {children}
    </BeamsBackground>
  );
}

export default AuthLayout;
