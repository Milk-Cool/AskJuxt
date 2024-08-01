import nodecallspython from "node-calls-python";
import cron from "node-cron";
import { JSDOM } from "jsdom";

const py = nodecallspython;
py.addImportPath("PretendoClients");
const pymodule = py.importSync("./gettoken.py");

let {
    DEVICE_ID,
    SERIAL_NUMBER,
    SYSTEM_VERSION,
    REGION_ID,
    COUNTRY_NAME,
    LANGUAGE,
    USERNAME,
    PASSWORD,
    CERT,

    TEST
} = process.env;
DEVICE_ID = parseInt(DEVICE_ID);
SYSTEM_VERSION = parseInt(SYSTEM_VERSION, 16);
REGION_ID = parseInt(REGION_ID);

const args = [
    DEVICE_ID, SERIAL_NUMBER, SYSTEM_VERSION,
    REGION_ID, COUNTRY_NAME, LANGUAGE,
    USERNAME, PASSWORD, CERT
];

const doit = async () => {
    const fr = await fetch("https://old.reddit.com/r/AskReddit"); // Replace the subreddit name HERE! (but keep the "old." part)
    const tr = await fr.text();
    const { document } = (new JSDOM(tr, { "contentType": "text/html" })).window;
    const text = document.querySelector("#siteTable > *:nth-child(1) .title").textContent.replaceAll(/\s+\(self\.[a-zA-Z0-9\-_]+\)/g, "");
    console.log(text);

    const token = await py.call(pymodule, "token", ...args);
    if(!token) return console.error("oppsie woopsie it crashed!");
    const community = 1572001959412633600;
    const f = await fetch("https://portal.olv.pretendo.cc/posts/new", {
        "method": "POST",
        "headers": {
            "X-Nintendo-ParamPack": btoa("\\language_id\\0\\platform_id\\1\\country_id\\1\\region_id\\1\\"),
            "X-Nintendo-ServiceToken": token,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "ja",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "portal.olv.pretendo.cc",
            "Origin": "https://portal.olv.pretendo.cc",
            "Referer": `https://portal.olv.pretendo.cc/titles/${community}/new?t=${Number(new Date())}`,
            "User-Agent": "Mozilla/5.0 (Nintendo WiiU) AppleWebKit/536.28 (KHTML, like Gecko) NX/3.0.3.12.6 miiverse/3.1.prod.JP"
        },
        "body": `community_id=${community}&feeling_id=1&_screenshot_value=top&screenshot=&_post_type=body&body=${encodeURIComponent(text)}&painting=&message_to_pid=`
    });
    const t = await f.text();
    console.log(f.status, t);
} 

if(TEST)
    doit();
else cron.schedule("0 12 * * *", doit);