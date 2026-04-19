import jwt from "jsonwebtoken";

export const generateAccessToken = (user)=>{
    jwt.sign({
        id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion
    },
    process.env.JWT_SECRET,
    {expiresIn: "15m"}
);
};

export const generateRefreshToken = (user)=>{
    jwt.sign(
        {
        id: user._id,
        tokenVersion: user.tokenVersion 
        },
        process.env.JWT_REFRESH_SECRET,
        {expiresIn: "7d"}
    )
};