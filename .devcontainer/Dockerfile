FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        build-essential \
        curl \
        wget \
        git \
        unzip \
        openjdk-17-jdk \
        android-tools-adb \
        android-tools-fastboot \
        python3-pip \
        python3-venv \
        nodejs \
        npm \
        watchman \
    && apt-get autoremove -y && apt-get clean -y

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/cmdline-tools/latest/bin

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && cd ${ANDROID_HOME}/cmdline-tools \
    && wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip \
    && unzip commandlinetools-linux-9477386_latest.zip \
    && mv cmdline-tools latest \
    && rm commandlinetools-linux-9477386_latest.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Install Android SDK components
RUN sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# Install React Native CLI and Expo CLI
RUN npm install -g @react-native-community/cli expo-cli @expo/cli

# Install Railway CLI
RUN npm install -g @railway/cli

# Install Python packages globally
RUN pip3 install --upgrade pip setuptools wheel

# Create workspace directory
RUN mkdir -p /workspace
WORKDIR /workspace

# Set permissions for vscode user
RUN chown -R vscode:vscode /workspace ${ANDROID_HOME}
USER vscode
