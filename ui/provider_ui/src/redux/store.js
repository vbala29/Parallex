import { configureStore } from '@reduxjs/toolkit'
import providerReducer from 'examples/Configurator/ProviderState'

export default configureStore({
  reducer: {
    provider: providerReducer
  }
})