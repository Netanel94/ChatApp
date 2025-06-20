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
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Add, GroupAdd } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import apiRequest from "../../Api/apiRequest.";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useUserStore } from "../../../zustand_Store/store";

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
  profilePicture: string;
  BlockedList: string[];
}
interface ProfileImage {
  id: number;
  name: string;
  displayName: string;
  url: string;
  fullUrl: string;
}

export default function UserInterface({ user, users, setgroupConversation }) {
  const PF: string = import.meta.env.VITE_PUBLIC_FOLDER || "";
  const [open, setOpen] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [addGroup, setAddGroup] = useState<User[]>([user]);
  const [errorMessage, setErrorMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [usersId, setUserIds] = useState<string[]>([user._id]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const updateUser = useUserStore((state) => state.updateUser);
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProfileImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await apiRequest.get("/users/images");
        setImages(response.data);
        console.log("Fetched images:", response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const handleImageSelect = (image: ProfileImage) => {
    setSelectedImage(image);
    console.log("Selected:", image);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickUpload = () => {
    setOpenUpload(true);
  };

  const handleCloseUpload = () => {
    setOpenUpload(false);
    setSelectedFile(null);
    setSelectedImage(null);
  };

  const handleSlectedPicture = async () => {
    if (selectedImage) {
      const updatedUser = {
        ...user,
        profilePicture: selectedImage?.displayName,
      };
      try {
        await apiRequest.post("/users", updatedUser);
        updateUser({ profilePicture: selectedImage });
        setOpenUpload(false);
        setSelectedFile(null);
        setSelectedImage(null);
      } catch (e) {
        console.log(e);
      }
    } else {
      setErrorMessage("Please Select an Image");
      setOpenSnack(true);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
    } else {
      setErrorMessage("Please select an image file");
      setOpenSnack(true);
      event.target.value = "";
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const response = await apiRequest.post(
        "/users/upload-profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload successful:", response.data);

      const newImage = response.data.image;
      setImages((prevImages) => [...prevImages, newImage]);

      setSelectedFile(null);

      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      setErrorMessage("Image uploaded successfully!");
      setOpenSnack(true);
    } catch (error) {
      console.error("Upload failed:", error);
      setErrorMessage("Upload failed");
      setOpenSnack(true);
    } finally {
      setUploading(false);
    }
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
        setAddGroup([]);
        setGroupName("");
        setOpen(false);
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

      <Avatar
        sx={{
          mt: 2,
          ml: 2.5,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
        }}
        src={`${PF}/Unknown_person.jpg`}
      ></Avatar>
      <Typography sx={{ mt: 0.5, ml: 3 }} color="white">
        {user?.username}
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
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
        <Tooltip title="Update Profile Picture">
          <IconButton
            onClick={handleClickUpload}
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
            <FileUploadIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog
        open={openUpload}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ maxWidth: "300" }}
      >
        <DialogTitle id="alert-dialog-title">Update Picture</DialogTitle>
        <DialogContent>
          <Box
            className="Popup-content"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
              justifyContent: "center",
            }}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
                size="small"
              >
                Upload Image
              </Button>
            </label>
            {selectedFile && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  Selected: {selectedFile.name}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleUploadFile}
                  disabled={uploading}
                  sx={{ mt: 1, display: "block" }}
                  size="small"
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
              </Box>
            )}
            {selectedImage && (
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <Avatar
                  src={selectedImage.fullUrl}
                  sx={{ width: 80, height: 80, mx: "auto", mb: 1 }}
                />
                <Typography color="black">
                  Selected: {selectedImage.displayName}
                </Typography>
              </Box>
            )}

            <List>
              {images.map((image) => (
                <ListItem
                  key={image.id}
                  onClick={() => handleImageSelect(image)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                    border:
                      selectedImage?.id === image.id
                        ? "2px solid #1976d2"
                        : "none",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={image.fullUrl} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={image.displayName}
                    sx={{ color: "black" }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSlectedPicture}>Select</Button>
          <Button onClick={handleCloseUpload} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

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
