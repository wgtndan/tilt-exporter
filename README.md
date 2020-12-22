# Tilt Exporter for Prom Metrics in Node.JS

Captures data from a [TILT Hydrometer](https://tilthydrometer.com/) and serves these on the /metrics end point for scraping.

## Setup
1. Update the Image
    
    ``` 
    apt-get update && apt-get upgrade 
1. Install Node.js using [Node Version Manager](https://github.com/nvm-sh/nvm#install--update-script)
    
    ``` 
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
1. Install Node v9.11.2

    ```
    nvm install 9.11.2
1. Install pre-requisites

    ``` 
    sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev bluez-hcidump git 
1. Clone in too /opt

    ``` 
    cd /opt
    git clone https://github.com/wgtndan/tilt-exporter.git
    ```


## Install files and enable `systemd` service
You can either install all the [required dependencies](license-information-and-module-dependencies) on your own or install all dependencies automatically by calling

        npm install

after you downloaded or cloned all the files from the project's repository into the user `pi`'s home directory (if the user name and user group is different, you need to edit [`tilt-exporter.service`](tilt-exporter.service)).

In order to execute [`app.js`](app.js) automatically after the system is booted, a [`systemd`](https://en.wikipedia.org/wiki/Systemd) service file is provided. If you want to use the service, follow these steps:

1. Copy the `.service` file to the appropriate location:

        sudo cp /opt/tilt-exporter.service /etc/systemd/system

1. Enable the service to systemd:

        sudo systemctl enable tilt-exporter

1. Check the service status to check if it was loaded properly:

        sudo systemctl status tilt-exporter

1. Start the service manually (if you do not want to reboot the system):

        sudo systemctl start tilt-exporter

