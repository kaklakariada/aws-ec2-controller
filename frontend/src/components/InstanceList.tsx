import React, { useEffect } from "react";
import { BackendService } from "../services/BackendService";
import InstanceItem from "./InstanceItem";
import makeStyles from '@mui/styles/makeStyles';
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import { useStateValue } from "../hooks/state";

const backendService = new BackendService();

const useStyles = makeStyles((theme) => ({
    circularProgress: {
        margin: theme.spacing(2)
    },
    errorMessage: {
        margin: theme.spacing(2)
    }
}));

const InstanceList: React.FC = () => {
    const classes = useStyles();
    const { state: { instance }, dispatch } = useStateValue();

    function fetchData() {
        backendService.dispatchGetInstances(dispatch);
    }
    useEffect(() => {
        fetchData();
    }, []);
    return (
        <Container>
            {instance.error ? <div className={classes.errorMessage}>{`Error: ${instance.error}`}</div> :
                <div>
                    {instance.loading
                        ? <CircularProgress className={classes.circularProgress}/>
                        : instance.instances.map((i) => <InstanceItem key={i.id} instance={i} />)}
                </div>
            }
        </Container>
    );
};

export default InstanceList;
