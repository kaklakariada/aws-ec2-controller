/** @jsxImportSource @emotion/react */
import { AuthUser } from 'aws-amplify/auth';
import { css } from '@emotion/react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from '@mui/icons-material/Refresh';
import MuiAppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React from "react";
import { SignOut } from '../App';
import { useStateValue } from "../hooks/state";
import { BackendService } from "../services/BackendService";

const backendService = new BackendService();

interface AppBarProps {
  signOut: SignOut;
  user: AuthUser | undefined;
}

const AppBar: React.FC<AppBarProps> = ({ user, signOut }) => {
  const { state: { instance }, dispatch } = useStateValue();

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
    <div css={css`flex-grow: 1`}>
      <MuiAppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            size="large">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" css={css`flex-grow: 1`}>
            EC2 Controller
          </Typography>
          <div>
            <IconButton disabled={instance.loading} onClick={handleRefreshButton} size="large">
              <RefreshIcon />
            </IconButton>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              size="large">
              <AccountCircleIcon />
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
              <MenuItem disabled>{user ? `Signed in as ${user.username}` : "not signed in"}</MenuItem>
              <MenuItem onClick={signOut}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </MuiAppBar>
    </div >
  );
}

export default AppBar;
