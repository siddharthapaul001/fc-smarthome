const snackbar = document.getElementById('snackbar'),
    snackbarMsg = document.getElementById('snackbar-msg'); var requestedSnackbar = false;

function showSnackbar(msg, isSuccess) {
    //Dont need to update msg for concurrent messages
    closeModal();
    if (!requestedSnackbar) {
        requestAnimationFrame(() => {
            snackbarMsg.innerHTML = msg;
            snackbar.classList.remove('snackbar-show', 'success');
            requestAnimationFrame(() => {
                requestedSnackbar = false;
                snackbar.classList.add('snackbar-show');
                if(isSuccess){
                    snackbar.classList.add('success');
                }
            })
        });
        requestedSnackbar = true;
    }
}

function sendRequest(method, url, cb, data) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 200) {
            let jsonData = JSON.parse(xhr.responseText);
            if (jsonData['code']) {
                if (jsonData['code'] === 200) {
                    cb(jsonData);
                }else if(jsonData['code'] === 403){
                    //forcing to check roomList
                    updateRoomList();
                }
                if (jsonData['msgs']) {
                    showSnackbar(jsonData['msgs'].join(' '), jsonData.code === 200);
                }
            } else {
                cb(jsonData);
            }
        }

        if (this.readyState == 4 && this.status == 401) {
            window.location.reload();
        }

        if (this.readyState == 4 && this.status == 403) {
            let msgs = JSON.parse(xhr.responseText)['msg'].join(' ');
            showSnackbar(msgs);
        }

        // if(showLoading && (this.readyState === 3 || this.readyState === 2)){
        //     //show loading screen
        // }
    };
    xhr.onerror = function () {
        //show snackbar message network error
        showSnackbar('Network error. Please check your internet connection');
    }
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data ? JSON.stringify(data) : undefined);
}