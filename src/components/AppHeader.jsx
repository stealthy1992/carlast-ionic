import React from 'react'
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { carSportOutline, cartOutline, homeOutline } from 'ionicons/icons'
import { useHistory } from 'react-router-dom'
import { useCar } from '../state/CarContext.jsx'

export default function AppHeader({ title = 'CarLast' }) {
  const history = useHistory()
  const { count } = useCar()

  return (
    <IonHeader translucent>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton aria-label="Home" onClick={() => history.push('/home')}>
            <IonIcon icon={homeOutline} />
          </IonButton>
        </IonButtons>
        <IonTitle>
          <span className="brand">
            <IonIcon icon={carSportOutline} />
            {title}
          </span>
        </IonTitle>
        <IonButtons slot="end">
          <IonButton aria-label="Cart" onClick={() => history.push('/cart')}>
            <IonIcon icon={cartOutline} />
            {count > 0 && <IonBadge color="danger">{count}</IonBadge>}
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}
