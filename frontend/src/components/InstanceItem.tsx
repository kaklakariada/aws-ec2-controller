import React, { useState, FunctionComponent } from "react";
import { BackendService } from "../services/BackendService";
import { Instance } from "../services/Instance";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";

import humanizeDuration, { Options } from "humanize-duration";

const backendService = new BackendService();

const useStyles = makeStyles((theme) => ({
    card: {
        minWidth: 275,
    },
    actions: {
        justifyContent: "center"
    },
    closeSnackbar: {
        padding: theme.spacing(0.5)
    },
}));

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
    const classes = useStyles();
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
        <Card className={classes.card}>
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
                <CardActions className={classes.actions}>
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
                    <IconButton key="close" aria-label="close" color="inherit"
                        className={classes.closeSnackbar} onClick={handleCloseSnackbar}>
                        <CloseIcon />
                    </IconButton>]}
            />
        </Card>
    );
}

export default InstanceItem;
