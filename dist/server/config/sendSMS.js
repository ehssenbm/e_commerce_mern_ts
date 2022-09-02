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
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsVerify = exports.smsOTP = exports.sendSms = void 0;
const twilio_1 = require("twilio");
const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const from = `${process.env.TWILIO_PHONE_NUMBER}`;
const serviceID = `${process.env.TWILIO_SERVICE_ID}`;
const client = new twilio_1.Twilio(accountSid, authToken);
const sendSms = (to, body, txt) => {
    try {
        client.messages
            .create({
            body: `BlogDev ${txt} - ${body}`,
            from,
            to
        })
            .then(message => console.log(message.sid));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendSms = sendSms;
const smsOTP = (to, channel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield client
            .verify
            .services(serviceID)
            .verifications
            .create({
            to,
            channel
        });
        return data;
    }
    catch (err) {
        console.log(err);
    }
});
exports.smsOTP = smsOTP;
const smsVerify = (to, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield client
            .verify
            .services(serviceID)
            .verificationChecks
            .create({
            to,
            code
        });
        return data;
    }
    catch (err) {
        console.log(err);
    }
});
exports.smsVerify = smsVerify;
//# sourceMappingURL=sendSMS.js.map