import React, { useEffect } from "react";
import { BackendService } from "../services/BackendService";
import InstanceItem from "./InstanceItem";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useStateValue } from "../hooks/state";

const backendService = new BackendService();

const InstanceList: React.FC = () => {
    const { state: { instance }, dispatch } = useStateValue();

    function fetchData() {
        backendService.dispatchGetInstances(dispatch);
    }
    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <Container>
            {instance.error ? `Error: ${instance.error}` :
                <div>
                    {instance.loading
                        ? <CircularProgress />
                        : instance.instances.map((i) => <InstanceItem key={i.id} instance={i} />)}
                </div>
            }
        </Container>
    );
};

export default InstanceList;
