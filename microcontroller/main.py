import network
import urequests as requests  
import dht
import time
import machine
import ujson

# Constants
SSID = 'SSID'
PASSWORD = 'PASSWORD'
SERVER_URL = 'http://localhost:3000/api/data'  

# Initialize the DHT sensor
sensor = dht.DHT22(machine.Pin(4))  # Adjust the pin number according to setup

# Connect to Wi-Fi
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    print("Connecting to WiFi...")
    
    while not wlan.isconnected():
        time.sleep(1)
    
    print("Connected to WiFi")
    print(wlan.ifconfig())

# Send temperature data via HTTP POST
def send_data_to_http(temperature):
    try:
        headers = {'Content-Type': 'application/json'}
        
        # Prepare the data to send
        data = {
            "outsideTemp": temperature
        }
        
        # Send HTTP POST request
        response = requests.post(SERVER_URL, json=data, headers=headers)
        
        # Check for success
        if response.status_code == 200:
            print("Data sent successfully")
        else:
            print("Failed to send data:", response.status_code)
        response.close()
    except Exception as e:
        print("Error sending data:", e)

# Main loop
def main():
    connect_wifi()
    
    while True:
        try:
            sensor.measure()
            temperature = sensor.temperature()
            
            print(f"Temperature: {temperature}°C")
            

            send_data_to_http(temperature)
            
   
            time.sleep(600)
        except Exception as e:
            print("Error reading sensor data:", e)
            time.sleep(10)

# Run the main loop
main()
