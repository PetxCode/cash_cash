"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.getUser = exports.signInUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../model/userModel"));
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, accountNumber, password } = req.body;
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(password, salt);
        const code = crypto_1.default.randomBytes(2).toString("hex");
        const verify = crypto_1.default.randomBytes(7).toString("hex");
        const hashVerifyCode = yield bcrypt_1.default.hash(verify, salt);
        if (accountNumber) {
            const user = yield userModel_1.default.create({
                accountNumber,
                email,
                password: hash,
                code,
                verifyCode: hashVerifyCode,
            });
            return res.status(201).json({
                status: 201,
                message: "creating",
                data: user,
            });
        }
        else {
            return res.status(404).json({
                status: 404,
                message: "Please Provide your Phone Number",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error creating",
            error: error.message,
        });
    }
});
exports.createUser = createUser;
const signInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield userModel_1.default.findOne({ email });
        if (user) {
            const check = yield bcrypt_1.default.compare(password, user.password);
            if (check) {
                if (user.verify && user.verifyCode === "") {
                    const token = jsonwebtoken_1.default.sign({
                        id: user._id,
                    }, "openSECRET", { expiresIn: "1h" });
                    return res.status(201).json({
                        status: 201,
                        message: "sign in successfully",
                        data: token,
                    });
                }
                else {
                    return res.status(404).json({
                        status: 404,
                        message: "You should go and verify your account",
                    });
                }
            }
            else {
                return res.status(404).json({
                    status: 404,
                    message: "error with password",
                });
            }
        }
        else {
            return res.status(404).json({
                status: 404,
                message: "error with Email ",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error sign in ",
            error: error.message,
        });
    }
});
exports.signInUser = signInUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        return res.status(200).json({
            status: 200,
            message: "user details",
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error reading user details",
            error: error.message,
        });
    }
});
exports.getUser = getUser;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, token } = req.params;
        const { code } = req.body;
        // const openToken = jwt.verify(token, "openSECRET", (error, data) => {
        //   if (error) throw error;
        //   return data;
        // });
        const user = yield userModel_1.default.findById(userID);
        if ((user === null || user === void 0 ? void 0 : user.code) === code) {
            yield userModel_1.default.findByIdAndUpdate(userID, {
                verify: true,
                verifyCode: "",
            }, { new: true });
            return res.status(201).json({
                status: 201,
                message: "user's account verified successfully",
            });
        }
        else {
            return res.status(404).json({
                status: 404,
                message: "something went wrong with your code",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error sign in ",
            error: error.message,
        });
    }
});
exports.verifyUser = verifyUser;
// export const signInUser = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     return res.status(201).json({
//       status: 201,
//       message: "sign in successfully",
//     });
//   } catch (error) {
//     return res.status(404).json({
//       status: 404,
//       message: "error sign in ",
//       error: error.message,
//     });
//   }
// };
