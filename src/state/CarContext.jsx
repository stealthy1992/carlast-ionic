import React, { createContext, useContext, useMemo, useState } from 'react'

const CarContext = createContext(null)

export function CarProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = (car) => {
    setCart((current) => {
      if (current.some((item) => item._id === car._id)) {
        return current
      }
      return [...current, car]
    })
  }

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item._id !== id))
  }

  const emptyCart = () => setCart([])

  const value = useMemo(
    () => ({
      cart,
      count: cart.length,
      addToCart,
      removeFromCart,
      emptyCart,
    }),
    [cart],
  )

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>
}

export function useCar() {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCar must be used inside CarProvider')
  }
  return context
}
