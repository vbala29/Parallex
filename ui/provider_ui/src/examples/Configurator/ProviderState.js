import { createSlice } from '@reduxjs/toolkit'

export const providerSlice = createSlice({
    name: 'provider',
    initialState: {
        cores: 8, // Integer
        memory: 8192, // MiB
        duration: 0 // seconds
    },
    reducers: {
        setCores: (state, action) => {
            console.log("Setting cores reducer")
            const newCores = action.payload;
            state.cores = newCores;
        },
        setMemory: (state, action) => {
            console.log("Setting memory reducer")

            const newMemory = action.payload;
            state.memory = newMemory;
        },
        setDuration: (state, action) => {
            console.log("Setting time reducer")

            const newDuration = action.payload;
            state.duration = newDuration;
        },
    }
})


export const { setCores, setMemory, setDuration } = providerSlice.actions

export default providerSlice.reducer

export const selectCores = state => state.provider.cores
export const selectMemory = state => state.provider.memory
export const selectDuration = state => state.provider.duration
