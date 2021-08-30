chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        var selected = localStorage.getItem('nodes-selected') || null;
        if (selected === null)
            return {};

        var nodes = JSON.parse(localStorage.getItem('nodes') || '[]');

        for (var i = 0; i < nodes.length; i++) {
            var current = nodes[i].url;

            if (details.url.startsWith(current)) {
                var redirectUrl = details.url.replace(current, selected);
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

function getHeaderIndex(headerArray, newHeader) {
    for (var i = 0, len = headerArray.length; i < len; i++) {
        var currentHeader = headerArray[i];
        if (currentHeader.hasOwnProperty('name') && currentHeader.name === newHeader.name) {
            return i;
        }
    }
    return -1;
}

function mergeNewHeaders(originalHeaders) {
    var mergedHeaders = originalHeaders.slice();
    var newHeader = {
        name: "Access-Control-Allow-Origin",
        value: "*"
    };
    var index = getHeaderIndex(mergedHeaders, newHeader);

    if (index > -1) {
        mergedHeaders[index] = newHeader;
    } else {
        mergedHeaders.push(newHeader);
    }
    return mergedHeaders;
}

chrome.webRequest.onHeadersReceived.addListener(function (info) {
        var selected = localStorage.getItem('nodes-selected') || null;
        if (selected === null)
            return {};
        if (info.url.startsWith(selected)) {
            return {responseHeaders: mergeNewHeaders(info.responseHeaders)};
        }
        return {};
    }, {
        urls: [
            "<all_urls>",
        ],
    }, ["blocking", "responseHeaders"]
);