import React from 'react'
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
} from '@ionic/react'
import { useHistory } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { urlFor } from '../lib/sanity.js'
import { useCar } from '../state/CarContext.jsx'

export default function Cart() {
  const history = useHistory()
  const { cart, emptyCart, removeFromCart } = useCar()
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0)

  return (
    <IonPage>
      <AppHeader title="Cart" />
      <IonContent fullscreen>
        <main className="screen narrow-screen">
          <h1>Your Cart</h1>
          {cart.length === 0 ? (
            <div className="empty-state">
              <IonText>No vehicles in the cart.</IonText>
              <IonButton color="danger" onClick={() => history.push('/home')}>
                Browse Cars
              </IonButton>
            </div>
          ) : (
            <>
              <IonList inset>
                {cart.map((car) => (
                  <IonItem key={car._id}>
                    <img className="cart-thumb" src={urlFor(car.images?.[0])} alt={car.name} />
                    <IonLabel>
                      <h2>{car.name}</h2>
                      <p>{car.modelyear} · {car.color}</p>
                      <p>${car.price}</p>
                    </IonLabel>
                    <IonButton color="medium" fill="clear" onClick={() => removeFromCart(car._id)}>
                      Remove
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
              <section className="summary">
                <p>Subtotal <strong>${total.toFixed(2)}</strong></p>
                <p>Tax <strong>${(total * 0.07).toFixed(2)}</strong></p>
                <p>Total <strong>${(total * 1.07).toFixed(2)}</strong></p>
              </section>
              <div className="button-row">
                <IonButton color="medium" fill="outline" onClick={emptyCart}>
                  Empty Cart
                </IonButton>
                <IonButton color="danger" onClick={() => history.push('/checkout')}>
                  Checkout
                </IonButton>
              </div>
            </>
          )}
        </main>
      </IonContent>
    </IonPage>
  )
}
