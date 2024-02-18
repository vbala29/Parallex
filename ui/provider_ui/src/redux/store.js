import { configureStore } from '@reduxjs/toolkit'
import providerReducer from 'examples/Configurator/ProviderState'
import metricsReducer from 'layouts/dashboard/metricsState'
import startReducer from 'layouts/dashboard/components/StartStop/startState'

export default configureStore({
  reducer: {
    provider: providerReducer,
    metrics: metricsReducer,
    start: startReducer
  }
})