import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import Home from './pages/Home.jsx'
import CarDetails from './pages/CarDetails.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'

export default function App() {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home" component={Home} />
        <Route exact path="/car-for-sale/:slug">
          <CarDetails type="sale" />
        </Route>
        <Route exact path="/car-for-rent/:slug">
          <CarDetails type="rent" />
        </Route>
        <Route exact path="/cart" component={Cart} />
        <Route exact path="/checkout" component={Checkout} />
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  )
}
