import { createSlice } from '@reduxjs/toolkit'

export const startSlice = createSlice({
    name: 'start',
    initialState: {
        isStarted: false,
    },
    reducers: {
        setIsStarted: (state, action) => {
            console.log("Setting start reducer")

            const newIsStarted = action.payload;
            console.log(`setting to: ${newIsStarted}`)
            state.isStarted = newIsStarted;
            console.log(`state: ${state.isStarted}`)
        },
    }
})


export const { setIsStarted } = startSlice.actions

export default startSlice.reducer

export const selectIsStarted = state => state.start.isStarted
