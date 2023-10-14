## Run the code in the the local computer
### 1. download the code folder called "demo-app" 
### 2. enter the folder and then run `npm install` to install dependencies
### 3. go to your aws account's `command line or programmatic access` to copy your `AWS Access Key ID, AWS Secret Access Key, and AWS Session Token` to  `.env` file
### 4. replace "your-key" in "index.ejs" line 68 with your Google Api key
### 5 run `npm start`

## Deploy application to an EC2 instance via Docker container
### 1. login to your AWS account and use SSH client to enter your EC2 instance
### 2. enter the folder called "cab432assignment1"
### 3. run `docker build -t demo-app .` to build an image from a `Dockerfile`which is in the root folder
### 4. run `docker run -p 8000:3000 -d demo-app` to create and run a new container from an image
### 5. go to your AWS EC2 instance and copy the `Public IPv4 address` or `Public IPv4 DNS`
### 6. paste the following ip address into your browser `Public IPv4 address:8000` or `Public IPv4 DNS:8000` to open the application website