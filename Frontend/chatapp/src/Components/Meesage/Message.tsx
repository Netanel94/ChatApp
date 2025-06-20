import { Box, Avatar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import apiRequest from "../../Api/apiRequest.";
interface User {
  _id: string;
  username: string;
  password: string;
  profilePicture: string;
  BlockedList: string[];
}

function Message({ own, message, user }) {
  const timeString = formatDistanceToNow(new Date(message?.createdAt), {
    addSuffix: true,
  });
  const [friend, setFriend] = useState<User | null>(null);
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await apiRequest.get(`/users/${message.senderId}`);
        setFriend(res.data);
      } catch (e) {
        console.log(e);
      }
    };
    getUser();
  }, []);
  const PF: string = import.meta.env.VITE_PUBLIC_FOLDER || "";
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: "5px",
        height: "100px",
        alignItems: own ? "flex-end" : "flex-start",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Avatar
          sx={{
            p: 1,
            m: 0.5,
            width: 40,
            height: 40,
            borderRadius: "50%",
          }}
          src={
            own
              ? `${PF}/${user?.profilePicture}.png`
              : `${PF}/${friend?.profilePicture}.png`
          }
        />
        <Typography
          sx={{
            p: "10px",
            borderRadius: "20px",
            background: !own ? "rgb(54, 51, 51)" : "rgb(46, 167, 96)",
            color: !own ? "grey" : "white",
            maxWidth: 300,
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {message.message}
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: "12px", mt: "5px", p: "1px", color: "white" }}
      >
        {timeString}
      </Typography>
    </Box>
  );
}

export default Message;
