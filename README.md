# IoT Pipeline - Barbecue Master

<img width="1469" alt="Screenshot" src="https://github.com/user-attachments/assets/7c98f523-9b62-4383-b19e-6936a685eaa9" />
<img width="1009" alt="Screenshot2" src="https://github.com/user-attachments/assets/8f331ca0-a89c-498e-a375-90206abde66c" />
# 1. introduction to Barbecue Master

## Explanation of Key Components

### Backend
- **`app.js`**: The core Node.js application file that handles backend logic.
- **`package.json`**: Lists the Node.js dependencies and scripts.
- **`database.js`**: Establishes a connection to the SQLite3 database.
- **`routes/dataRoutes.js`**: Contains API logic for managing sensor data.

### Frontend
- **`index.html`**: The main dashboard for displaying system data.
- **`styles.css`**: Custom styles for the dashboard interface.
- **`app.js`**: Handles dynamic updates, such as fetching and displaying temperature data from the past 24 hours.

### Nginx
- **`default.conf`**: Configuration file for setting up Nginx as a reverse proxy or web server. 
  - Includes variations for local testing and Azure virtual machine deployment.

### Deployment
- **`ecosystem.config.js`**: Configuration file for PM2, used for managing and scaling Node.js processes.
- **`start.sh`**: A shell script to automate the startup of services.


# 2. Hardware (censors)

- **Sensors Selection:** The sensors used (inside the meat and in the oven) are calibrated for high-temperature and industrial environments. Most suitable ones are xx.
- **Microcontroller/Device:** Raspberry Pi Pico or a similar IoT device for sensor interfacing.
    
    the Microcontroller will
    
    - Read sensor data.
    - Package the data into JSON.
    - Send the data using HTTP POST to the cloud backend served at Azure.
    
# 3. Backend and Frontend deployment

**Node.js Backend Configuration:**
- Install Node.js 23.x on the Azure VM.
- Develop and configure a REST API to:
    - **Receive Sensor Data:** Use HTTP POST endpoints to capture sensor readings.
    - **Sanitize Data:** Implement validation to prevent malformed inputs.
    - **Log Data:** Write incoming data to logs for debugging and audit purposes.
    - **Write to Database:** Forward data to the Barbecue Master website and use a lightweight database like SQLite for persistence.(or it could be InfluxDB v2.7.10, which is optimized for time-series data. )
- Using WebSocket to provide another way to fetch data from database (aside from HTTP fetch)

**Frontend Development**:
Create a custom website to manage and visualize the sensor data.

**Tech Stack**:
- Python
- JavaScript (including Node.js and frontend-related usage)
- HTML & CSS
- EJS (Embedded JavaScript)
- Mocha & Chai (Testing frameworks)
- NGINX (Web server)
- Express.js (Backend framework for Node.js)
- Azure (Hosting services)

# 4. Cost estimation

### **(Approximation)**

### *Azure VM*:

- Small: $20–$40/month.
      

### *Other Costs*:

- **Sensors and Device:** $50–$300 depending on sensor quality.
- **Web Hosting (via Nginx):** Covered by Azure VM.
- No need to purchase domain name for industrial usage

# **5. Why choose Barbecue Master**

1. **Data-Driven Optimization:**
    - Maintain precise temperature and humidity levels for quality consistency.
    - Analyze historical trends to improve cooking efficiency.
2. **Scalability:**
    - Easily add more sensors or ovens.
3. **Real-Time Monitoring:**
    - Immediate alerts for temperature or humidity deviations.
    - Increased productivity by minimizing manual checks.
4. **Cloud Advantage:**
    - Global access to monitoring dashboard.
    - High reliability with 24/7 service availability.
5. **Cost-Effective:**
    - No recurring fees for external services; fully controlled by you.

# 5. Configuration Set-up
1. pull repository on the Azure Virtual Machine and select the version you want to deploy
[barbecue-master Repository](git@github.com:LycheeeLu/barbecue-master.git)
- install npm packages
- go to barbecue-master/backend and use ```node app.js``` to start the system

2. 24-hour online monitoring
system file in Azure virtual machine needs to be updated to achieve services operating 24/7
- first, go to the file where the etc/systemd/system
- second, create a file barbecue-master.service
- third, copy the following script into service 
```
    [Unit]
    Description=Barbecue-Master.js App
    After=network.target

    [Service]
    ExecStart=/usr/bin/node /var/www/barbecue-master/backend/app.js
    Restart=always
    User=root
    Restart=on-failure

    [Install]
    WantedBy=multi-user.target
```
- fourth, restart the systemctl 
```sudo systemctl daemon-reload```
```sudo systemctl enable barbecue-master.service```


3. nginx server configuration
nginx server file in Azure virtual needs to be updated for actual usages 
- selecting the right redirective file 
- setting up SSL certificates according to the template

```     
        server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/barbecue-master/frontend;
        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location /api/data {
            proxy_pass http://127.0.0.1:3000/api/data;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            add_header Access-Control-Allow-Origin *;

            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
                try_files $uri $uri/ =404;
        }
    }

    server {

    root /var/www/barbecue-master/frontend;
    index index.html index.htm index.nginx-debian.html;
    server_name stinky.northeurope.cloudapp.azure.com; # managed by Certbot

    location / {
            try_files $uri $uri/ =404;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/stinky.northeurope.cloudapp.azure.com/ful>
    ssl_certificate_key /etc/letsencrypt/live/stinky.northeurope.cloudapp.azure.com>
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    }

    server {
    if ($host = stinky.northeurope.cloudapp.azure.com) {
    return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80 ;
    listen [::]:80 ;
    server_name stinky.northeurope.cloudapp.azure.com;
    return 404; # managed by Certbot}
```




