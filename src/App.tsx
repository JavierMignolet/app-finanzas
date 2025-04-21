import { useState, useEffect } from "react";
import CostForm from "./components/CostForm";
import IncomeForm from "./components/IncomeForm";
import Summary from "./components/Summary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

export interface Transaction {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  monto: number;
}

function App() {
  const [view, setView] = useState<"home" | "cost" | "income" | "summary">(
    "home"
  );
  const [costs, setCosts] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [showSplash, setShowSplash] = useState(true);

  // Splash inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const storedCosts = localStorage.getItem("costs");
    const storedIncomes = localStorage.getItem("incomes");
    if (storedCosts) setCosts(JSON.parse(storedCosts));
    if (storedIncomes) setIncomes(JSON.parse(storedIncomes));
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("costs", JSON.stringify(costs));
  }, [costs]);

  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
  }, [incomes]);

  return (
    <div className="container-fluid p-0">
      <ToastContainer />
      {showSplash ? (
        <div className="splash-screen">
          <img src="public/favicon.png" alt="Logo" className="splash-logo" />
        </div>
      ) : (
        <div className="container mt-5">
          {view === "home" && (
            <div className="text-center">
              <h1>Bienvenido</h1>
              <button
                className="btn btn-primary m-2"
                onClick={() => setView("cost")}
              >
                Agregar Costos
              </button>
              <button
                className="btn btn-success m-2"
                onClick={() => setView("income")}
              >
                Agregar Ingresos
              </button>
              <button
                className="btn btn-secondary m-2"
                onClick={() => setView("summary")}
              >
                Ver Resumen
              </button>
            </div>
          )}

          {view === "cost" && (
            <CostForm
              setCosts={setCosts}
              costs={costs}
              goBack={() => setView("home")}
            />
          )}
          {view === "income" && (
            <IncomeForm
              setIncomes={setIncomes}
              incomes={incomes}
              goBack={() => setView("home")}
            />
          )}
          {view === "summary" && (
            <Summary
              costs={costs}
              incomes={incomes}
              goBack={() => setView("home")}
              setCosts={setCosts}
              setIncomes={setIncomes}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
