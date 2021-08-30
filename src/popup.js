function getNodes() {
    json = localStorage.getItem('nodes') || '[]';
    return JSON.parse(json);
}

function setNodes(list) {
    list.sort(function (a, b) {
        if (a.latency === -1)
            return -114514;
        return a.latency - b.latency;
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
}

function tmpl(id, context) {
    var tmpl = $('#' + id).html()
    for (var v in context) {
        var pattern = '{{' + v + '}}';
        while (tmpl.match(new RegExp(pattern))) {
            tmpl = tmpl.replace(pattern, context[v]);
        }
    }
    return $(tmpl);
}

function addToContainer(info, latencyThreshold, maxHeight) {
    var $row = tmpl('row_template', {
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

        storageUpdate();
    });
    $row.find('.btn-delete').on('click', function (e) {
        var nodes = getNodes();
        var target = -1;
        nodes.forEach(function (item, index, array) {
            if (item.url === info.url) {
                target = index;
            }
        });
        nodes.splice(target, 1);
        setNodes(nodes);
        if ($row.find('.radio-select').is(':checked'))
            setSelectedNode(null);

        storageUpdate();
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
    var nodes = getNodes();
    var $tbody = $('#node-container');
    $tbody.html('');

    var latencyThreshold = ((nodes[0].latency + maxLatency(nodes)) / 2) * 0.75;
    var heightThreshold = maxHeight(nodes);
    for (var i = 0; i < nodes.length; i++) {
        addToContainer(nodes[i], latencyThreshold, heightThreshold);
    }
}

function addNode() {
    var node = $("#text-add-net").val();
    if (node === "")
        return;
    var nodes = getNodes();
    nodes.push({
        url: node,
        latency: -1,
        height: -1
    });
    setNodes(nodes);
    $("#text-add-net").val("");
}

function loadInitialNodes() {
    var nodes = getNodes();
    nodes.push({url: "https://rpc-mainnet.matic.network", latency: -1, height: -1});
    nodes.push({url: "https://matic-mainnet.chainstacklabs.com", latency: -1, height: -1});
    nodes.push({url: "https://rpc-mainnet.maticvigil.com", latency: -1, height: -1});
    nodes.push({url: "https://rpc-mainnet.matic.quiknode.pro", latency: -1, height: -1});
    nodes.push({url: "https://matic-mainnet-full-rpc.bwarelabs.com", latency: -1, height: -1});
    nodes.push({url: "https://matic-mainnet-archive-rpc.bwarelabs.com", latency: -1, height: -1});
    nodes.push({url: "https://matic.mytokenpocket.vip", latency: -1, height: -1});

    setNodes(nodes);
    setSelectedNode("https://matic-mainnet.chainstacklabs.com");
}

function refreshNode() {
    // {"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}
    // {"jsonrpc":"2.0","id":1,"result":"0x11ae026"}

    var nodes = getNodes();
    nodes.forEach(function (item, index, array) {
        var time = Date.now();
        $.ajax({
            url: item.url,
            timeout: 2000,
            method: "POST",
            contentType: "application/json",
            data: '{"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}',
            success: function (result) {
                var used = Date.now() - time;
                if (result.result) {
                    item.latency = used;
                    item.height = parseInt(result.result);

                    setNodes(nodes);
                    storageUpdate();
                } else {
                    item.latency = -1;
                    item.height = -1;

                    setNodes(nodes);
                    storageUpdate();
                }
            },
            error: function () {
                item.latency = -1;
                item.height = -1;

                setNodes(nodes);
                storageUpdate();
            }
        });
    });
}

function useFastest() {
    var nodes = getNodes();
    if (nodes.length === 0)
        setSelectedNode(null);
    else
        setSelectedNode(nodes[0].url);

    storageUpdate();
}

function disableBoost() {
    setSelectedNode(null);
    storageUpdate();
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
