import React from 'react'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonImg,
} from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { urlFor } from '../lib/sanity.js'

export default function CarCard({ car, type }) {
  const history = useHistory()
  const price = type === 'sale' ? `$${car.price ?? 0}` : `$${car.rent ?? 0} / day`
  const route = type === 'sale' ? `/car-for-sale/${car.slug?.current}` : `/car-for-rent/${car.slug?.current}`

  return (
    <IonCard className="car-card">
      <IonImg src={urlFor(car.images?.[0]) || '/favicon.ico'} alt={car.name} />
      <IonCardHeader>
        <IonCardTitle>{car.name}</IonCardTitle>
        <IonCardSubtitle>{price}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <IonButton expand="block" color="danger" onClick={() => history.push(route)}>
          {type === 'sale' ? 'Buy Now' : 'Rent Now'}
        </IonButton>
      </IonCardContent>
    </IonCard>
  )
}
