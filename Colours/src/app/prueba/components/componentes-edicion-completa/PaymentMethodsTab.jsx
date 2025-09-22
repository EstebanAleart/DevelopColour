import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Edit2, Save, XCircle, Plus, Trash2 } from "lucide-react";
import TaxRateModal from "./TaxRateModal";

export default function PaymentMethodsTab({ API_URL, data, setData }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [errorPaymentMethods, setErrorPaymentMethods] = useState(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [tempTipoCobro, setTempTipoCobro] = useState("");
  const [tempImpuesto, setTempImpuesto] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    tipo_de_cobro: "",
    impuesto: {},
  });
  const [showTaxRateModal, setShowTaxRateModal] = useState(false);
  const [taxRateForm, setTaxRateForm] = useState({
    cuotas: "",
    porcentaje: "",
  });
  const [isEditingTaxRate, setIsEditingTaxRate] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      setErrorPaymentMethods(null);
      const response = await fetch(`${API_URL}/api/paymentMethod/`);
      if (!response.ok) {
        throw new Error(`Error al obtener métodos de pago: ${response.status}`);
      }
      const result = await response.json();
      if (
        result.message === "Métodos de pago obtenidos exitosamente" &&
        result.data
      ) {
        setPaymentMethods(result.data);
      } else {
        throw new Error(result.error || "Error al obtener los métodos de pago");
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setErrorPaymentMethods(err.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudieron cargar los métodos de pago: ${err.message}`,
      });
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [API_URL]);

  const updatePaymentMethod = async (id, newTipoCobro, newImpuesto) => {
    try {
      const requestBody = {
        tipo_de_cobro: newTipoCobro.trim(),
        impuesto: newImpuesto,
      };
      const response = await fetch(`${API_URL}/api/paymentMethod/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(
          result.error ||
            `Error al actualizar el método de pago. Status: ${response.status}`
        );
      }
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.Id === id
            ? {
                ...method,
                tipo_de_cobro: newTipoCobro.trim(),
                impuesto: newImpuesto,
              }
            : method
        )
      );
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "Método de pago actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      setEditingPaymentMethod(null);
      setTempTipoCobro("");
      setTempImpuesto({});
      setTimeout(() => {
        fetchPaymentMethods();
      }, 1000);
    } catch (error) {
      console.error("Error updating payment method:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const createPaymentMethod = async () => {
    try {
      if (!newPaymentMethod.tipo_de_cobro.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "El tipo de cobro es requerido",
        });
        return;
      }
      const response = await fetch(`${API_URL}/api/paymentMethod/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_de_cobro: newPaymentMethod.tipo_de_cobro,
          impuesto: newPaymentMethod.impuesto,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Error al crear el método de pago");
      }
      await fetchPaymentMethods();
      setNewPaymentMethod({
        tipo_de_cobro: "",
        impuesto: {},
      });
      setShowAddForm(false);
      Swal.fire({
        icon: "success",
        title: "Creado",
        text: "Método de pago creado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error creating payment method:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const deletePaymentMethod = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1F2937",
      color: "#E5E7EB",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${API_URL}/api/paymentMethod/delete/${id}`,
            {
              method: "DELETE",
            }
          );
          const resultData = await response.json();
          if (!response.ok || resultData.error) {
            throw new Error(
              resultData.error ||
                `Error al eliminar el método de pago. Status: ${response.status}`
            );
          }
          setPaymentMethods((prev) =>
            prev.filter((method) => method.Id !== id)
          );
          Swal.fire({
            title: "¡Eliminado!",
            icon: "success",
            text: "El método de pago ha sido eliminado.",
            confirmButtonColor: "#BF8D6B",
            background: "#1F2937",
            color: "#E5E7EB",
          });
        } catch (error) {
          console.error("Error deleting payment method:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            confirmButtonColor: "#BF8D6B",
            background: "#1F2937",
            color: "#E5E7EB",
          });
        }
      }
    });
  };

  const startEditing = (method) => {
    setEditingPaymentMethod(method.Id);
    setTempTipoCobro(method.tipo_de_cobro || "");
    setTempImpuesto(method.impuesto || {});
  };

  const cancelEditing = () => {
    setEditingPaymentMethod(null);
    setTempTipoCobro("");
    setTempImpuesto({});
  };

  const saveEditing = (id) => {
    if (!tempTipoCobro.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El tipo de cobro no puede estar vacío",
      });
      return;
    }

    for (const [cuotas, porcentaje] of Object.entries(tempImpuesto)) {
      const cuotasNum = Number.parseInt(cuotas);
      const porcentajeNum = Number.parseFloat(porcentaje);

      if (isNaN(cuotasNum) || cuotasNum < 0) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "Las cuotas deben ser números enteros no negativos",
        });
        return;
      }

      if (isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "Los porcentajes de impuesto deben estar entre 0 y 100",
        });
        return;
      }
    }

    updatePaymentMethod(id, tempTipoCobro, tempImpuesto);
  };

  const cancelAddNew = () => {
    setShowAddForm(false);
    setNewPaymentMethod({
      tipo_de_cobro: "",
      impuesto: {},
    });
  };

  const addTaxRate = (isEditing = false) => {
    setIsEditingTaxRate(isEditing);
    setTaxRateForm({ cuotas: "", porcentaje: "" });
    setShowTaxRateModal(true);
  };

  const removeTaxRate = (cuotas, isEditing = false) => {
    if (isEditing) {
      setTempImpuesto((prev) => {
        const newImpuesto = { ...prev };
        delete newImpuesto[cuotas];
        return newImpuesto;
      });
    } else {
      setNewPaymentMethod((prev) => ({
        ...prev,
        impuesto: Object.fromEntries(
          Object.entries(prev.impuesto).filter(
            ([key]) => key !== cuotas.toString()
          )
        ),
      }));
    }
  };

  const handleTaxRateSubmit = () => {
    const cuotasNum = Number.parseInt(taxRateForm.cuotas);
    const porcentajeNum = Number.parseFloat(taxRateForm.porcentaje);

    if (isNaN(cuotasNum) || cuotasNum < 0) {
      Swal.fire({
        icon: "warning",
        title: "Valor inválido",
        text: "Las cuotas deben ser un número entero no negativo",
      });
      return;
    }

    if (isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
      Swal.fire({
        icon: "warning",
        title: "Valor inválido",
        text: "El porcentaje debe estar entre 0 и 100",
      });
      return;
    }

    if (isEditingTaxRate) {
      setTempImpuesto((prev) => ({
        ...prev,
        [cuotasNum]: porcentajeNum,
      }));
    } else {
      setNewPaymentMethod((prev) => ({
        ...prev,
        impuesto: {
          ...prev.impuesto,
          [cuotasNum]: porcentajeNum,
        },
      }));
    }

    setShowTaxRateModal(false);
    setTaxRateForm({ cuotas: "", porcentaje: "" });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-white">Métodos de Pago</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-2 py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white text-xs rounded flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Agregar
        </button>
      </div>
      {showAddForm && (
        <div className="mb-2 p-2 bg-gray-700 border border-[#BF8D6B] rounded">
          <h4 className="text-white font-medium mb-3">
            Agregar Nuevo Método de Pago
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Tipo de Cobro *
              </label>
              <input
                type="text"
                placeholder="Ej: PayPal, Stripe, etc."
                value={newPaymentMethod.tipo_de_cobro}
                onChange={(e) =>
                  setNewPaymentMethod((prev) => ({
                    ...prev,
                    tipo_de_cobro: e.target.value,
                  }))
                }
                className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B]"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-300">
                  Impuestos por Cuotas
                </label>
                <button
                  onClick={() => addTaxRate(false)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.entries(newPaymentMethod.impuesto).map(
                  ([cuotas, porcentaje]) => (
                    <div
                      key={cuotas}
                      className="flex items-center justify-between bg-gray-800 p-2 rounded"
                    >
                      <span className="text-white text-sm">
                        {cuotas} cuota{cuotas !== "1" ? "s" : ""}: {porcentaje}%
                      </span>
                      <button
                        onClick={() => removeTaxRate(cuotas, false)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  )
                )}
                {Object.keys(newPaymentMethod.impuesto).length === 0 && (
                  <p className="text-gray-400 text-sm">
                    No hay impuestos configurados
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={createPaymentMethod}
              className="px-4 py-2 bg-[#BF8D6B] hover:bg-[#a67454] text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Crear
            </button>
            <button
              onClick={cancelAddNew}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <XCircle className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {paymentMethods.map((method) => (
          <div
            key={method.Id}
            className="bg-gray-700 border border-[#BF8D6B] rounded p-2 text-xs"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-white">
                {method.tipo_de_cobro}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => startEditing(method)}
                  className="text-gray-400 hover:text-gray-300"
                  title="Editar"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => deletePaymentMethod(method.Id)}
                  className="text-red-400 hover:text-red-300"
                  title="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="text-gray-300">
              {method.impuesto && Object.keys(method.impuesto).length > 0 ? (
                Object.entries(method.impuesto).map(([cuotas, porcentaje]) => (
                  <div key={cuotas}>
                    {cuotas} cuota{cuotas !== "1" ? "s" : ""}: {porcentaje}%
                  </div>
                ))
              ) : (
                <span className="text-gray-400">Sin impuestos</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaxRateModal && (
        <TaxRateModal
          showTaxRateModal={showTaxRateModal}
          setShowTaxRateModal={setShowTaxRateModal}
          taxRateForm={taxRateForm}
          setTaxRateForm={setTaxRateForm}
          handleTaxRateSubmit={handleTaxRateSubmit}
        />
      )}
    </div>
  );
}
