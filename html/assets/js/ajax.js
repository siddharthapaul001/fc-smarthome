const snackbar = document.getElementById('snackbar'),
    snackbarMsg = document.getElementById('snackbar-msg'); var requestedSnackbar = false;

function showSnackbar(msg) {
    //Dont need to update msg for concurrent messages
    closeModal();
    if (!requestedSnackbar) {
        requestAnimationFrame(() => {
            snackbarMsg.innerHTML = msg;
            snackbar.classList.remove('snackbar-show');
            requestAnimationFrame(() => {
                requestedSnackbar = false;
                snackbar.classList.add('snackbar-show');
            })
        });
        requestedSnackbar = true;
    }
}

function sendRequest(method, url, cb, data) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 200) {
            cb(JSON.parse(xhr.responseText));
        }

        if (this.readyState == 4 && this.status == 401) {
            window.location.reload();
        }

        if (this.readyState == 4 && this.status == 403) {
            let msgs = JSON.parse(xhr.responseText)['msg'].join(' ');
            showSnackbar(msgs);
        }
    };
    xhr.onerror = function () {
        //show snackbar message network error
        showSnackbar('Network error. Please check your internet connection');
    }
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data ? JSON.stringify(data) : undefined);
}