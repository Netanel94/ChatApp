import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Input,
  Paper,
  InputAdornment,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import Converstions from "../Converstions/Converstions";
import { Search } from "@mui/icons-material";
import Message from "../Meesage/Message";
import Online from "../Online/Online";
import apiRequest from "../../Api/apiRequest.";
import { io, Socket } from "socket.io-client";
import getCookies from "../../utils";
import { setTimeout } from "timers/promises";
import { useUserStore } from "../../../zustand_Store/store";
import UserInterface from "../UserInterface/UserInterface";

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

// interface RootState {
//   user: {
//     user: User | null;
//     loading: boolean;
//     error: string | null;
//   };
// }

interface ArrivalMessage {
  senderId: string;
  message: string;
  createdAt: string;
  convoId: string;
}

interface onlineUser {
  userId: string;
  socketId: string;
}
const Main = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currConvoId, setCurrConvoid] = useState("");
  const [currConvo, setCurrConvo] = useState<Conversation>({} as Conversation);
  const [currMessages, setCurrMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const socket = useRef<Socket | null>(null);
  // const user = useSelector((state: RootState) => console.log(state));
  const { user, clearUser } = useUserStore();
  const [message, setMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState<ArrivalMessage>(
    {} as ArrivalMessage
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [onlineUsers, setOnlineUsers] = useState<onlineUser[]>([]);
  const [newGroupConversation, setNewGroupConversation] = useState({});
  const [groupConversations, setGroupConversations] = useState<Conversation[]>(
    []
  );

  useEffect(() => {
    const startSocket = async () => {
      const newSocket = io("http://localhost:8000", {
        // transports: ["websocket"], // Force WebSocket
        // forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
      socket.current = newSocket;
      socket.current.on("getMessage", (newMessage) => {
        setArrivalMessage({
          senderId: newMessage.senderId,
          message: newMessage.message,
          createdAt: new Date().toISOString(),
          convoId: newMessage.convoId,
        });
      });
      const res = await apiRequest.get("/conversations");
      const currGroups = res.data.filter(
        (convo: Conversation) => convo.users.length > 2
      );

      socket.current.emit("createGroups", currGroups);

      setGroupConversations(currGroups);
    };
    startSocket();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  const newConvoUpdate = (newConversation: Conversation) => {
    setConversations((prevConvos) => [...prevConvos, newConversation]);
  };

  const groupConversation = (newConversation: Conversation) => {
    setNewGroupConversation(newConversation);
    setConversations((prevConvos) => [...prevConvos, newConversation]);
  };

  useEffect(() => {
    const arrivalMessageFunc = async () => {
      const currentMessage = {
        senderId: arrivalMessage.senderId,
        message: arrivalMessage.message,
        createdAt: arrivalMessage.createdAt,
      };
      if (arrivalMessage && arrivalMessage.senderId && arrivalMessage.message) {
        if (currConvo._id === arrivalMessage.convoId) {
          const updatedConvo = {
            ...currConvo,
            conversation: [...currConvo.conversation, currentMessage],
          };
          setCurrConvo(updatedConvo);

          setCurrMessages((prevMessages) => [...prevMessages, arrivalMessage]);
          setConversations((prevConvoersations) =>
            prevConvoersations.map((conversation) =>
              conversation?._id === updatedConvo._id
                ? updatedConvo
                : conversation
            )
          );
        } else if (user?._id) {
          const convoToUpdate = conversations.find(
            (conversation) =>
              conversation.users.includes(user._id) &&
              conversation.users.includes(arrivalMessage.senderId)
          );
          if (convoToUpdate) {
            const updatedConvo = {
              ...convoToUpdate,
              conversation: [...convoToUpdate.conversation, currentMessage],
            };

            setConversations((prevConversations) =>
              prevConversations.map((conversation) =>
                conversation?._id === convoToUpdate._id
                  ? updatedConvo
                  : conversation
              )
            );
          } else if (arrivalMessage) {
            const sender: string = arrivalMessage.senderId;
            const res = await apiRequest.get(
              `/conversations/getOneConvo/${sender}`
            );
            const newConvo: Conversation = res.data.conversation;
            const updatedConvo = {
              ...newConvo,
              conversations: [...newConvo.conversation, currentMessage],
            };

            console.log("Conversations before a new chat" + conversations);

            const newConversations = [...conversations, updatedConvo];

            setConversations(newConversations);

            console.log("Conversations after a new chat" + conversations);
          }
        }
      }
    };
    arrivalMessageFunc();
  }, [arrivalMessage]);

  useEffect(() => {
    socket.current?.emit("addUser", user?._id);
    socket.current?.on("getUsers", (users) => {
      console.log(users);
      setOnlineUsers(users);
    });

    return () => {
      socket.current?.off("getUsers");
    };
  }, [user?._id]);

  useEffect(() => {
    const fetchConvos = async () => {
      const res = await apiRequest.get("/conversations");
      const userRes = await apiRequest.get("/users");
      setUsers(userRes.data);
      setConversations(res.data);
    };
    fetchConvos();
  }, []);

  const checkDifferentConvo = (id: string, convo: Conversation) => {
    if (id === currConvoId) {
      setCurrConvoid("");
    } else {
      setCurrConvoid(id);
      setCurrMessages(convo.conversation);
      setCurrConvo(convo);
    }
  };

  const sendMessage = async () => {
    const currMessage: Message = {
      senderId: user?._id,
      message: message,
      createdAt: new Date().toISOString(),
    };

    const reciverId =
      currConvo.chatName.length > 1
        ? currConvo.users.find((currUser) => currUser !== user?._id)
        : currConvo.users.filter((currUser) => currUser !== user?._id);

    if (socket && !Array.isArray(reciverId)) {
      socket.current?.emit("sendMessage", {
        senderId: user?._id,
        reciverId,
        message,
      });
    } else if (socket) {
      socket.current?.emit("sendMessage", {
        senderId: user?._id,
        reciverId,
        convoId: currConvo._id,
        message,
      });
    }

    const updatedConvo = {
      ...currConvo,
      conversation: [...currConvo.conversation, currMessage],
    };
    setCurrConvo(updatedConvo);

    setConversations((prevConvoersations) =>
      prevConvoersations.map((conversation) =>
        conversation?._id === updatedConvo._id ? updatedConvo : conversation
      )
    );
    setCurrMessages((prevMessages) => [...prevMessages, currMessage]);
    await apiRequest.post(`/conversations/${currConvoId}`, updatedConvo);

    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "instant" });
  }, [currMessages]);

  return (
    <Box
      sx={{
        display: "flex",
        // border: "5px solid black",
        flexDirection: "row",
        width: "100%",
        height: "100vh",
        bgcolor: "grey.900",
      }}
    >
      <Box
        sx={{
          // border: "1px solid black",
          // width: "350px",
          bgcolor: "grey.900",
          // height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        className="Converstions"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            // border: "1px solid orange",
            // width: "95%",
            padding: 1,
            bgcolor: "grey.900",
            flexShrink: 0,
          }}
          className="Chat-Navbar"
        >
          <Typography
            sx={{
              color: "rgb(148, 148, 148)",
              p: 1,
              fontSize: "1.5rem",
              fontWeight: "bold",
              // marginBottom: 1,
            }}
          >
            Chats
          </Typography>
          <Input
            startAdornment={
              <InputAdornment position="start">
                <Search
                  sx={{
                    height: "24px",
                    width: "24px",
                    background: "rgb(49, 49, 49)",
                    color: "rgb(148, 148, 148)",
                    marginRight: 1,
                  }}
                />
              </InputAdornment>
            }
            sx={{
              border: "1px solid black",
              fontSize: "1rem",
              padding: "4px 8px",
              borderRadius: "4px",
              background: "rgb(49, 49, 49)",
              color: "rgb(218, 214, 214)",
              "&:before": {
                borderBottomColor: "green",
              },
              "&:hover:not(.Mui-disabled):before": {
                borderBottomColor: "lightgreen",
              },
              "&:after": {
                borderBottomColor: "darkgreen",
              },
            }}
            placeholder="Search convos"
          />
        </Box>
        <Box
          sx={{ border: "", overflowY: "auto" }}
          className="Converstions Wrapper"
        >
          {conversations?.map((conversation, index) => {
            return (
              <Box
                key={index}
                onClick={() => {
                  checkDifferentConvo(conversation._id, conversation);
                }}
              >
                <Converstions currConvo={conversation} />{" "}
              </Box>
            );
          })}
        </Box>
      </Box>
      <Box
        className="CurrentConversion"
        sx={{
          border: "1px solid black",
          flex: 1,
          // height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            // border: "1px solid blue",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          className="CurrentConversion-Warrper"
        >
          {currConvoId ? (
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                gap: "16px",
              }}
              className="chatBoxTop"
            >
              {currMessages.map((message: Message, index: number) => {
                // console.log(currMessages);
                return (
                  <Box key={index} ref={scrollRef}>
                    <Message
                      own={message.senderId === user?._id}
                      message={message}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
                opacity: 0.3,
                userSelect: "none",
                gap: 2,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: "rgb(206, 203, 203)",
                  fontWeight: 300,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                Start a chat...
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgb(206, 203, 203)",
                  opacity: 0.7,
                  textAlign: "center",
                  maxWidth: 300,
                }}
              >
                Select a conversation from the sidebar to begin messaging
              </Typography>
            </Box>
          )}

          {currConvoId ? (
            <Box
              sx={{
                padding: "16px 20px",
                borderTop: "2px solid #ddd",
                bgcolor: "grey.900",
              }}
              className="chatBoxBottom"
            >
              <Input
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                fullWidth
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                sx={{
                  padding: "12px 16px",
                  height: "50px",
                  fontSize: "1.1rem",
                  borderRadius: "24px",
                  background: "white",
                  color: "black",
                  border: "1px solid #ddd",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              ></Input>
            </Box>
          ) : (
            ""
          )}
        </Box>
      </Box>
      <Box
        className="usersDisplay"
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Box
          className="Online"
          sx={{
            border: "1px solid black",
            width: "150px",
            position: "relative",
            overflowY: "auto",
          }}
        >
          {users.map((onlineUser: User, index: number) => {
            return (
              <Online
                onlineUser={
                  !!onlineUsers.find(
                    (currUser) => currUser.userId === onlineUser._id
                  )
                }
                blockedUser={
                  !!user?.BlockedList.find(
                    (currUser) => currUser === onlineUser._id
                  )
                }
                own={user?._id !== onlineUser._id}
                key={index}
                user={onlineUser}
                currUser={user}
                conversations={conversations}
                checkDifferentConvo={checkDifferentConvo}
                newConvoUpdate={newConvoUpdate}
              />
            );
          })}
        </Box>
        <UserInterface
          user={user}
          users={users}
          setgroupConversation={groupConversation}
        />
      </Box>
    </Box>
  );
};

export default Main;
