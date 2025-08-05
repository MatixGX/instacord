# Instacord Discord BOT
**Make your Discord server into Instagram on Discord! (configurable)**

## Features
* Register a user and create a channel for them
* Follow / unfollow system
* Users can create posts and the bot automatically adds like reaction to them
* You can see your own (and other peoples') profile
* Has a build in help command
* Can give you a list of people you follow
* The bot posts new posts on a "NEW POSTS" channel
* The bot picks random posts every 5 minutes (configurable)
* The bot automatically send top 3 users to a "TOP USERS" channel
* Uses mongoDB as the database

## Requirements
* Node.js
* A Discord bot token
* MongoDB database (local or hosted)

## Use yourself
**YOU NEED TO CREATE THE ROLES AND CHANNELS WITH PERMISSIONS YOURSELF!!!**
Setup your MongoDB.
Clone the repo (or dowload it), intall the dependencies, configure the bot and run it.
```sh
    // once downloaded
    npm install
    // config.json -> more in the next chapter
    node . 
```
Also you need to create the *.env* file.
Template of *.env*:
```
TOKEN=<DISCORD BOT TOKEN>
CLIENTID=<DISCORD BOT CLIENT ID>
MONGO_URL=<MONGODB DATABSE URL>
```


## config.json
You can edit the *config.json* to make the bot work on your server.
**You don't need to replace the message configuration, but the channel config is required to be set for your own server!**



**DISCLAIMER!** This bot in it's current form has a lot of problems. Some of them are:
* A Discord guild can have a maximum of 500 channels, (only 50 per category)
* The bot currently only uses one category for the user accounts
* There some errors that cause the bot to crash