
log("Ask before download, options page start.");

function sendForgetRule(e) {
    let node = e.target;
    log("sendForgetRule ", node);
    let hostname = node.ruleInfo["hostname"];
    let rule = node.ruleInfo["rule"];
    let hostnameCol = node.ruleInfo["hostnameCol"];

    //userRuleListRemove(hostname, rule);
    browser.runtime.sendMessage({
        action: "forgetRule",
        hostname: hostname,
        rule: rule,
    }).then(log, log);
    let row = node.parentNode.parentNode;
    hostnameCol.rowSpan--;
    if (hostnameCol.parentNode ==  row && hostnameCol.rowSpan > 0) {
        let nextRow = row.nextSibling;
        nextRow.insertBefore(hostnameCol, nextRow.firstChild);
    }
    row.remove();
}

function showUserRuleList() {
    doc.querySelector("#remember-list").remove();
    let tbody = doc.createElement("TBODY");
    //tbody.innerHTML = '';
    let rowIdx = 0;
    let row = tbody.insertRow(rowIdx++);
    let hostIdx = 0;
    for (let hostname of Object.keys(userRuleList)) {
        hostIdx++;
        let ruleList = userRuleList[hostname];
        let colIdx = 0;
        let col = row.insertCell(colIdx++);
        log("hostIdx ", hostIdx, (hostIdx & 0x1));
        col.appendChild(doc.createTextNode(hostname));
        col.rowSpan = ruleList.length;
        let hostnameCol = col;
        //col = row.insertCell(colIdx++);
        //let div = doc.createElement("DIV");
        //col.append(div);
        log("\nhostname ", hostname);
        for (let rule of ruleList) {
            if ((hostIdx & 0x1) === 0)
                row.className += " evenHostnameRow"
            log("rule ", rule);
            for (let r0 of ["mime-type", "file-ext", "action"]) {
                let text = rule[r0] || '';
                //log(text)
                col = row.insertCell(colIdx++);
                if (text && r0 === "file-ext") {
                    text = text.replace(/^\\\.|\\b$/g, '')
                }
                if (text && r0 === "action") {
                    col.className += text === "allow" ? "red-text" : "green-text";
                    text = text === "allow" ? "☑" : "☒";
                }
                col.appendChild(doc.createTextNode(text));
            }
            col = row.insertCell(colIdx++);
            let r0 = doc.createElement("A");
            r0.className += "red-text";
            r0.textContent = "🗑";
            r0.href = "javascript:void(0)";
            r0.onclick = sendForgetRule;
            r0.ruleInfo = {};
            r0.ruleInfo["hostname"] = hostname;
            r0.ruleInfo["rule"] = rule;
            r0.ruleInfo["hostnameCol"] = hostnameCol;
            col.appendChild(r0);

            colIdx = 0;
            row = tbody.insertRow(rowIdx++);
        }
    }

    doc.querySelector("#addon-options").appendChild(tbody);
    log("\n");
}

userRuleListLoad(showUserRuleList);
log("Ask before download, options page end.");
