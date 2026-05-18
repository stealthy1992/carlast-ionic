import React from 'react'
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/react'
import { useState } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { useCar } from '../state/CarContext.jsx'

const countries = ['Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States']

export default function Checkout() {
  const { cart } = useCar()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'Pakistan',
  })

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0) * 1.07

  return (
    <IonPage>
      <AppHeader title="Checkout" />
      <IonContent fullscreen>
        <main className="screen narrow-screen">
          <p className="eyebrow">Step {step + 1} of 3</p>
          <h1>{step === 0 ? 'Billing Address' : step === 1 ? 'Shipping Address' : 'Confirm Order'}</h1>

          {cart.length === 0 ? (
            <IonText>Your cart is empty.</IonText>
          ) : step < 2 ? (
            <IonList inset>
              {['firstName', 'lastName', 'email', 'addressLine1', 'addressLine2', 'city', 'state'].map((field) => (
                <IonItem key={field}>
                  <IonLabel position="stacked">{field.replace(/([A-Z])/g, ' $1')}</IonLabel>
                  <IonInput
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onIonInput={(event) => updateForm(field, event.detail.value)}
                  />
                </IonItem>
              ))}
              <IonItem>
                <IonLabel position="stacked">Country</IonLabel>
                <IonSelect value={form.country} onIonChange={(event) => updateForm('country', event.detail.value)}>
                  {countries.map((country) => (
                    <IonSelectOption value={country} key={country}>
                      {country}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>
          ) : (
            <section className="summary">
              <h2>Customer</h2>
              <p>{form.firstName} {form.lastName}</p>
              <p>{form.email}</p>
              <p>{form.addressLine1}, {form.city}, {form.country}</p>
              <h2>Vehicles</h2>
              {cart.map((car) => (
                <p key={car._id}>{car.name} <strong>${car.price}</strong></p>
              ))}
              <p>Total <strong>${total.toFixed(2)}</strong></p>
              <IonText color="medium">
                Stripe checkout from the Next API route is not embedded in the APK. Add a hosted payment backend before accepting live payments.
              </IonText>
            </section>
          )}

          {cart.length > 0 && (
            <div className="button-row">
              <IonButton color="medium" fill="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
                Back
              </IonButton>
              <IonButton color="danger" disabled={step === 2} onClick={() => setStep(step + 1)}>
                Next
              </IonButton>
            </div>
          )}
        </main>
      </IonContent>
    </IonPage>
  )
}
