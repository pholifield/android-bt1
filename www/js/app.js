// (c) 2015 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global ble, statusDiv, beatsPerMinute */
/* jshint browser: true , devel: true*/

// See BLE health thermometer specification
var healthThermometer = {
    service: '1809',
    measurement: '2a1c'
};

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.scan();
    },
    scan: function() {
        app.status("Scanning for Health Thermometer <br/>");

        var foundDevice = false;

        function onScan(peripheral) {
            // this is demo code, assume there is only one Health Thermometer
            console.log("Found " + JSON.stringify(peripheral));
            foundDevice = true;
            $("p").append(peripheral.name + " " + peripheral.id + "<br/>");

            ble.connect(peripheral.id, app.onConnect, app.onDisconnect);
        }

        function scanFailure(reason) {
            alert("BLE Scan Failed");
        }
        
        ble.scan([healthThermometer.service], 5, onScan, scanFailure);     

        setTimeout(function() {
            if (!foundDevice) {
                app.status("Did not find a Health Thermometer");
            }
        }, 5000);
    },
    onConnect: function(peripheral) {
        app.status("Connected to " + peripheral.id);
        ble.startNotification(peripheral.id, healthThermometer.service, healthThermometer.measurement, app.onData, app.onError);
        // Function `startNotification` registers a callback that is called *every time* the value of a characteristic changes. 
        // This method handles both `notifications` and `indications`. The success callback is called multiple times.
        //  Raw data is passed from native code to the success callback as an [ArrayBuffer](#typed-arrays).
        //  See [Background Notifications on iOS](#background-notifications-on-ios)
    },
    onDisconnect: function(reason) {
        alert("Disconnected " + reason);
        // currentTemp.innerHTML = "...";
        currentTemp.innerHTML = data[1] + 256*data[2];
        app.status("Disconnected");
    },
    onData: function(buffer) {
        // assuming heart rate measurement is Uint8 format, real code should check the flags
        // See the characteristic specs http://goo.gl/N7S5ZS
        var  formData = {temperature: reading};  //Name value Pair
        var data = new Uint8Array(buffer);
        var reading = data[1] + 256*data[2];
        currentTemp.innerHTML = reading;
        var  formData = {temperature: reading};  //Name value Pair to POST
        $.ajax({
        type: 'POST',
        data: formData,
        crossDomain: true,
        cache: false,
        url: 'http://192.168.1.71:8080/phil/pollypost.php',
        success: function(data){
            console.log(data);
            alert('Your comment was successfully added: ' + data);
        },
        error: function(){
            console.log(data);
            alert('There was an error adding your comment');
        }
        });
    },
    onError: function(reason) {
        alert("There was an error " + reason);
    },
    status: function(message) {
        console.log(message);
        //statusDiv.innerHTML = message;
         $("p").append(message);
    }
};

app.initialize();
