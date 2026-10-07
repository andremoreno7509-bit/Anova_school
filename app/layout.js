import './style.css';
export const metadata={
  title:'Colegio Simón Bolívar del Pedregal · Portal Académico',
  description:'Portal académico del Colegio Simón Bolívar del Pedregal, powered by A-NOVA.',
  icons:{icon:'/csb-favicon.png',shortcut:'/csb-favicon.png',apple:'/csb-favicon.png'}
};
export default function Layout({children}){return <html lang="es"><body>{children}</body></html>}
