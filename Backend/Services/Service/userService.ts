import userModel from "../Models/usersModel";

interface User {
  username: string;
  password: string;
  profilePicture: string;
  BlockedList: string[];
  __v?: number;
}

const getAllUsers = async () => {
  return await userModel.find({});
};

const getById = async (id: string) => {
  return await userModel.findById(id);
};

const updateUser = async (id: string, newData: User) => {
  await userModel.findByIdAndUpdate(id, newData);
  return "Updated";
};

const deleteUser = async (id: string) => {
  await userModel.findByIdAndDelete(id);
  return "Deleted";
};

const createUser = async (user: User) => {
  const finalUser = new userModel(user);
  await finalUser.save();
  return "Created";
};

const findUserName = async (useData: string) => {
  const user = userModel.findOne({ username: useData });
  return user;
};

export default {
  getAllUsers,
  getById,
  updateUser,
  deleteUser,
  createUser,
  findUserName,
};
