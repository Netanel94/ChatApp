import conversetionModel from "../Models/conversetionModel";
interface Converstion {
  users: string[];
  conversetion: [{ senderId: string; message: string; createdAt: Date }];
}

const getConversetions = async (id: string) => {
  return await conversetionModel.find({ users: { $in: [id] } });
};

const createConversetion = async (convo: Converstion): Promise<any> => {
  const newConvo = new conversetionModel(convo);
  const savedConvo = await newConvo.save();
  return savedConvo;
};

const findOneConversation = async (userId: string, senderId: string) => {
  const conversation = await conversetionModel.findOne({
    users: {
      $all: [userId, senderId],
      $size: 2,
    },
  });

  return conversation;
};



const updateConversetion = async (convo: Converstion, id: string) => {
  await conversetionModel.findByIdAndUpdate(id, convo);
  return "Updated";
};

export default {
  getConversetions,
  createConversetion,
  updateConversetion,
  findOneConversation,
};
