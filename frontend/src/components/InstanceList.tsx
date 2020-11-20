import React, { useEffect, useState } from "react";
import { BackendService } from "../services/BackendService";
import InstanceItem from "./InstanceItem";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Instance } from "../services/Instance";

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
    const [loading, setLoading] = useState(true);
    const initialInstances: Instance[] = [];
    const [instances, setInstances] = useState(initialInstances);
    const [error, setError] = useState(undefined);

    async function fetchData() {
        try {
            const list = await backendService.getInstances();
            setInstances(list);
            setLoading(false)
        } catch(error) {
            setLoading(false)
            setError(error)
        }
    }
    useEffect(() => {
        fetchData();
    }, []);
    return (
        <Container>
            {error ? <div className={classes.errorMessage}>{`Error: ${error}`}</div> :
                <div>
                    {loading
                        ? <CircularProgress className={classes.circularProgress}/>
                        : instances.map((i) => <InstanceItem key={i.id} instance={i} />)}
                </div>
            }
        </Container>
    );
};

export default InstanceList;
