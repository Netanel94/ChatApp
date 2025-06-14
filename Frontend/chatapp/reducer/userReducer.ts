interface User {
  _id: string;
  username: string;
  password: string;
}

interface UserAction {
  type: string;
  payload?: any;
}

const userState = { user: null, loading: false, error: null };

const userReducer = (state = userState, action: UserAction) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        loading: true,
      };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload,
      };

    case "LOGIN_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
  }
};

export default userReducer;
