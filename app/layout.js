import './styles.css';

export const metadata = {
  title: 'Regionalismos de Colombia | Reto Quiz',
  description: 'Trivia para poner a prueba lo que sabes de los regionalismos colombianos.',
};

export default function RootLayout({ children }) {
  return <html lang="es"><body>{children}</body></html>;
}
