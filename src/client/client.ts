
const exp = (<any>global).exports;

RegisterNuiCallbackType('screenshot_created');

class ResultData {
    cb: (data: string) => void;
}

const results: {[id: string]: ResultData} = {};
let correlationId = 0;

function registerCorrelation(cb: (result: string) => void): string {
    const id = (correlationId++).toString();
    results[id] = { cb };
    return id;
}

on('__cfx_nui:screenshot_created', (body: any, cb: (arg: any) => void) => {
    cb(true);

    if (body.id !== undefined && results[body.id]) {
        const screenshotData = results[body.id].cb(body.data);
        delete results[body.id];

        // Send the screenshot to Discord webhook
        sendToDiscordWebhook(screenshotData);
    }
});

function takeScreenshot(): Promise<string> {
    return new Promise((resolve) => {
        const id = registerCorrelation(resolve);
        SendNuiMessage(JSON.stringify({ type: 'screenshot', id }));
    });
}

function sendToDiscordWebhook(screenshotData: string) {
    const request = new XMLHttpRequest();
    request.open("POST", "YOUR_DISCORD_WEBHOOK_URL_HERE");
    request.setRequestHeader('Content-type', 'application/json');

    const params = {
        content: "Screenshot captured",
        embeds: [{
            image: {
                url: `data:image/png;base64,${screenshotData}`
            }
        }]
    };

    request.send(JSON.stringify(params));
}

// Example usage:
// takeScreenshot().then((data) => console.log('Screenshot data:', data));
