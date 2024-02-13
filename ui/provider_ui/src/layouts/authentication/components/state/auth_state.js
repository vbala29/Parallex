import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        JWT: 0,
    },
    reducers: {
        setJWT: (state, action) => {
            newJWT = action.payload
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.JWT = newJWT
        },
    }
})


export const { setJWT } = counterSlice.actions

export default authSlice.reducer    