import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  eventId: null,
  tickets: {}, // Cantidad de tickets seleccionados por ID
  ticketData: {}, // Datos completos de los tickets (incluyendo precio)
  prices: {},
}

export const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setEventId: (state, action) => {
      state.eventId = action.payload
    },
    setTicketData: (state, action) => {
      // Guardar los datos completos de los tickets
      const ticketsArray = action.payload
      const ticketsMap = {}

      ticketsArray.forEach((ticket) => {
        ticketsMap[ticket.id] = ticket
      })

      state.ticketData = ticketsMap
    },
    incrementTicket: (state, action) => {
      const ticketId = action.payload
      state.tickets[ticketId] = (state.tickets[ticketId] || 0) + 1
    },
    decrementTicket: (state, action) => {
      const ticketId = action.payload
      if (state.tickets[ticketId] > 0) {
        state.tickets[ticketId] -= 1
      }
    },
    resetTickets: (state) => {
      state.tickets = {}
    },
  },
})

// Acciones
export const { setEventId, setTicketData, incrementTicket, decrementTicket, resetTickets } = ticketsSlice.actions

// Selectores
export const selectEventId = (state) => state.tickets.eventId
export const selectTickets = (state) => state.tickets.tickets
export const selectTicketData = (state) => state.tickets.ticketData
export const selectPrices = (state) => state.tickets.prices

// Selector para calcular el subtotal
export const selectSubtotal = (state) => {
  let subtotal = 0

  // Usar los precios reales de cada ticket
  Object.entries(state.tickets.tickets).forEach(([ticketId, quantity]) => {
    const ticketInfo = state.tickets.ticketData[ticketId]
    if (ticketInfo) {
      // Convertir el precio a número y multiplicar por la cantidad
      const price = Number.parseFloat(ticketInfo.precio)
      subtotal += quantity * price
    }
  })

  return subtotal
}

// Selector para calcular el total
export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state)
  return subtotal
}

export default ticketsSlice.reducer


