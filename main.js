const filename = process.argv[2];
const serverURL = process.argv[5] === "undefined" ? process.argv[5] : "localhost:5984";
const tablename = process.argv[3];
const credentials = process.argv[4];


const fs = require('fs');
const fetch = require('node-fetch');
if (tablename === 'undefined') {
    console.log("Usage: node main.js user:pass tablename PathTOJSON credentials serverURL:port")
    return;
}

console.log("Testing Database " + serverURL + "->" + tablename);
fetch("http://" + credentials + "@" + serverURL + "/_all_dbs").then(async response => check(await response.json()));

async function check(response) {
    if (response.includes(tablename)) {
        console.log("table already there");
    } else {
        const response = await fetch("http://" + credentials + "@" + serverURL + "/" + tablename, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json' // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: ""
        });
        if ((await response.json()).ok != true) {
            console.warn(await response.json());
            return;
        }
    }
    await upload();
}

async function upload() {
    if (fs.existsSync(filename)) {
        const obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
        for (const key in obj) {
            if (key % 10 == 0) {
                console.log(((Math.floor(key / obj.length * 1000) / 10).toString() + "%"));
            }
            if (Object.hasOwnProperty.call(obj, key)) {
                const element = obj[key];
                const response = await fetch("http://" + credentials + "@" + serverURL + "/" + tablename, {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: {
                        'Content-Type': 'application/json' // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    redirect: 'follow', // manual, *follow, error
                    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                    body: JSON.stringify(element) // body data type must match "Content-Type" header);
                });
                if ((await response.json()).ok != true) console.warn(await response.json());
            }
        }
    } else {
        console.warn("File does not exists!")
    }
}

return 0;