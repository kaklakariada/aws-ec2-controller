/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import React, { useEffect } from "react";
import { useStateValue } from "../hooks/state";
import { BackendService } from "../services/BackendService";
import InstanceItem from "./InstanceItem";

const backendService = new BackendService();


const InstanceList: React.FC = () => {

    const { state: { instance }, dispatch } = useStateValue();

    function fetchData() {
        backendService.dispatchGetInstances(dispatch);
    }
    useEffect(() => {
        fetchData();
    });
    return (
        <Container>
            {instance.error ? <div css={css`margin: 2em`} >{`Error: ${instance.error}`}</div> :
                <div>
                    {instance.loading
                        ? <CircularProgress css={css`margin: 2em`} />
                        : instance.instances.map((i) => <InstanceItem key={i.id} instance={i} />)}
                </div>
            }
        </Container >
    );
};

export default InstanceList;
