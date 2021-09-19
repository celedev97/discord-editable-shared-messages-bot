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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var _a = require('discord.js'), Client = _a.Client, Collection = _a.Collection, Intents = _a.Intents, PartialUser = _a.PartialUser, PartialMessageReaction = _a.PartialMessageReaction, User = _a.User;
var _b = require('./config.json'), clientId = _b.clientId, guildId = _b.guildId, token = _b.token;
var client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
function manageCommand(interaction) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, tempMessage, bot, editableMessage, reply;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!interaction.isCommand())
                        return [2 /*return*/];
                    _a = interaction.commandName;
                    switch (_a) {
                        case "avatar": return [3 /*break*/, 1];
                        case "editable-message": return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 7];
                case 1: return [4 /*yield*/, interaction.channel.send("avatar:")];
                case 2:
                    tempMessage = _b.sent();
                    bot = tempMessage.author;
                    tempMessage.delete();
                    return [2 /*return*/, interaction.reply(bot.displayAvatarURL({ dynamic: true }))];
                case 3: return [4 /*yield*/, interaction.channel.send("uwu")];
                case 4:
                    editableMessage = _b.sent();
                    return [4 /*yield*/, interaction.reply("Created")];
                case 5:
                    reply = _b.sent();
                    return [4 /*yield*/, interaction.deleteReply()];
                case 6:
                    _b.sent();
                    return [2 /*return*/, reply];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function manageReply(message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (message.type != "REPLY")
                return [2 /*return*/];
            client.channels.fetch(message.reference.channelId).then(function (channel) {
                channel.messages.fetch(message.reference.messageId).then(function (originalMessage) {
                    originalMessage.edit(message.content);
                    message.delete();
                });
            });
            return [2 /*return*/];
        });
    });
}
//#region Events hooking
client.once('ready', function () {
    console.log('Ready!');
});
client.on('interactionCreate', manageCommand);
client.on('messageCreate', manageReply);
client.login(token);
