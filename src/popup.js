const DEFAULT_NODES = [
    "https://rpc-mainnet.matic.network",
    "https://matic-mainnet.chainstacklabs.com",
    "https://rpc-mainnet.maticvigil.com",
    "https://rpc-mainnet.matic.quiknode.pro",
    "https://matic-mainnet-full-rpc.bwarelabs.com",
    "https://matic-mainnet-archive-rpc.bwarelabs.com",
    "https://matic.mytokenpocket.vip",
    "https://polygon-rpc.com",
    "https://nd-011-002-446.p2pify.com/97b6690de8c3b5b8aabbe90c1dd9c15a",
];

function getNodes() {
    json = localStorage.getItem('nodes') || '[]';
    return JSON.parse(json);
}

function setNodes(list) {
    list.sort(function (a, b) {
        if (a.latency === -1) {
            if (b.latency === -1)
                return 0;
            return 1;
        }

        if (a.latency < b.latency)
            return -1;
        if (a.latency > b.latency)
            return 1;
        return 0;
    });
    localStorage.setItem('nodes', JSON.stringify(list));
    storageUpdate();
}

function getSelectedNode() {
    return localStorage.getItem('nodes-selected') || null;
}

function setSelectedNode(node) {
    if (node === null)
        localStorage.removeItem('nodes-selected');
    else
        localStorage.setItem('nodes-selected', node);

    storageUpdate();
}

function tmpl(id, context) {
    let tmpl = $('#' + id).html();
    for (let v in context) {
        const pattern = '{{' + v + '}}';
        while (tmpl.match(new RegExp(pattern))) {
            tmpl = tmpl.replace(pattern, context[v]);
        }
    }
    return $(tmpl);
}

function addToContainer(info, latencyThreshold, maxHeight) {
    const $row = tmpl('row_template', {
        'node': info.url,
        'latency': info.latency,
        'color': info.latency === -1 ? "danger" : info.latency < latencyThreshold ? "success" : "warning",
        'height': info.height,
        'height_color': info.height < maxHeight ? "danger" : "muted"
    });

    if (getSelectedNode() === info.url) {
        $row.find('.radio-select').prop('checked', true);
    }

    $row.find('.radio-select').on('click', function (e) {
        setSelectedNode(info.url);
    });
    $row.find('.btn-delete').on('click', function (e) {
        const nodes = getNodes();
        let target = -1;
        nodes.forEach(function (item, index, array) {
            if (item.url === info.url) {
                target = index;
            }
        });
        nodes.splice(target, 1);
        setNodes(nodes);
        if ($row.find('.radio-select').is(':checked'))
            setSelectedNode(null);
    });
    $row.appendTo($('#node-container'));
}

function maxLatency(nodes) {
    let latency = 0;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].latency > latency)
            latency = nodes[i].latency;
    }
    return latency;
}

function maxHeight(nodes) {
    let height = 0;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].height > height)
            height = nodes[i].height;
    }
    return height;
}

function storageUpdate() {
    const nodes = getNodes();
    const $tbody = $('#node-container');
    $tbody.html('');

    const latencyThreshold = ((nodes[0].latency + maxLatency(nodes)) / 2) * 0.75;
    const heightThreshold = maxHeight(nodes);
    for (let i = 0; i < nodes.length; i++) {
        addToContainer(nodes[i], latencyThreshold, heightThreshold);
    }
}

function addNode() {
    const node = $("#text-add-net").val();
    if (node === "")
        return;
    const nodes = getNodes();
    nodes.push({
        url: node,
        latency: -1,
        height: -1
    });
    setNodes(nodes);
    $("#text-add-net").val("");
}

function loadInitialNodes() {
    const nodes = getNodes();

    DEFAULT_NODES.forEach(function (item) {
        nodes.push({url: item, latency: -1, height: -1});
    });

    setNodes(nodes);
    setSelectedNode("https://matic-mainnet.chainstacklabs.com");
}

function refreshNode() {
    // {"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}
    // {"jsonrpc":"2.0","id":1,"result":"0x11ae026"}
    const selected = getSelectedNode();
    setSelectedNode(null);
    $('#btn-refresh').prop("disabled", true);
    const nodes = getNodes();
    const requests = [];
    nodes.forEach(function (item, index, array) {
        const time = Date.now();
        requests.push($.ajax({
            url: item.url,
            timeout: 2000,
            method: "POST",
            contentType: "application/json",
            data: '{"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}',
            success: function (result) {
                const used = Date.now() - time;
                if (result.result) {
                    item.latency = used;
                    item.height = parseInt(result.result);
                } else {
                    item.latency = -1;
                    item.height = -1;
                }
            },
            error: function () {
                item.latency = -1;
                item.height = -1;
            }
        }));
    });

    const done = function () {
        setNodes(nodes);
        setSelectedNode(selected);
        $('#btn-refresh').prop("disabled", false);
    };
    $.when.apply($, requests).then(done, done);
}

function useFastest() {
    const nodes = getNodes();
    if (nodes.length === 0)
        setSelectedNode(null);
    else
        setSelectedNode(nodes[0].url);
}

function disableBoost() {
    setSelectedNode(null);
}

$(document).ready(function () {
    if (getNodes().length === 0)
        loadInitialNodes();

    $('#btn-add-net').on('click', addNode);
    $('#btn-refresh').on('click', refreshNode);
    $('#btn-use-fastest').on('click', useFastest);
    $('#btn-disable').on('click', disableBoost);
    storageUpdate();
});
