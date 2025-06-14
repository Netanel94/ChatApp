import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import { legacy_createStore as createStore } from "redux";
import userReducer from "../reducer/userReducer.ts";

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16, // Increase base font size
    h6: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
  },
  components: {
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },
  },
  spacing: (factor: any) => `${0.8 * factor}rem`,
});

const store = createStore(userReducer);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);
