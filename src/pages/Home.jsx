import React from 'react'
import {
  IonButton,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
} from '@ionic/react'
import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import CarCard from '../components/CarCard.jsx'
import { fetchHomeData, urlFor } from '../lib/sanity.js'

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setError('')
      setData(await fetchHomeData())
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Unable to reach Sanity. Add this app origin to Sanity CORS settings.'
          : err.message || 'Unable to load cars',
      )
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async (event) => {
          await load()
          event.detail.complete()
        }}>
          <IonRefresherContent />
        </IonRefresher>

        {!data && !error && (
          <div className="center-state">
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <div className="center-state">
            <IonText color="danger">{error}</IonText>
          </div>
        )}

        {data && (
          <main className="screen">
            <section className="hero">
              <div className="hero-copy">
                <p>{data.banner?.smallText || 'Drive with confidence'}</p>
                <h1>{data.banner?.largeText1 || data.banner?.midText || 'CarLast'}</h1>
                <h2>{data.banner?.midText || 'Find your next car'}</h2>
                <IonButton color="danger" href="#sale-cars">
                  {data.banner?.buttonText || 'Explore Cars'}
                </IonButton>
              </div>
              {data.banner?.image && (
                <img className="hero-image" src={urlFor(data.banner.image)} alt="Featured car" />
              )}
            </section>

            <section id="sale-cars" className="catalog-section">
              <h2>Purchase your dream car</h2>
              <div className="car-grid">
                {data.saleCars?.map((car) => (
                  <CarCard key={car._id} car={car} type="sale" />
                ))}
              </div>
            </section>

            <section className="catalog-section">
              <h2>Rent a car of your choice</h2>
              <div className="car-grid">
                {data.rentCars?.map((car) => (
                  <CarCard key={car._id} car={car} type="rent" />
                ))}
              </div>
            </section>

            {data.footerBanner && (
              <section className="footer-banner">
                <div>
                  <p>{data.footerBanner.discount}</p>
                  <h2>{data.footerBanner.largeText1}</h2>
                  <h3>{data.footerBanner.largeText2}</h3>
                </div>
                <div>
                  <p>{data.footerBanner.smallText}</p>
                  <h2>{data.footerBanner.midText}</h2>
                  <p>{data.footerBanner.desc}</p>
                </div>
              </section>
            )}
          </main>
        )}
      </IonContent>
    </IonPage>
  )
}
