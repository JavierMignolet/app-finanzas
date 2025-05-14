import React, { useState } from "react";
import { Transaction } from "../types";
import { toast } from "react-toastify";

interface IncomeFormProps {
  setIncomes: React.Dispatch<React.SetStateAction<Transaction[]>>;
  incomes: Transaction[];
  goBack: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  setIncomes,
  incomes,
  goBack,
}) => {
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("ingreso bruto");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: Transaction = {
      id: crypto.randomUUID(),
      fecha,
      tipo,
      descripcion,
      monto: parseFloat(monto),
    };
    setIncomes([...incomes, data]);
    toast.success("Ingreso guardado correctamente");
    resetForm();
  };

  const resetForm = () => {
    setFecha("");
    setTipo("ingreso bruto");
    setDescripcion("");
    setMonto("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar Ingreso</h2>
      <div className="mb-3">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          className="form-control"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Tipo</label>
        <select
          className="form-select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="ingreso bruto">Ingreso Bruto</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <input
          type="text"
          className="form-control"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Monto</label>
        <input
          type="number"
          className="form-control"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-success">
        Guardar
      </button>
      <button type="button" className="btn btn-secondary m-2" onClick={goBack}>
        Volver
      </button>
    </form>
  );
};

export default IncomeForm;
