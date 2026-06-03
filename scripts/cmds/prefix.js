const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const lock = new Map();

module.exports = {
  config: {
    name: "prefix",
    version: "25.0",
    author: "Hridoy",
    description: "Ultra Stable Prefix System (No Duplicate Final Fix)",
    category: "Utility",
    usePrefix: false
  },

  // ================= MAIN =================
  onStart: async function ({ message, event, api, args }) {

    const prefixFile = path.join(__dirname, "prefixData.json");

    if (!fs.existsSync(prefixFile)) {
      fs.writeFileSync(prefixFile, JSON.stringify({}, null, 2));
    }

    const read = () => JSON.parse(fs.readFileSync(prefixFile));
    const save = (d) => fs.writeFileSync(prefixFile, JSON.stringify(d, null, 2));

    const getPrefix = (tid) =>
      read()[tid] || global.GoatBot.config.prefix || "/";

    const setPrefix = (tid, val) => {
      const data = read();
      data[tid] = val;
      save(data);
    };

    const botPrefix = global.GoatBot.config.prefix || "/";
    const groupPrefix = getPrefix(event.threadID);

    // ================= UID ADMIN =================
    const ADMIN_UIDS = ["61589020949344"];
    const isAdmin = ADMIN_UIDS.includes(String(event.senderID));

    // ================= PREFIX SET =================
    if (args[0] === "set") {

      if (!isAdmin) {
        return message.reply("❌ Only admin can change prefix.");
      }

      const newPrefix = args[1];

      if (!newPrefix) {
        return message.reply("❌ Usage: prefix set !");
      }

      setPrefix(event.threadID, newPrefix);

      return message.reply(`✅ Prefix changed to: ${newPrefix}`);
    }

    // ================= GIF =================
    const gifs = [
      "https://i.imgur.com/zex8uo7.gif",
      "https://i.imgur.com/4ki8eBI.gif",
      "https://i.imgur.com/AMKQCJc.gif"
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, path.basename(gif));

    if (!fs.existsSync(filePath)) {
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        https.get(gif, (res) => {
          if (res.statusCode !== 200) return reject("GIF error");
          res.pipe(file);
          file.on("finish", () => file.close(resolve));
        }).on("error", reject);
      });
    }

    const text = `╔════ PREFIX INFO ════╗
🕒 Ping: ${Date.now() - (event.timestamp || Date.now())}ms
📅 Day: ${new Date().toLocaleDateString()}
🤖 Bot: ${global.GoatBot.config.nickNameBot || "Bot"}
🔹 Bot Prefix: ${botPrefix}
💬 Group Prefix: ${groupPrefix}
╚════════════════╝`;

    return message.reply({
      body: text,
      attachment: fs.createReadStream(filePath)
    });
  },

  // ================= CHAT (FINAL NO DUPLICATE FIX) =================
  onChat: async function ({ event, message, api }) {

    if (!event.body) return;

    const body = event.body.trim();

    const prefixFile = path.join(__dirname, "prefixData.json");

    let prefix = global.GoatBot.config.prefix || "/";

    if (fs.existsSync(prefixFile)) {
      const data = JSON.parse(fs.readFileSync(prefixFile));
      prefix = data[event.threadID] || prefix;
    }

    // ================= HARD GLOBAL MESSAGE LOCK =================
    const globalKey = event.messageID;
    if (global._prefix_guard?.has(globalKey)) return;

    global._prefix_guard = global._prefix_guard || new Set();
    global._prefix_guard.add(globalKey);
    setTimeout(() => global._prefix_guard.delete(globalKey), 2500);

    // ================= USER LOCK =================
    const key = `${event.threadID}_${event.senderID}`;
    if (lock.has(key)) return;

    lock.set(key, true);
    setTimeout(() => lock.delete(key), 1500);

    // ================= "/" ONLY =================
    if (body === "/") {
      return message.reply("It's just my prefix");
    }

    // ================= PREFIX TRIGGER =================
    if (body === prefix) {
      return this.onStart({
        message,
        event,
        api,
        args: []
      });
    }

    // ================= PREFIX COMMAND =================
    if (body.toLowerCase().startsWith("prefix")) {
      const args = body.split(" ");
      return this.onStart({
        message,
        event,
        api,
        args
      });
    }
  }
};
