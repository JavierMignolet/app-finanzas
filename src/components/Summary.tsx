import React, { useState, useRef } from "react";
import { Transaction } from "../types";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface SummaryProps {
  costs: Transaction[];
  incomes: Transaction[];
  goBack: () => void;
  setCosts: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setIncomes: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const Summary: React.FC<SummaryProps> = ({
  costs,
  incomes,
  goBack,
  setCosts,
  setIncomes,
}) => {
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [editing, setEditing] = useState<{
    type: "income" | "cost";
    index: number;
  } | null>(null);

  const [editData, setEditData] = useState<Transaction>({
    id: "",
    fecha: "",
    tipo: "",
    descripcion: "",
    monto: 0,
  });

  const summaryRef = useRef<HTMLDivElement>(null);

  const formatDate = (fechaStr: string): string => {
    const fecha = new Date(fechaStr);
    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = String(fecha.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const handleEdit = (
    type: "income" | "cost",
    index: number,
    data: Transaction
  ) => {
    setEditing({ type, index });
    setEditData(data);
  };

  const handleSaveEdit = () => {
    if (editing) {
      if (editing.type === "income") {
        const updated = [...incomes];
        updated[editing.index] = editData;
        setIncomes(updated);
        toast.success("Ingreso modificado correctamente");
      } else {
        const updated = [...costs];
        updated[editing.index] = editData;
        setCosts(updated);
        toast.success("Costo modificado correctamente");
      }
      setEditing(null);
    }
  };

  const handleDelete = (type: "income" | "cost", index: number) => {
    if (type === "income") {
      const updated = incomes.filter((_, i) => i !== index);
      setIncomes(updated);
      toast.success("Ingreso eliminado correctamente");
    } else {
      const updated = costs.filter((_, i) => i !== index);
      setCosts(updated);
      toast.success("Costo eliminado correctamente");
    }
  };

  const limpiarFiltros = () => {
    setFilterType("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const filtrarPorFecha = (fecha: string) => {
    const date = new Date(fecha);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  };

  const filteredCosts = costs.filter(
    (cost) =>
      (!filterType || cost.tipo === filterType) && filtrarPorFecha(cost.fecha)
  );

  const filteredIncomes = incomes.filter(
    (income) =>
      (!filterType || income.tipo === filterType) &&
      filtrarPorFecha(income.fecha)
  );

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.monto, 0);
  const totalIncomes = filteredIncomes.reduce(
    (sum, income) => sum + income.monto,
    0
  );
  const balance = totalIncomes - totalCosts;

  const exportPDF = () => {
    if (summaryRef.current) {
      html2canvas(summaryRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = (pdf as any).getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        const fecha = new Date().toLocaleDateString().replace(/\//g, "-");
        pdf.save(`Resumen_Financiero_${fecha}.pdf`);
      });
    }
  };

  return (
    <div className="container mt-4">
      <h2>Resumen General</h2>

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col">
          <label>Desde</label>
          <input
            type="date"
            className="form-control"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>
        <div className="col">
          <label>Hasta</label>
          <input
            type="date"
            className="form-control"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
        <div className="col">
          <label>Tipo</label>
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="Fijo">Costo Fijo</option>
            <option value="Variable">Costo Variable</option>
            <option value="ingreso bruto">Ingreso Bruto</option>
            <option value="ingreso neto">Ingreso Neto</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <button className="btn btn-secondary me-2" onClick={limpiarFiltros}>
          Limpiar Filtros
        </button>
        <button className="btn btn-primary me-2" onClick={goBack}>
          Volver
        </button>
        <button className="btn btn-success" onClick={exportPDF}>
          Exportar PDF
        </button>
      </div>

      {/* Contenido exportable */}
      <div ref={summaryRef}>
        {/* Ingresos */}
        <h4>Ingresos</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncomes.map((income, index) => (
              <tr key={income.id}>
                <td>
                  {editing?.type === "income" && editing.index === index ? (
                    <input
                      type="date"
                      value={editData.fecha}
                      onChange={(e) =>
                        setEditData({ ...editData, fecha: e.target.value })
                      }
                    />
                  ) : (
                    formatDate(income.fecha)
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === index ? (
                    <input
                      type="text"
                      value={editData.tipo}
                      onChange={(e) =>
                        setEditData({ ...editData, tipo: e.target.value })
                      }
                    />
                  ) : (
                    income.tipo
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === index ? (
                    <input
                      type="text"
                      value={editData.descripcion}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  ) : (
                    income.descripcion
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === index ? (
                    <input
                      type="number"
                      value={editData.monto}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          monto: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    income.monto
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === index ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleSaveEdit}
                    >
                      Guardar
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit("income", index, income)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete("income", index)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Costos */}
        <h4>Costos</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCosts.map((cost, index) => (
              <tr key={cost.id}>
                <td>
                  {editing?.type === "cost" && editing.index === index ? (
                    <input
                      type="date"
                      value={editData.fecha}
                      onChange={(e) =>
                        setEditData({ ...editData, fecha: e.target.value })
                      }
                    />
                  ) : (
                    formatDate(cost.fecha)
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === index ? (
                    <input
                      type="text"
                      value={editData.tipo}
                      onChange={(e) =>
                        setEditData({ ...editData, tipo: e.target.value })
                      }
                    />
                  ) : (
                    cost.tipo
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === index ? (
                    <input
                      type="text"
                      value={editData.descripcion}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  ) : (
                    cost.descripcion
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === index ? (
                    <input
                      type="number"
                      value={editData.monto}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          monto: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    cost.monto
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === index ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleSaveEdit}
                    >
                      Guardar
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit("cost", index, cost)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete("cost", index)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <h4>Resumen de Totales</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Total Ingresos</th>
              <th>Total Costos</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${totalIncomes.toFixed(2)}</td>
              <td>${totalCosts.toFixed(2)}</td>
              <td>${balance.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Summary;
