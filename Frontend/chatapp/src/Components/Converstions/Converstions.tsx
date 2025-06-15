import { Avatar, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import apiRequest from "../../Api/apiRequest.";
import { formatDistanceToNow } from "date-fns";
import { useUserStore } from "../../../zustand_Store/store";

interface User {
  username: string;
  password: string;
}

interface Conversation {
  _id: string;
  users: string[];
  chatName: string[];
  conversetion: [];
}

function Converstions({ currConvo }) {
  const PF: string = import.meta.env.VITE_PUBLIC_FOLDER || "";
  const [friend, setFriend] = useState<string>("");
  const { user } = useUserStore();
  const timeString =
    currConvo.conversation?.length > 0
      ? formatDistanceToNow(
          new Date(
            currConvo.conversation[currConvo.conversation.length - 1]?.createdAt
          ),
          { addSuffix: true }
        )
      : "No messages yet";

  useEffect(() => {
    const getFriend = async () => {
      const friendName = currConvo.chatName.find(
        (currUser: any) => currUser != user?.username
      );
      // console.log(friendId);
      // const res = await apiRequest.get(`/users/${friendId}`);
      // console.log(res);
      setFriend(friendName);
    };
    getFriend();
  }, [currConvo.chatName]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "grey.900",
        p: 1,
        gap: 1,
        color: "white",
        maxWidth: "100%",
        cursor: "pointer",
        ":hover": {
          background: "rgba(121, 121, 121, 0.15)",
        },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
        }}
        src={`${PF}person/Unknown_person.jpg`}
      />
      <Box
        sx={{
          width: 0,
          minWidth: 0,
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" color="primary.light">
            {friend}
          </Typography>
          <Typography variant="caption" color="grey.500">
            {timeString}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          noWrap
          sx={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            color: "grey.300",
          }}
        >
          {currConvo?.conversation?.at(-1)?.message || "Start the conversation"}
        </Typography>
      </Box>
    </Box>
  );
}

export default Converstions;
