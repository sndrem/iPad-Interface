const button = document.querySelector("#bigRedButton");

button.addEventListener('click', buttonClicked);

function buttonClicked() {
    var skyssRequest = new XMLHttpRequest();
    skyssRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(this.response));
            const data = JSON.parse(this.response);
            document.querySelector(".big").innerHTML = `Neste bybane går kl. ${data[0].start}`;
        }
    };
    skyssRequest.open("POST", "/skyss", true);
    skyssRequest.send();
}