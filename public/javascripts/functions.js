const buttons = Array.from(document.querySelectorAll(".btn"));
const clockStatus = document.querySelector(".clock-status");
buttons.forEach(function(btn) {
    btn.addEventListener("click", buttonClicked);
});
buttons.forEach(function(btn) {
    btn.addEventListener("touchstart", buttonClicked)
});
console.log(buttons);

moment.locale("nb");
setInterval(function() {
    clockStatus.innerHTML = moment().format('LLLL');
}, 1000);

function buttonClicked() {
    console.log(this.dataset);
    const {from, to, silent} = this.dataset;
    const statusMessageElement = document.querySelector(".status");
    const params = {
        from,
        to,
        silent
    }

    statusMessageElement.innerHTML = `Henter data for Bybanen<br>fra: <span class="destination">${from}</span><br>til: <span class="destination">${to}</span>`;
    
    var skyssRequest = new XMLHttpRequest();
    skyssRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(this.response);
            console.log(data);
            statusMessageElement.innerHTML = `Neste avganger<br>fra: <span class="destination">${from}</span><br>til: <span class="destination">${to}</span>`;
            document.querySelector(".time-table").innerHTML = `<table>
                <thead>
                    <tr><th>Start</th><th>Slutt</th></tr>
                </thead>

                <tbody>

                    ${ data.map(function(d, i) {
                            return `<tr ${i % 2 === 0 ? 'class="even"' : ''}><td>${d.start}</td><td>${d.end}</td></tr>`;
                        }).join("")}
                }
                </tbody>
                </table>`;

        }
    };
    skyssRequest.open("POST", "/skyss", true);
    skyssRequest.setRequestHeader("Content-type", "application/json");
    skyssRequest.send(JSON.stringify(params));
}