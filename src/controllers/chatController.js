import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync";

export const createChat = catchAsync(async (req,res)=>{
    const {participants} = req.body;
    const chat = await Chat.create({participant })
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