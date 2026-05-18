import React from 'react'
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from '@ionic/react'
import { closeOutline } from 'ionicons/icons'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { fetchCarBySlug, submitRentApplication, urlFor } from '../lib/sanity.js'
import { useCar } from '../state/CarContext.jsx'

const detailFields = [
  ['Transmission', 'transmission'],
  ['Model Year', 'modelyear'],
  ['Manufacturer', 'manufacturer'],
  ['Registration Year', 'registrationyear'],
  ['Mileage', 'mileage'],
  ['Sitting Capacity', 'sittingcapacity'],
  ['Color', 'color'],
]

export default function CarDetails({ type }) {
  const { slug } = useParams()
  const { addToCart } = useCar()
  const [car, setCar] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rentOpen, setRentOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    rentDays: 1,
    certificate: null,
  })

  const isSale = type === 'sale'
  const priceText = useMemo(() => {
    if (!car) return ''
    return isSale ? `$${car.price ?? 0}` : `$${car.rent ?? 0} / day`
  }, [car, isSale])

  useEffect(() => {
    let mounted = true

    fetchCarBySlug(type, slug)
      .then((result) => {
        if (mounted) {
          setCar(result)
          setError(result ? '' : 'This vehicle could not be found.')
        }
      })
      .catch((err) => mounted && setError(err.message || 'Unable to load vehicle'))

    return () => {
      mounted = false
    }
  }, [slug, type])

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSaleOrder = () => {
    addToCart(car)
    setMessage('Vehicle added to cart.')
  }

  const handleRentSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await submitRentApplication({
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        carName: car.name,
        rentDays: form.rentDays,
        certificate: form.certificate,
      })
      setRentOpen(false)
      setMessage('Your rent application was submitted to Sanity.')
      setForm({ customerName: '', email: '', rentDays: 1, certificate: null })
    } catch (err) {
      setError(err.message || 'Rent application failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <IonPage>
      <AppHeader title={isSale ? 'Buy Car' : 'Rent Car'} />
      <IonContent fullscreen>
        {!car && !error && (
          <div className="center-state">
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && !car && (
          <div className="center-state">
            <IonText color="danger">{error}</IonText>
          </div>
        )}

        {car && (
          <main className="screen detail-layout">
            <section className="gallery">
              <img
                className="detail-image"
                src={urlFor(car.images?.[selectedImage]) || '/favicon.ico'}
                alt={car.name}
              />
              <div className="thumb-row">
                {car.images?.map((image, index) => (
                  <button
                    className={index === selectedImage ? 'thumb active' : 'thumb'}
                    key={image._key || index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={urlFor(image)} alt={`${car.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            </section>

            <section className="detail-copy">
              <p className="eyebrow">{isSale ? 'Available for purchase' : 'Available for rent'}</p>
              <h1>{car.name}</h1>
              <p className="price">{priceText}</p>
              <p className="description">{car.description}</p>

              <IonList inset>
                {detailFields.map(([label, key]) => (
                  <IonItem key={key}>
                    <IonLabel>{label}</IonLabel>
                    <IonText slot="end">{car[key] || 'N/A'}</IonText>
                  </IonItem>
                ))}
              </IonList>

              {isSale ? (
                <IonButton expand="block" color="danger" onClick={handleSaleOrder}>
                  Place Order
                </IonButton>
              ) : (
                <IonButton expand="block" color="danger" onClick={() => setRentOpen(true)}>
                  Apply for Rent
                </IonButton>
              )}
            </section>
          </main>
        )}

        <IonModal isOpen={rentOpen} onDidDismiss={() => setRentOpen(false)}>
          <IonContent className="ion-padding">
            <div className="modal-header">
              <h2>Customer Information</h2>
              <IonButtons>
                <IonButton aria-label="Close" onClick={() => setRentOpen(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </div>
            <form className="rent-form" onSubmit={handleRentSubmit}>
              <IonItem>
                <IonLabel position="stacked">Full Name</IonLabel>
                <IonInput
                  required
                  value={form.customerName}
                  onIonInput={(event) => updateForm('customerName', event.detail.value)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Email Address</IonLabel>
                <IonInput
                  required
                  type="email"
                  value={form.email}
                  onIonInput={(event) => updateForm('email', event.detail.value)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Rent Days</IonLabel>
                <IonSelect
                  value={form.rentDays}
                  onIonChange={(event) => updateForm('rentDays', event.detail.value)}
                >
                  {[1, 2, 3, 4, 5].map((day) => (
                    <IonSelectOption key={day} value={day}>
                      {day}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <label className="file-input">
                <span>Police Clearance Certificate</span>
                <input
                  required
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => updateForm('certificate', event.target.files?.[0] || null)}
                />
              </label>
              <IonButton
                expand="block"
                color="danger"
                type="submit"
                disabled={submitting || !form.certificate}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={!!message}
          message={message}
          buttons={['OK']}
          onDidDismiss={() => setMessage('')}
        />
        <IonAlert
          isOpen={!!error && !!car}
          header="Action needed"
          message={error}
          buttons={['OK']}
          onDidDismiss={() => setError('')}
        />
      </IonContent>
    </IonPage>
  )
}
