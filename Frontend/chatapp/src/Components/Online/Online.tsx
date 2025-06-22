import { Avatar, Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import apiRequest from "../../Api/apiRequest.";
import BlockIcon from "@mui/icons-material/Block";
import { useUserStore } from "../../../zustand_Store/store";

interface User {
  _id: string;
  username: string;
  password: string;
  profilePicture: string;
  BlockedList: string[];
}

interface Conversation {
  _id: string;
  users: string[];
  chatName: string[];
  conversation: [];
}

export default function Online({
  own,
  user,
  conversations,
  currUser,
  checkDifferentConvo,
  newConvoUpdate,
  onlineUser,
  blockedUser,
}) {
  const PF: string = import.meta.env.VITE_PUBLIC_FOLDER || "";
  const [isBlocked, setIsBlock] = useState(blockedUser);
  const updateUser = useUserStore((state) => state.updateUser);

  const blockUser = async (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    if (!isBlocked) {
      setIsBlock(!isBlocked);
      await apiRequest.post(`/users/block/${user._id}`);
      const newList = [...currUser.BlockedList, user._id];
      updateUser({ BlockedList: newList });
    } else {
      setIsBlock(!isBlocked);
      await apiRequest.post(`/users/unBlock/${user._id}`);
      const newList = currUser.BlockedList.filter(
        (id: string) => id !== user._id
      );
      updateUser({ BlockedList: newList });
    }
  };

  const findConvo = async () => {
    const currConvo: Conversation = conversations.find(
      (conversation) =>
        conversation.users.includes(user._id) &&
        conversation.users.includes(currUser._id) &&
        conversation.length === 2
    );

    if (currConvo) {
      checkDifferentConvo(currConvo._id, currConvo);
    } else {
      const userId = user._id;
      const username = user.username;
      const currUserId = currUser._id;
      const newConvo = {
        users: [userId, currUserId],
        chatName: [username, currUser.username],
      };
      const res = await apiRequest.post("/conversations", newConvo);
      const newConversation = res.data.status;
      checkDifferentConvo(newConversation._id, newConversation);
      newConvoUpdate(newConversation);
    }
  };
  return (
    <Box
      sx={{
        opacity: isBlocked ? 0.5 : 1,
        filter: isBlocked ? "grayscale(30%)" : "none",
        transition: "all 0.3s ease",
        position: "relative",
        // border: "1px solid black",
        display: own ? "flex" : "none",
        alignItems: "center",
        p: 1,
        gap: 1,
        flexDirection: "row",
        cursor: "pointer",
        pointerEvents: isBlocked ? "none" : "auto",
        ":hover": {
          background: isBlocked ? "none" : "rgba(121, 121, 121, 0.15)",
        },
      }}
      onClick={isBlocked ? () => {} : findConvo}
    >
      <Avatar
        sx={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
        }}
        src={
          user.profilePicture
            ? `${PF}/${user.profilePicture}.png`
            : `${PF}/Unknown_person.jpg`
        }
      ></Avatar>
      <Box
        sx={{
          position: "absolute",
          width: "10px",
          height: "10px",
          bottom: "16px",
          borderRadius: "50%",
          background: onlineUser ? "rgb(63, 211, 100)" : "rgb(218, 80, 80)",
          border: "1px solid white",
          zIndex: 1,
        }}
      ></Box>

      <Typography sx={{ color: "white" }}>{user.username}</Typography>
      <BlockIcon
        sx={{
          color: "white",
          fontSize: "medium",
          pointerEvents: "auto",
          cursor: "pointer",
          zIndex: 2,
        }}
        onClick={blockUser}
      ></BlockIcon>
    </Box>
  );
}
