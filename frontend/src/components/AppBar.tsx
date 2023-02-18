import { AmplifyUser } from '@aws-amplify/ui';
import MuiAppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuIcon from "@material-ui/icons/Menu";
import Refresh from "@material-ui/icons/Refresh";
import React from "react";
import { SignOut } from '../App';
import { useStateValue } from "../hooks/state";
import { BackendService } from "../services/BackendService";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const backendService = new BackendService();

interface AppBarProps {
  signOut: SignOut;
  user: AmplifyUser | undefined;
}

const AppBar: React.FC<AppBarProps> = ({ user, signOut }) => {
  const { state: { instance }, dispatch } = useStateValue();

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefreshButton = () => {
    console.log("Handle refresh button in app bar");
    backendService.dispatchGetInstances(dispatch);
  };

  return (
    <div className={classes.root}>
      <MuiAppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            EC2 Controller
          </Typography>
          <div>
            <IconButton disabled={instance.loading} onClick={handleRefreshButton}>
              <Refresh />
            </IconButton>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem disabled>{user ? "Signed in as ${user.getUsername()}" : "not signed in"}</MenuItem>
              <MenuItem onClick={signOut}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </MuiAppBar>
    </div>
  );
}

export default AppBar;
