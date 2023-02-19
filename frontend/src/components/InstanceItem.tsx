/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { FunctionComponent, useState } from "react";
import { BackendService } from "../services/BackendService";
import { Instance } from "../services/Instance";

import humanizeDuration, { Options } from "humanize-duration";

const backendService = new BackendService();

function getStartStopButtonTooltip(instance: Instance) {
    if (!instance.controlAllowed) {
        return "Control disabled";
    } else if (instance.stopped) {
        return "Start instances";
    } else if (instance.running) {
        return "Stop instances";
    } else {
        return "Unknown state";
    }
}

function iconWithTooltip(icon: JSX.Element, tooltip: string) {
    return <Tooltip title={tooltip}>{icon}</Tooltip>
}

function getInstanceStateIcon(instance: Instance) {
    const dnsInSync = instance.publicIpAddress && (instance.publicIpAddress === instance.dnsIpAddress);
    if (instance.running && dnsInSync) {
        return iconWithTooltip(<CheckIcon style={{ color: "green" }} />, "Running, DNS in sync");
    }
    if (instance.running && !dnsInSync) {
        return iconWithTooltip(<CheckIcon style={{ color: "red" }} />, "Running, DNS not in sync");
    }
    return (<></>);
}

function getReadableDuration(durationSeconds: number | undefined): string {
    if (durationSeconds === undefined) {
        return "n/a";
    }
    const humanizeOptions: Options = { round: false, largest: 2 };
    return humanizeDuration(durationSeconds * 1000, humanizeOptions);
}

const InstanceItem: FunctionComponent<{ instance: Instance }> = ({ instance }) => {
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [resultMessage, setResultMessage] = React.useState("");

    function handleCloseSnackbar() {
        setSnackbarOpen(false);
    }

    async function startStopInstance() {
        setLoading(true);
        const action = instance.stopped ? "start" : "stop";
        try {
            const message = await backendService.setInstanceState(instance.id, action);
            setResultMessage(message);
        } catch (error) {
            console.error("Error executing request", error);
            setResultMessage(`Error executing request: ${error}`);
        }
        setLoading(false);
        setSnackbarOpen(true);
    }

    const startStopButtonLabel = instance.stopped
        ? "Start"
        : (instance.running ? "Stop" : "(pending)");
    const startStopButtonTooltip = getStartStopButtonTooltip(instance);
    const instanceStateIcon = getInstanceStateIcon(instance);
    const readableUptime = getReadableDuration(instance.uptimeSeconds);
    return (
        <Card >
            <CardContent>
                <Typography variant="h5" component="h2">
                    {`${instance.name} (${instance.state})`} {instanceStateIcon}
                </Typography>
                {
                    instance.running &&
                    <Typography variant="body2" component="p">
                        Running since {readableUptime}
                    </Typography>
                }
                {
                    instance.dnsDomain &&
                    <Typography variant="body2" component="p">
                        Domain: {instance.dnsDomain}
                    </Typography>
                }
                {
                    instance.running &&
                    <Typography variant="body2" component="p">
                        Public IP (Instance): {instance.publicIpAddress ? instance.publicIpAddress : "n/a"}
                    </Typography>
                }
                {
                    instance.running &&
                    <Typography variant="body2" component="p">
                        Public IP (DNS): {instance.dnsIpAddress &&
                            `${instance.dnsIpAddress} (TTL: ${instance.dnsTtl}s)`}
                    </Typography>
                }
                {
                    instance.controlAllowed &&
                    <CardActions css={css`justify-content: center`}>
                        <Tooltip title={startStopButtonTooltip}>
                            <Button size="small" onClick={startStopInstance}
                                disabled={loading || (!instance.running && !instance.stopped)}>
                                {startStopButtonLabel}
                            </Button>
                        </Tooltip>
                    </CardActions>
                }
            </CardContent>

            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={<span>{resultMessage}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="close"
                        color="inherit"
                        onClick={handleCloseSnackbar}
                        size="large">
                        <CloseIcon />
                    </IconButton>]}
            />
        </Card >
    );
}

export default InstanceItem;
