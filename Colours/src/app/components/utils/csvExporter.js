
const formatMonto = (monto) => {
  return `$${Number.parseFloat(monto || 0).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Helper fecha
const formatFecha = (fecha) => {
  if (!fecha) return "Sin fecha"
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Helper evento nombre
const getEventoNombre = (orden) => {
  if (orden.DetalleDeOrdens && orden.DetalleDeOrdens.length > 0) {
    return orden.DetalleDeOrdens[0]?.Entrada?.Evento?.nombre || "Sin evento"
  }
  return "Sin evento"
}


export const downloadCSV = (
  allOrdersForSummary,
  totalOrdersValue,
  totalPaidValue,
  totalPendingValue,
  totalOrdenesCount,
  paidOrdersCount,
) => {
  try {
    let csvContent = ""

    // header
    csvContent += "RESUMEN GENERAL\n"
    csvContent += "Concepto,Monto\n"
    csvContent += `Total Órdenes,${formatMonto(totalOrdersValue)}\n`
    csvContent += `Total Pagado,${formatMonto(totalPaidValue)}\n`
    csvContent += `Total Pendiente,${formatMonto(totalPendingValue)}\n`
    csvContent += `Cantidad de Órdenes,${totalOrdenesCount}\n`
    csvContent += `Cantidad de Pagos,${paidOrdersCount}\n`
    csvContent += `Fecha de Reporte,${new Date().toLocaleDateString("es-ES")}\n`
    csvContent += "\n\n"

    // detail
    csvContent += "DETALLE DE ÓRDENES\n"
    csvContent +=
      "Vendedor,Cliente,DNI,Email,Teléfono,Evento,Fecha Creación,Fecha Pago,Monto Orden,Estado,Referencia Pago,Monto Pagado\n"

    // Order Data 
    allOrdersForSummary.forEach((orden) => {
      const vendedor = orden.User ? `${orden.User.nombre} (${orden.User.email})` : "N/A"
      const evento = getEventoNombre(orden)
      const fechaCreacion = formatFecha(orden.fecha_creacion)
      const pagoInfo = orden.Pagos && orden.Pagos.length > 0 ? orden.Pagos[0] : null
      const fechaPago = pagoInfo ? formatFecha(pagoInfo.fecha_pago) : "Sin pago"
      const estado = orden.estado
      const referenciaPago = pagoInfo ? pagoInfo.referencia : "N/A"
      const montoPagado = pagoInfo ? pagoInfo.total : 0
        
      const montoOrdenReal = orden.total // total

      const escapeCsv = (str) => {
        if (str === null || str === undefined) return ""
        return `"${String(str).replace(/"/g, '""')}"`
      }

      csvContent += `${escapeCsv(vendedor)},`
      csvContent += `${escapeCsv(orden.nombre_cliente)},`
      csvContent += `${escapeCsv(orden.dni_cliente)},`
      csvContent += `${escapeCsv(orden.email_cliente)},`
      csvContent += `${escapeCsv(orden.telefono_cliente)},`
      csvContent += `${escapeCsv(evento)},`
      csvContent += `${escapeCsv(fechaCreacion)},`
      csvContent += `${escapeCsv(fechaPago)},`
      csvContent += `${formatMonto(montoOrdenReal)},`
      csvContent += `${escapeCsv(estado)},`
      csvContent += `${escapeCsv(referenciaPago)},`
      csvContent += `${formatMonto(montoPagado)}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ordenes_y_pagos_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error al generar CSV:", error)
    alert("Error al generar el archivo CSV")
  }
}
