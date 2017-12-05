var buttons = Array.from(document.querySelectorAll(".timeTableBtn"));
var soundBtn = document.getElementById("soundBtnOnOff");
var clockStatus = document.querySelector(".clock-status");
var statusMessageElement = document.querySelector(".status");

var dataFetchInterval = null;

var silentTTS = false;
if(window.localStorage.getItem("sound")) {
    silentTTS = JSON.parse(window.localStorage.getItem("sound"));
}

updateSoundButton(soundBtn);

var config = {
    DATA_FETCH_RATE: 20000
}

buttons.forEach(function(btn) {
    btn.addEventListener("click", startGettingData);
});

buttons.forEach(function(btn) {
    btn.addEventListener("touchstart", startGettingData)
});

soundBtn.addEventListener('click', toggleSound);

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
    var from = btn.dataset.from;
    var to = btn.dataset.to;
    
    var params = {
        from: from,
        to: to,
        silent: silentTTS
    }


    statusMessageElement.innerHTML = `Henter data for Bybanen<br>fra: <span class="destination">${from}</span><br>til: <span class="destination">${to}</span>`;
    getSkyssTimeTable(params);
    return setInterval(function() {
        getSkyssTimeTable(params);
    }, config.DATA_FETCH_RATE);
}

function saveToLocalStorage(key, value) {
    if(!key) {
        throw new Error("Key cannot be empty");
    } else if(!value) {
        throw new Error("Value cannot be empty");
    }

    window.localStorage.setItem(key, value);
}

function toggleSound() {
    saveToLocalStorage("sound", silentTTS.toString());
    updateSoundButton(this);
}

function updateSoundButton(btn) {
    var statusIcon = document.createElement("i");
    statusIcon.classList.add("fa");
    if(silentTTS) {
        statusIcon.classList.add("fa-volume-up", "fa-green");
        statusIcon.classList.remove("fa-volume-off", "fa-red");
        btn.innerHTML = "Lyd på";
        btn.appendChild(statusIcon);
        silentTTS = false;
    } else {
        statusIcon.classList.add("fa-volume-off", "fa-red");
        statusIcon.classList.remove("fa-volume-up", "fa-green");
        btn.innerHTML = "Lyd av";
        btn.appendChild(statusIcon);
        silentTTS = true;
    }
}

function getSkyssTimeTable(params) {
    if(!params || !params.from || !params.to) {
        throw new skyssTimeTableException("The params object needs a field for from, to, and silent");
        return;
    }

    var skyssRequest = new XMLHttpRequest();
    skyssRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.response);
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

function fetchRainData() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function() {
        var data = JSON.parse(this.responseText);
        // console.log(data);
        drawChart(data);
    });
    xhr.open("GET", "/rainData");
    xhr.send();
}

function formatTimeOfDay(rainDate) {
    var date = new Date(rainDate);
    // console.log(date.getHo);
    return [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
}

function drawChart(rainData) {
    var rainData = rainData.product.time;
    google.charts.load('current', {'packages':['bar']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var dataArray = [];
        rainData.forEach((r, i) => {
            dataArray.push([formatTimeOfDay(r.from), parseFloat(r.location.precipitation.value)])
        })
        // console.log("Rain data for google", dataArray);
        console.log(dataArray);
        var data = new google.visualization.DataTable();
        data.addColumn("timeofday", "Tid på dagen");
        data.addColumn("number", "MM/H");

        data.addRows(dataArray);

        console.log(data);

        var options = {
          chart: {
            title: 'Blir det regn neste 1,5 time?',
            subtitle: 'Data fra Yr.no',
          }
        };

        var chart = new google.charts.Bar(document.getElementById('weatherChart'));

        chart.draw(data, google.charts.Bar.convertOptions(options));
      }
}
fetchRainData();
// drawChart();
