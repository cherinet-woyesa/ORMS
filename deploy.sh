#!/bin/bash

# ORMS Build and Deployment Scripts

# Build Admin Panel
build-admin() {
    echo "Building Admin Panel..."
    cd admin-panel
    npm install
    npm run build
    echo "Admin Panel built successfully!"
}

# Build Mobile App
build-mobile() {
    echo "Building Mobile App..."
    cd ogaden_mobile
    flutter pub get
    flutter build apk --release
    echo "Mobile App built successfully!"
}

# Deploy to Firebase
deploy-firebase() {
    echo "Deploying to Firebase..."
    cd functions
    npm install
    firebase deploy --only functions
    firebase deploy --only hosting
    echo "Deployed successfully!"
}

# Full deployment
deploy-all() {
    build-admin
    deploy-firebase
}

# Run development
dev-admin() {
    cd admin-panel
    npm run dev
}

dev-mobile() {
    cd ogaden_mobile
    flutter run
}

# Run specific command
case "$1" in
    build-admin)
        build-admin
        ;;
    build-mobile)
        build-mobile
        ;;
    deploy)
        deploy-firebase
        ;;
    deploy-all)
        deploy-all
        ;;
    dev-admin)
        dev-admin
        ;;
    dev-mobile)
        dev-mobile
        ;;
    *)
        echo "Usage: ./deploy.sh {build-admin|build-mobile|deploy|deploy-all|dev-admin|dev-mobile}"
        ;;
esac
