import { createSlice } from '@reduxjs/toolkit'

export const metricsSlice = createSlice({
    name: 'metrics',
    initialState: {
        pcuContributed: 0,
        providerDuration: 0,
        reliability: 4.5
    },
    reducers: {
        setPCUContributed: (state, action) => {
            const newPCU = action.payload;
            state.pcuContributed = newPCU;
        },
        setProviderDuration: (state, action) => {
            const newProviderDuration = action.payload;
            state.providerDuration = newProviderDuration;
        },
        incrementProviderDuration: (state, action) => {
            const increment = action.payload;
            state.providerDuration += increment;
        },
        setReliabilityScore: (state, action) => {
            const newReliability = action.payload;
            state.reliability = newReliability;
        },
    }
})


export const { setPCUContributed, setProviderDuration, incrementProviderDuration, setReliabilityScore } = metricsSlice.actions

export default metricsSlice.reducer

export const selectPCUContributed = state => state.metrics.pcuContributed
export const selectProviderDuration = state => state.metrics.providerDuration
export const selectReliability = state => state.metrics.reliability
