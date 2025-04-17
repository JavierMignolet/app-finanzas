import React, { useState } from "react";
import { Transaction } from "../types";
import { toast } from "react-toastify";

interface CostFormProps {
  setCosts: React.Dispatch<React.SetStateAction<Transaction[]>>;
  costs: Transaction[];
  goBack: () => void;
}

const CostForm: React.FC<CostFormProps> = ({ setCosts, costs, goBack }) => {
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("Fijo");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");

  const resetForm = () => {
    setFecha("");
    setTipo("Fijo");
    setDescripcion("");
    setMonto("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: Transaction = {
      id: crypto.randomUUID(),
      fecha,
      tipo,
      descripcion,
      monto: parseFloat(monto),
    };
    setCosts([...costs, data]);
    toast.success("Costo guardado correctamente");
    resetForm();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar Costo</h2>
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
          required
        >
          <option value="Fijo">Fijo</option>
          <option value="Variable">Variable</option>
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
      <button type="submit" className="btn btn-primary">
        Guardar
      </button>
      <button type="button" className="btn btn-secondary m-2" onClick={goBack}>
        Volver
      </button>
    </form>
  );
};

export default CostForm;
