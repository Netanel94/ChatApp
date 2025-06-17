import {
  Alert,
  Box,
  Button,
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Input,
} from "@mui/material";
import { Add, GroupAdd } from "@mui/icons-material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import apiRequest from "../../Api/apiRequest.";

interface Message {
  senderId: string | undefined;
  message: string | null;
  createdAt: string;
}

interface Conversation {
  _id: string;
  users: string[];
  chatName: string[];
  conversation: Message[];
}

interface User {
  _id: string;
  username: string;
  password: string;
  BlockedList: string[];
}

export default function UserInterface({ user, users, setgroupConversation }) {
  const [open, setOpen] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [addGroup, setAddGroup] = useState<User[]>([user]);
  const [errorMessage, setErrorMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [usersId, setUserIds] = useState<string[]>([user._id]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = async () => {
    if (groupName) {
      const groupConversation: Omit<Conversation, "_id"> = {
        users: usersId,
        chatName: [groupName],
        conversation: [],
      };
      try {
        const res = await apiRequest.post("/conversations", groupConversation);
        setgroupConversation(res.data.status);
      } catch (e) {
        console.log(e);
      }
    } else {
      setErrorMessage("Please enter group name");
      setOpenSnack(true);
    }
  };

  const cancelGroup = () => {
    setAddGroup([]);
    setGroupName("");
    setOpen(false);
  };

  const handleCloseSnack = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnack(false);
  };

  const addNewUser = (userAdd) => {
    const check = addGroup.includes(userAdd);
    if (!check) {
      const userId = userAdd._id;
      setUserIds([...usersId, userId]);
      setAddGroup([...addGroup, userAdd]);
    } else {
      setErrorMessage("User Already Added");
      setOpenSnack(true);
    }
  };
  return (
    <Box
      sx={{
        mt: 5,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        p: 1,
      }}
      className="UserInfo"
    >
      <Typography color="white">Current User : </Typography>
      <Typography sx={{ mt: 2, ml: 3 }} color="white">
        {user?.username}
      </Typography>
      <Tooltip title="Create Group Chat">
        <IconButton
          onClick={handleClickOpen}
          sx={{
            p: 2,
            mt: 1,
            height: "10px",
            width: "10px",
            borderRadius: "30%",
            bgcolor: "grey.900",
            ":hover": { background: "rgba(107, 104, 104, 0.15)" },
            color: "white",
          }}
        >
          <GroupAdd />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ maxWidth: "300" }}
      >
        <DialogTitle id="alert-dialog-title">Create Group Chat</DialogTitle>
        <DialogContent>
          <Box
            className="Popup-content"
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <Input
              placeholder="Enter Group Name"
              onChange={(e) => {
                setGroupName(e.target.value);
              }}
            ></Input>
            {users.map((userAdd, index) => {
              return (
                <Box
                  key={userAdd._id || index}
                  className="Popup-content-warpper"
                  sx={{
                    display: user?._id !== userAdd._id ? "flex" : "none",
                    justifyContent: "space-around",
                  }}
                >
                  <Typography>{userAdd.username}</Typography>
                  <AddIcon
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      addNewUser(userAdd);
                    }}
                  />
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {addGroup.map((userAdd, index) => {
              return (
                <Typography key={userAdd._id} sx={{ m: 1 }}>
                  {userAdd._id === user._id ? "" : userAdd?.username}
                </Typography>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Create</Button>
          <Button onClick={cancelGroup} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnack}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnack}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
