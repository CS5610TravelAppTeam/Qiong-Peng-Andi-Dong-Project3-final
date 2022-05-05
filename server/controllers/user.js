import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import UserModal from "../models/user.js";

const secret = 'test';
const SENDER_EMAIL = 'SeattleTravelTeamCS5610@gmail.com';
const EMAIL_PASSWORD = 'SeattleTravelCS5610Team';

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModal.create({ email, password: hashedPassword, username: username });

    const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1h" });

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: SENDER_EMAIL, // generated ethereal user
        pass: EMAIL_PASSWORD, // generated ethereal password
      },
    });
    console.log("Transport middle");
    transporter
      .sendMail({
        from: SENDER_EMAIL,
        to: `${email}`,
        subject: "Welcome to SeattleTravel",
        text: `Hello Dear ${username}`,
        html: `<b>Hello Dear ${username}, we are happy that you join our family. Kind Regards, SeattleTravel Team.</b>`,
      })
      .then((info) => console.log("Email has been sent!"))
      .catch((err) => console.log(err));

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

    console.log(error);
  }
};
