import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="flex flex-col h-screen justify-between">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="font-bold mt-4 mb-4">404 - Página não encontrada</h1>
        <Link to="/tasks">Voltar a página inicial</Link>
      </div>
    </main>
  )
}