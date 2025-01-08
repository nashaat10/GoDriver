import { Chat } from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";

export const createChat = catchAsync(async (req,res)=>{
    const {participants} = req.body;
    const chat = await Chat.create({participants})
    res.status(201).json({
        status:"success",
        data:{
            chat,
        },
    });
});

export const sendMessages = catchAsync(async (req,res)=>{
    const {chatId, content}= req.body;
    const message ={
        sender: req.user.id,
        content,
    };

const chat = await Chat.findByIdAndUpdate(
    chatId,
    {$push :{messages:message}, lastMessage:new Date()},
    {new: true}
);

res.status(200).json({
    status: "success",
    data:{
        chat,
    },
});
});


export const getChatHistory = catchAsync(async(req,res)=>{
    const {chatId}= req.params;
    const chat = await Chat.findById(chatId).populate("message.sender", "name");

    res.status(200).json({
        status: "success",
        data:{
            chat,
        }
    })
})


export const joinChat = catchAsync(async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body; // Assuming you send userId in the request body

    // Logic to add the user to the chat (this could vary based on your requirements)
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(new AppError("Chat not found", 404));
    }

    // Check if the user is already a participant
    if (chat.participants.includes(userId)) {
        return res.status(200).json({
            status: "success",
            message: "User already in chat",
        });
    }

    // Add user to participants
    chat.praticipant.push(userId);
    await chat.save();

    res.status(200).json({
        status: "success",
        data: {
            chat,
        },
    });
});