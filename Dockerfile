# Use the official NGINX image as the base image
FROM nginx:alpine

# Copy your HTML file into the container's default web directory
COPY index.html /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80
