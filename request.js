export function request(params,auth) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', params.url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', auth);
    xhr.send(JSON.stringify({
        ...params.params,
    }));
}