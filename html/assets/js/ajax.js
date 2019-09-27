function sendRequest(method, url, cb, data){
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           cb(xhr.responseText);
        }
    };
    xhr.open(method, url, true);
    xhr.send(data);
}