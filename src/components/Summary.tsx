import React, { useState, useRef } from "react";
import { Transaction } from "../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";

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
  const [showAllMonths, setShowAllMonths] = useState(false);
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

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isCurrentMonth = (dateStr: string): boolean => {
    const [year, month] = dateStr.split("-");
    return (
      parseInt(month) - 1 === currentMonth && parseInt(year) === currentYear
    );
  };

  const isPreviousMonth = (fecha: string) => {
    const date = new Date(fecha);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
  };

  const shouldInclude = (t: Transaction) => {
    const inDateRange =
      (!filterStartDate || t.fecha >= filterStartDate) &&
      (!filterEndDate || t.fecha <= filterEndDate);
    const typeMatch = !filterType || t.tipo === filterType;
    return typeMatch && inDateRange;
  };

  const filteredIncomes = incomes.filter(
    (c) => shouldInclude(c) && (showAllMonths || isCurrentMonth(c.fecha))
  );
  const filteredCosts = costs.filter(
    (c) => shouldInclude(c) && (showAllMonths || isCurrentMonth(c.fecha))
  );

  const previousIncomes = incomes.filter(
    (i) => isPreviousMonth(i.fecha) && shouldInclude(i)
  );
  const previousCosts = costs.filter(
    (c) => isPreviousMonth(c.fecha) && shouldInclude(c)
  );

  const totalIncomes = filteredIncomes.reduce((sum, i) => sum + i.monto, 0);
  const totalCosts = filteredCosts.reduce((sum, c) => sum + c.monto, 0);
  const balance = totalIncomes - totalCosts;

  const prevBalance =
    previousIncomes.reduce((sum, i) => sum + i.monto, 0) -
    previousCosts.reduce((sum, c) => sum + c.monto, 0);

  const totalBalanceAcumulado = balance + prevBalance;

  const beneficioBruto =
    incomes
      .filter((i) => i.tipo === "ingreso bruto" && shouldInclude(i))
      .reduce((sum, i) => sum + i.monto, 0) -
    costs
      .filter((c) => c.tipo === "Variable" && shouldInclude(c))
      .reduce((sum, c) => sum + c.monto, 0);

  const handleEdit = (
    type: "income" | "cost",
    index: number,
    data: Transaction
  ) => {
    setEditing({ type, index });
    setEditData(data);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const updated = editing.type === "income" ? [...incomes] : [...costs];
    updated[editing.index] = editData;

    if (editing.type === "income") {
      setIncomes(updated);
      toast.success("Ingreso actualizado");
    } else {
      setCosts(updated);
      toast.success("Costo actualizado");
    }

    setEditing(null);
  };

  const handleDelete = (type: "income" | "cost", index: number) => {
    if (type === "income") {
      setIncomes(incomes.filter((_, i) => i !== index));
      toast.success("Ingreso eliminado");
    } else {
      setCosts(costs.filter((_, i) => i !== index));
      toast.success("Costo eliminado");
    }
  };

  const exportPDF = () => {
    if (!summaryRef.current) return;
    html2canvas(summaryRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const props = (pdf as any).getImageProperties(imgData);
      const w = pdf.internal.pageSize.getWidth();
      const h = (props.height * w) / props.width;
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      const fecha = new Date().toLocaleDateString().replace(/\//g, "-");
      pdf.save(`Resumen_Financiero_${fecha}.pdf`);
    });
  };

  return (
    <div className="container mt-4">
      <h2>Resumen General</h2>

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
        <button
          className="btn btn-secondary me-2"
          onClick={() => {
            setFilterType("");
            setFilterStartDate("");
            setFilterEndDate("");
          }}
        >
          Limpiar Filtros
        </button>
        <button className="btn btn-primary me-2" onClick={goBack}>
          Volver
        </button>
        <button className="btn btn-success me-2" onClick={exportPDF}>
          Exportar PDF
        </button>
      </div>
      {!showAllMonths && (
        <button
          className="btn btn-warning"
          onClick={() => setShowAllMonths(true)}
        >
          Cargar todos los datos...
        </button>
      )}

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
            {filteredIncomes.map((i, idx) => (
              <tr key={i.id}>
                <td>
                  {editing?.type === "income" && editing.index === idx ? (
                    <input
                      type="date"
                      value={editData.fecha}
                      onChange={(e) =>
                        setEditData({ ...editData, fecha: e.target.value })
                      }
                    />
                  ) : (
                    i.fecha
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === idx ? (
                    <input
                      value={editData.tipo}
                      onChange={(e) =>
                        setEditData({ ...editData, tipo: e.target.value })
                      }
                    />
                  ) : (
                    i.tipo
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === idx ? (
                    <input
                      value={editData.descripcion}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  ) : (
                    i.descripcion
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === idx ? (
                    <input
                      type="number"
                      value={editData.monto}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          monto: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `$${i.monto.toFixed(2)}`
                  )}
                </td>
                <td>
                  {editing?.type === "income" && editing.index === idx ? (
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
                        onClick={() => handleEdit("income", idx, i)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete("income", idx)}
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
            {filteredCosts.map((c, idx) => (
              <tr key={c.id}>
                <td>
                  {editing?.type === "cost" && editing.index === idx ? (
                    <input
                      type="date"
                      value={editData.fecha}
                      onChange={(e) =>
                        setEditData({ ...editData, fecha: e.target.value })
                      }
                    />
                  ) : (
                    c.fecha
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === idx ? (
                    <input
                      value={editData.tipo}
                      onChange={(e) =>
                        setEditData({ ...editData, tipo: e.target.value })
                      }
                    />
                  ) : (
                    c.tipo
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === idx ? (
                    <input
                      value={editData.descripcion}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  ) : (
                    c.descripcion
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === idx ? (
                    <input
                      type="number"
                      value={editData.monto}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          monto: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `$${c.monto.toFixed(2)}`
                  )}
                </td>
                <td>
                  {editing?.type === "cost" && editing.index === idx ? (
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
                        onClick={() => handleEdit("cost", idx, c)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete("cost", idx)}
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
        <h4>Totales</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Ingresos (mes)</th>
              <th>Costos (mes)</th>
              <th>Beneficio Bruto</th>
              <th>Saldo mes anterior</th>
              <th>Saldo mes actual</th>
              <th>Saldo acumulado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${totalIncomes.toFixed(2)}</td>
              <td>${totalCosts.toFixed(2)}</td>
              <td>${beneficioBruto.toFixed(2)}</td>
              <td>${prevBalance.toFixed(2)}</td>
              <td>${balance.toFixed(2)}</td>
              <td>${totalBalanceAcumulado.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Summary;
