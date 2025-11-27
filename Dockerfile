FROM gcc:latest

# Install time command for accurate memory/time measurement
RUN apt-get update && apt-get install -y time && rm -rf /var/lib/apt/lists/*

WORKDIR /run
# Image used only for compiling/running transient C++ code.
