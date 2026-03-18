import React, { createContext, useContext, useReducer, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AppContext = createContext(null)


const API = axios.create({ 
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api' 
})



const initialState = {
  trips: [],
  currentTrip: null,
  expenses: [],
  settlements: [],
  loading: false,
  expensesLoading: false
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':          return { ...state, loading: action.payload }
    case 'SET_EXP_LOADING':      return { ...state, expensesLoading: action.payload }
    case 'SET_TRIPS':            return { ...state, trips: action.payload }
    case 'ADD_TRIP':             return { ...state, trips: [action.payload, ...state.trips] }
    case 'UPDATE_TRIP':          return {
      ...state,
      trips: state.trips.map(t => t._id === action.payload._id ? action.payload : t),
      currentTrip: state.currentTrip?._id === action.payload._id ? action.payload : state.currentTrip
    }
    case 'DELETE_TRIP':          return { ...state, trips: state.trips.filter(t => t._id !== action.payload) }
    case 'SET_CURRENT_TRIP':     return { ...state, currentTrip: action.payload }
    case 'SET_EXPENSES':         return { ...state, expenses: action.payload }
    case 'ADD_EXPENSE':          return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'UPDATE_EXPENSE':       return { ...state, expenses: state.expenses.map(e => e._id === action.payload._id ? action.payload : e) }
    case 'DELETE_EXPENSE':       return { ...state, expenses: state.expenses.filter(e => e._id !== action.payload) }
    case 'SET_SETTLEMENTS':      return { ...state, settlements: action.payload }
    case 'ADD_SETTLEMENT':       return { ...state, settlements: [action.payload, ...state.settlements] }
    case 'DELETE_SETTLEMENT':    return { ...state, settlements: state.settlements.filter(s => s._id !== action.payload) }
    default:                     return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ── TRIPS ──────────────────────────────────────
  const fetchTrips = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { data } = await API.get('/trips')
      dispatch({ type: 'SET_TRIPS', payload: data })
    } catch {
      toast.error('Failed to load trips')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const fetchTrip = useCallback(async (id) => {
    try {
      const { data } = await API.get(`/trips/${id}`)
      dispatch({ type: 'SET_CURRENT_TRIP', payload: data })
      return data
    } catch {
      toast.error('Trip not found')
    }
  }, [])

  const createTrip = useCallback(async (payload) => {
    try {
      const { data } = await API.post('/trips', payload)
      dispatch({ type: 'ADD_TRIP', payload: data })
      toast.success('Trip created!')
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip')
    }
  }, [])

  const updateTrip = useCallback(async (id, payload) => {
    try {
      const { data } = await API.put(`/trips/${id}`, payload)
      dispatch({ type: 'UPDATE_TRIP', payload: data })
      toast.success('Trip updated!')
      return data
    } catch {
      toast.error('Failed to update trip')
    }
  }, [])

  const deleteTrip = useCallback(async (id) => {
    try {
      await API.delete(`/trips/${id}`)
      dispatch({ type: 'DELETE_TRIP', payload: id })
      toast.success('Trip deleted')
    } catch {
      toast.error('Failed to delete trip')
    }
  }, [])

  // ── EXPENSES ────────────────────────────────────
  const fetchExpenses = useCallback(async (tripId) => {
    dispatch({ type: 'SET_EXP_LOADING', payload: true })
    try {
      const { data } = await API.get(`/trips/${tripId}/expenses`)
      dispatch({ type: 'SET_EXPENSES', payload: data })
    } catch {
      toast.error('Failed to load expenses')
    } finally {
      dispatch({ type: 'SET_EXP_LOADING', payload: false })
    }
  }, [])

  const createExpense = useCallback(async (tripId, payload) => {
    try {
      const { data } = await API.post(`/trips/${tripId}/expenses`, payload)
      dispatch({ type: 'ADD_EXPENSE', payload: data })
      toast.success('Expense added!')
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    }
  }, [])

  const updateExpense = useCallback(async (tripId, expId, payload) => {
    try {
      const { data } = await API.put(`/trips/${tripId}/expenses/${expId}`, payload)
      dispatch({ type: 'UPDATE_EXPENSE', payload: data })
      toast.success('Expense updated!')
      return data
    } catch {
      toast.error('Failed to update expense')
    }
  }, [])

  const deleteExpense = useCallback(async (tripId, expId) => {
    try {
      await API.delete(`/trips/${tripId}/expenses/${expId}`)
      dispatch({ type: 'DELETE_EXPENSE', payload: expId })
      toast.success('Expense deleted')
    } catch {
      toast.error('Failed to delete expense')
    }
  }, [])

  // ── SETTLEMENTS ────────────────────────────────
  const fetchSettlements = useCallback(async (tripId) => {
    try {
      const { data } = await API.get(`/trips/${tripId}/settlements`)
      dispatch({ type: 'SET_SETTLEMENTS', payload: data })
    } catch {
      toast.error('Failed to load settlements')
    }
  }, [])

  const createSettlement = useCallback(async (tripId, payload) => {
    try {
      const { data } = await API.post(`/trips/${tripId}/settlements`, payload)
      dispatch({ type: 'ADD_SETTLEMENT', payload: data })
      toast.success('Settlement recorded!')
      return data
    } catch {
      toast.error('Failed to record settlement')
    }
  }, [])

  const deleteSettlement = useCallback(async (tripId, sId) => {
    try {
      await API.delete(`/trips/${tripId}/settlements/${sId}`)
      dispatch({ type: 'DELETE_SETTLEMENT', payload: sId })
      toast.success('Settlement removed')
    } catch {
      toast.error('Failed to remove settlement')
    }
  }, [])

  return (
    <AppContext.Provider value={{
      ...state,
      fetchTrips, fetchTrip,
      createTrip, updateTrip, deleteTrip,
      fetchExpenses, createExpense, updateExpense, deleteExpense,
      fetchSettlements, createSettlement, deleteSettlement
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
