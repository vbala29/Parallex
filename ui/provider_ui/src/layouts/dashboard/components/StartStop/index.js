import React, { useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import SoftButton from 'components/SoftButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useAlert } from 'react-alert';
import SoftAlert from 'components/SoftAlert';
import { useSelector, useDispatch } from 'react-redux'

import { selectCores, selectMemory } from 'examples/Configurator/ProviderState'
import { setIsStarted, selectIsStarted } from 'layouts/dashboard/components/StartStop/startState'
import { calculatePCU } from "utils/format"

function StartStop() {
    const [loading, setLoading] = useState(false);
    const alert = useAlert();
    const cores = useSelector(selectCores);
    const memory = useSelector(selectMemory);
    const isStarted = useSelector(selectIsStarted);

    const startStateDispatch = useDispatch();

    // const [isStarted, setIsStarted] = useState(false);

    const startProvider = async () => {
        setLoading(true);
        // Replace this with your actual startProvider function
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('running start Provider')

        alert.show(`Started Provider with ${calculatePCU(cores, memory)} PCU per Hour`, {
            type: 'success',
            onClose: () => { console.log('alert closed') }
        });
        setLoading(false);
        const newIsStarted = true;
        startStateDispatch(setIsStarted(newIsStarted));
        console.log(`starting - isStarted ${isStarted}`)

    };

    const stopProvider = async () => {
        // Replace this with your actual stopProvider function
        setLoading(true);
        // Replace this with your actual startProvider function
        await new Promise(resolve => setTimeout(resolve, 2000));

        alert.show('Provider Stopped', {
            type: 'error',
            onClose: () => { console.log('alert closed') }
        });

        setLoading(false);
        console.log('Provider stopped');
        startStateDispatch(setIsStarted(!isStarted));
        console.log(`ending = isStarted ${isStarted}`)
        // setIsStarted(false);
    };

    return (
        <div>
            {loading ? (
                <CircularProgress />
            ) : (
                <SoftButton variant="contained" color="dark" size="large" onClick={isStarted ? stopProvider : startProvider }>
                    {isStarted ?  <StopIcon /> : <PlayArrowIcon />}
                </SoftButton>
            )} 
        </div>
    );
}

export default StartStop;