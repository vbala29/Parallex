import React, { useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import SoftButton from 'components/SoftButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useAlert } from 'react-alert';
import SoftAlert from 'components/SoftAlert';
import { useSelector } from 'react-redux'
import { selectCores, selectMemory } from 'examples/Configurator/ProviderState'
import { calculatePCU } from "utils/format"

function StartStop() {
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const alert = useAlert();
    const cores = useSelector(selectCores);
    const memory = useSelector(selectMemory);

    const startProvider = async () => {
        setLoading(true);
        // Replace this with your actual startProvider function
        await new Promise(resolve => setTimeout(resolve, 2000));

        alert.show(`Provider Successfully Started with PCU per Hour ${calculatePCU(cores, memory)}`, {
            type: 'success',
            onClose: () => { console.log('alert closed') }
        });
        setLoading(false);
        setStarted(true);
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
        setStarted(false);
    };

    return (
        <div>
            {loading ? (
                <CircularProgress />
            ) : (
                <SoftButton variant="contained" color="dark" size="large" onClick={started ? stopProvider : startProvider}>
                    {started ? <StopIcon /> : <PlayArrowIcon />}
                </SoftButton>
            )}
        </div>
    );
}

export default StartStop;