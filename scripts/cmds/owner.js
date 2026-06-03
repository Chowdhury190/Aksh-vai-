const fs = require("fs-extra");
const request = require("request");
const path = require("path");
const { utils } = global;

module.exports = {
  config: {
    name: "owner",
    version: "2.0",
    author: "Hridoy",
    role: 0,
    shortDescription: "Owner information with animation",
    category: "Utility",
    guide: { en: "owner" }
  },

  onStart: async function ({ api, event }) {

    // ===== LOADING ANIMATION =====
    const loadingStages = [
    ];

    const loadingMsg = await api.sendMessage(loadingStages[0], event.threadID);

    for (let i = 1; i < loadingStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      api.editMessage(loadingStages[i], loadingMsg.messageID);
    }

    setTimeout(() => {
      api.unsendMessage(loadingMsg.messageID);
    }, 900);

    // ===== TIME & BOT STATS =====
    const ping = Date.now() - event.timestamp;

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const totalThreads = global.GoatBot?.allThreadID?.length || 0;
    const totalUsers = global.GoatBot?.users ? Object.keys(global.GoatBot.users).length : 0;

    const BOTNAME = global.GoatBot.config.nickNameBot || "KakashiBot";
    const BOTPREFIX = global.GoatBot.config.prefix;
    const GROUPPREFIX = utils.getPrefix(event.threadID);
    const totalCommands = global.GoatBot.commands.size;

    // ===== OWNER PANEL =====
    const ownerText =
`╭━━━━━━━━━━━━━━━━━━╮
        🤖 BOT SYSTEM
╰━━━━━━━━━━━━━━━━━━╯
➤ Bot Name      : ${BOTNAME}
➤ Global Prefix : ${BOTPREFIX}
➤ Group Prefix  : ${GROUPPREFIX}
➤ Total Modules : ${totalCommands}
➤ Bot Ping      : ${ping} ms ⚡

╭━━━━━━━━━━━━━━━━━━╮
        👑 OWNER INFO
╰━━━━━━━━━━━━━━━━━━╯
➤ Name        : Kakashi Hatake
➤ Role        : Bot Developer
➤ Facebook    : facebook.com/100061935903355
➤ Messenger   : m.me/100061935903355
➤ WhatsApp    : wa.me/+8801744XXXXXX

╭━━━━━━━━━━━━━━━━━━╮
        📊 BOT ACTIVITY
╰━━━━━━━━━━━━━━━━━━╯
➤ Uptime       : ${hours}h ${minutes}m ${seconds}s
➤ Total Groups : ${totalThreads}
➤ Total Users  : ${totalUsers}

━━━━━━━━━━━━━━━━━━
⚡ Powered By Kakashi
━━━━━━━━━━━━━━━━━━`;

    // ===== IMAGE =====
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imgPath = path.join(cacheDir, "owner.jpg");
    const imgLink = "https://i.imgur.com/oEh5VEx.jpeg";

    const send = () => {
      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath)
      );
    };

    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send);
  }
};