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
exports.initiateBillPaymentForData = exports.initiateBillPaymentForAirTime = exports.verifyAccountPayout = exports.accountPayout = exports.verifyTransaction = exports.initializeTransaction = exports.verifyDeposite = exports.depositeFund = exports.transferToWallet = void 0;
const userModel_1 = __importDefault(require("../model/userModel"));
const node_https_1 = __importDefault(require("node:https"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
const transferToWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userID, beneficiaryID } = req.params;
        const { amount } = req.body;
        const user = yield userModel_1.default.findById(userID);
        const beneficiary = yield userModel_1.default.findById(beneficiaryID);
        if (user && beneficiary) {
            const ref = crypto_1.default.randomBytes(3).toString("hex");
            if ((user === null || user === void 0 ? void 0 : user.walletBalance) > amount) {
                yield userModel_1.default.findByIdAndUpdate(userID, {
                    walletBalance: user.walletBalance - amount,
                    history: [
                        ...user === null || user === void 0 ? void 0 : user.history,
                        {
                            bank_name: user === null || user === void 0 ? void 0 : user.platformName,
                            transaction_type: "debit",
                            transaction_date: (0, moment_1.default)(Date.now()).format("llll"),
                            credit_Account: `${beneficiary === null || beneficiary === void 0 ? void 0 : beneficiary.accountNumber}`,
                            reference: ref,
                            amount,
                            Beneficiary: `${beneficiary === null || beneficiary === void 0 ? void 0 : beneficiary.firstName} ${beneficiary === null || beneficiary === void 0 ? void 0 : beneficiary.lastName}`,
                        },
                    ],
                }, { new: true });
                yield userModel_1.default.findByIdAndUpdate(beneficiaryID, {
                    walletBalance: beneficiary.walletBalance + amount,
                    history: [
                        ...beneficiary.history,
                        {
                            bank_name: user === null || user === void 0 ? void 0 : user.platformName,
                            transaction_type: "credit",
                            transaction_date: (0, moment_1.default)(Date.now()).format("llll"),
                            credit_Account: `${(_a = beneficiary === null || beneficiary === void 0 ? void 0 : beneficiary.accountNumber) === null || _a === void 0 ? void 0 : _a.toString().slice(0, 2)} 
                  
                  ${"*".repeat(4)}

                  ${(_b = beneficiary === null || beneficiary === void 0 ? void 0 : beneficiary.accountNumber) === null || _b === void 0 ? void 0 : _b.toString().slice(7)}  `,
                            receivedFrom: `${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}`,
                            reference: ref,
                            amount,
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    status: 201,
                    message: "wallet balance credited successfully",
                });
            }
            else {
                return res.status(404).json({
                    status: 404,
                    message: "Balance not enough",
                });
            }
        }
        else {
            return res.status(404).json({
                status: 404,
                message: "can't find user",
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
exports.transferToWallet = transferToWallet;
// using Paystack API
const depositeFund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        const { userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        const params = JSON.stringify({
            email: user === null || user === void 0 ? void 0 : user.email,
            amount: `${amount * 100}`,
            callback_url: "http://localhost:2244/",
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_ID}`,
                "Content-Type": "application/json",
            },
        };
        const request = node_https_1.default
            .request(options, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                return res.status(201).json({
                    status: 201,
                    message: "Deposite done",
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            return error;
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error sign in ",
            error: error.message,
        });
    }
});
exports.depositeFund = depositeFund;
const verifyDeposite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference, userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        const url = `https://api.paystack.co/transaction/verify/${reference}`;
        yield axios_1.default
            .get(url, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_ID}`,
            },
        })
            .then((readData) => __awaiter(void 0, void 0, void 0, function* () {
            var _c, _d, _e, _f, _g;
            const check = (_c = user === null || user === void 0 ? void 0 : user.history) === null || _c === void 0 ? void 0 : _c.find((el) => {
                return el.reference === reference;
            });
            if (check) {
                return res.status(200).json({
                    status: 200,
                    message: "deposit data already done",
                });
            }
            else {
                const history = {
                    reference,
                    amount: ((_e = (_d = readData === null || readData === void 0 ? void 0 : readData.data) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.amount) / 100,
                    kind: "credit",
                };
                yield userModel_1.default.findByIdAndUpdate(userID, {
                    walletBalance: (user === null || user === void 0 ? void 0 : user.walletBalance) + ((_g = (_f = readData === null || readData === void 0 ? void 0 : readData.data) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.amount) / 100,
                    history: [...user.history, history],
                }, { new: true });
                return res.status(200).json({
                    status: 200,
                    message: "deposit data ",
                    data: readData === null || readData === void 0 ? void 0 : readData.data,
                });
            }
        }));
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "error sign in ",
            error: error.message,
        });
    }
});
exports.verifyDeposite = verifyDeposite;
// using flutterwave API
const initializeTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j;
    const { userID } = req.params;
    const { amount } = req.body;
    const user = yield userModel_1.default.findById(userID);
    const code = crypto_1.default.randomBytes(4).toString("hex");
    const data = {
        tx_ref: code,
        amount,
        currency: "NGN",
        redirect_url: "http://localhost:2244/",
        customer: {
            email: user === null || user === void 0 ? void 0 : user.email,
            phone: `234${user === null || user === void 0 ? void 0 : user.accountNumber}`,
        },
        customizations: {
            title: "Payment for goods",
            description: "Payment for the best goods",
            logo: "https://example.com/logo.png",
        },
    };
    try {
        const response = yield axios_1.default.post("https://api.flutterwave.com/v3/payments", data, {
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        // Handle response
        return res.status(201).json({
            status: 201,
            message: "Deposite done",
            data: (_j = (_h = response === null || response === void 0 ? void 0 : response.data) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.link,
        });
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "Deposite error",
            data: error.message,
        });
    }
});
exports.initializeTransaction = initializeTransaction;
const verifyTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference, userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        yield axios_1.default
            .get(`https://api.flutterwave.com/v3/transactions/${reference}/verify`, {
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        })
            .then((readData) => __awaiter(void 0, void 0, void 0, function* () {
            var _k, _l, _m, _o, _p;
            const check = (_k = user === null || user === void 0 ? void 0 : user.history) === null || _k === void 0 ? void 0 : _k.find((el) => {
                return el.reference === reference;
            });
            if (check) {
                return res.status(200).json({
                    status: 200,
                    message: "deposit data already done",
                });
            }
            else {
                const history = {
                    reference,
                    amount: ((_m = (_l = readData === null || readData === void 0 ? void 0 : readData.data) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.amount) / 100,
                    kind: "credit",
                };
                yield userModel_1.default.findByIdAndUpdate(userID, {
                    walletBalance: (user === null || user === void 0 ? void 0 : user.walletBalance) + ((_p = (_o = readData === null || readData === void 0 ? void 0 : readData.data) === null || _o === void 0 ? void 0 : _o.data) === null || _p === void 0 ? void 0 : _p.amount) / 100,
                    history: [...user.history, history],
                }, { new: true });
                return res.status(200).json({
                    status: 200,
                    message: "deposit data ",
                    data: readData === null || readData === void 0 ? void 0 : readData.data,
                });
            }
        }));
        // Handle response
        // return res.status(201).json({
        //   status: 201,
        //   message: "Deposite done",
        //   data: response.data,
        // });
    }
    catch (error) {
        return res.status(404).json({
            status: 404,
            message: "Deposite verification error",
            data: error.message,
        });
    }
});
exports.verifyTransaction = verifyTransaction;
// using flutterwave API: Payout
const accountPayout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { account_bank, account_number, amount, narration } = req.body;
        const { userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        const data = {
            account_bank,
            account_number,
            amount,
            currency: "NGN",
            narration,
        };
        if ((user === null || user === void 0 ? void 0 : user.walletBalance) >= amount) {
            yield axios_1.default
                .post("https://api.flutterwave.com/v3/transfers", data, {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                return res.status(201).json({
                    data: response.data,
                    message: "payout processing",
                });
            });
        }
        else {
            return res.status(404).json({
                message: "Account Balance too small",
            });
        }
        // Handle response
    }
    catch (error) {
        return res.status(404).json({
            message: "Account Balance too small",
            error: error,
        });
    }
});
exports.accountPayout = accountPayout;
const verifyAccountPayout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { payoutID } = req.params;
        yield axios_1.default
            .get(`https://api.flutterwave.com/v3/transfers/${payoutID}`, {
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
            console.log(res.data);
            return res.status(200).json({
                message: "Payout successfully",
                data: res.data,
            });
        });
        // Handle response
    }
    catch (error) {
        console.error("Error verifying payout:", error.response ? error.response.data : error.message);
        throw error;
    }
});
exports.verifyAccountPayout = verifyAccountPayout;
// using flutterwave API: Bill Payment
const initiateBillPaymentForAirTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        const { userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        const code = crypto_1.default.randomBytes(6).toString("hex");
        const data = {
            country: "NG",
            customer_id: `0${user === null || user === void 0 ? void 0 : user.accountNumber}`,
            amount,
            recurrence: "ONCE",
            type: "AIRTIME", // Type of bill (e.g., AIRTIME, DATA, DSTV, etc.)
            reference: `${(0, moment_1.default)(Date.now()).format("lll")}-${code}`, // Unique transaction reference
        };
        yield axios_1.default
            .post("https://api.flutterwave.com/v3/bills", data, {
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
            return res.status(201).json({
                message: "Airtime Purchased",
                data: response === null || response === void 0 ? void 0 : response.data,
            });
        });
        // Handle response
    }
    catch (error) {
        return res.status(404).json({
            message: "Airtime Purchased",
            data: error,
        });
    }
});
exports.initiateBillPaymentForAirTime = initiateBillPaymentForAirTime;
// using flutterwave API: Bill Payment
const initiateBillPaymentForData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        const { userID } = req.params;
        const user = yield userModel_1.default.findById(userID);
        const code = crypto_1.default.randomBytes(6).toString("hex");
        const data = {
            country: "NG",
            customer_id: `0${user === null || user === void 0 ? void 0 : user.accountNumber}`,
            amount,
            recurrence: "ONCE",
            type: "DATA", // Type of bill (e.g., AIRTIME, DATA, DSTV, etc.)
            reference: `${(0, moment_1.default)(Date.now()).format("lll")}-${code}`, // Unique transaction reference
        };
        yield axios_1.default
            .post("https://api.flutterwave.com/v3/bills", data, {
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
            return res.status(201).json({
                message: "Airtime Purchased",
                data: response === null || response === void 0 ? void 0 : response.data,
            });
        });
        // Handle response
    }
    catch (error) {
        return res.status(404).json({
            message: "Airtime Purchased",
            data: error,
        });
    }
});
exports.initiateBillPaymentForData = initiateBillPaymentForData;
