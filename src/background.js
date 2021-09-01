chrome.webRequest.onBeforeRequest.addListener(function (details) {
        const selected = localStorage.getItem('nodes-selected') || null;
        if (selected === null)
            return {};

        const nodes = JSON.parse(localStorage.getItem('nodes') || '[]');

        for (let i = 0; i < nodes.length; i++) {
            const current = nodes[i].url;

            if (details.url.startsWith(current)) {
                const redirectUrl = details.url.replace(current, selected);
                if (redirectUrl !== details.url) {
                    return {redirectUrl: redirectUrl};
                }
            }
        }
        return {};
    }, {
        urls: [
            "<all_urls>",
        ],
    }, ["blocking"]
);

chrome.webRequest.onHeadersReceived.addListener(function (info) {
        const selected = localStorage.getItem('nodes-selected') || null;
        if (selected === null)
            return {};
        if (info.url.startsWith(selected)) {
            let resultHeaders = info.responseHeaders.filter(e => e.name.toLowerCase() !== "access-control-allow-origin");
            resultHeaders.push({"name": "Access-Control-Allow-Origin", "value": '*'});
            return {responseHeaders: resultHeaders};
        }
        return {};
    }, {
        urls: [
            "<all_urls>",
        ],
    }, ["blocking", "responseHeaders"]
);