
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
        results[body.id].cb(body.data);
        delete results[body.id]; // Clean up after callback is done
    }
});

function takeScreenshot(): Promise<string> {
    return new Promise((resolve) => {
        const id = registerCorrelation(resolve);
        SendNuiMessage(JSON.stringify({ type: 'screenshot', id }));
    });
}

// Example usage:
// takeScreenshot().then((data) => console.log('Screenshot data:', data));
