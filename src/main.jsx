import React from 'react'
import ReactDOM from 'react-dom'
import { IonApp, setupIonicReact } from '@ionic/react'
import App from './App.jsx'
import { CarProvider } from './state/CarContext.jsx'

import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/flex-utils.css'
import './theme/variables.css'
import './theme/app.css'

setupIonicReact()

ReactDOM.render(
  <React.StrictMode>
    <IonApp>
      <CarProvider>
        <App />
      </CarProvider>
    </IonApp>
  </React.StrictMode>,
  document.getElementById('root'),
)
