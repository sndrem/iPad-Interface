const buttons = Array.from(document.querySelectorAll(".btn"));
const clockStatus = document.querySelector(".clock-status");
const statusMessageElement = document.querySelector(".status");

let dataFetchInterval = null;

const config = {
    DATA_FETCH_RATE: 20000
}

buttons.forEach(function(btn) {
    btn.addEventListener("click", startGettingData);
});
buttons.forEach(function(btn) {
    btn.addEventListener("touchstart", startGettingData)
});

moment.locale("nb");
setInterval(function() {
    clockStatus.innerHTML = moment().format('LLLL');
}, 1000);

function startGettingData() {
    if(dataFetchInterval) {
        console.log("Clearing fetch interval");
        clearInterval(dataFetchInterval);
    }

    dataFetchInterval = buttonClicked(this);
}

function buttonClicked(btn) {
    const from = btn.dataset.from;
    const to = btn.dataset.to;
    const silent = btn.dataset.silent;
    
    const params = {
        from: from,
        to: to,
        silent: silent
    }

    statusMessageElement.innerHTML = `Henter data for Bybanen<br>fra: <span class="destination">${from}</span><br>til: <span class="destination">${to}</span>`;
    getSkyssTimeTable(params);
    return setInterval(function() {
        getSkyssTimeTable(params);
    }, config.DATA_FETCH_RATE);

    
}

function getSkyssTimeTable(params) {
    if(!params || !params.from || !params.to || !params.silent) {
        throw new skyssTimeTableException("The params object needs a field for from, to, and silent");
    }
    var skyssRequest = new XMLHttpRequest();
    skyssRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(this.response);
            statusMessageElement.innerHTML = `Neste avganger<br>fra: <span class="destination">${params.from}</span><br>til: <span class="destination">${params.to}</span>`;
            document.querySelector(".time-table").innerHTML = `<table>
                <thead>
                    <tr><th>Start</th><th>Slutt</th></tr>
                </thead>

                <tbody>

                    ${ data.map(function(d, i) {
                            return `<tr ${i % 2 === 0 ? 'class="even"' : ''}><td>${d.start}</td><td>${d.end}</td></tr>`;
                        }).join("")}
                </tbody>
                </table>`;

        }
    };
    skyssRequest.open("POST", "/skyss", true);
    skyssRequest.setRequestHeader("Content-type", "application/json");
    skyssRequest.send(JSON.stringify(params));

}

function skyssTimeTableException(message) {
    this.toString = function() {
        return message;
    }
}
