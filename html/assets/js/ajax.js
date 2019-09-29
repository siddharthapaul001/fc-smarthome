function sendRequest(method, url, cb, data) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            cb(JSON.parse(xhr.responseText));
        }
        if (this.readyState == 4 && this.status == 401) {
            window.location.reload();
        }
    };
    xhr.onerror = function(){
        //show snackbar message network error
        console.log('error');
    }
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data ? JSON.stringify(data) : undefined);
}