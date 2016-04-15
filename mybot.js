if (!process.env.page_token) {
    console.log('Error: Specify page_token in environment');
    process.exit(1);
}

if (!process.env.verify_token) {
    console.log('Error: Specify verify_token in environment');
    process.exit(1);
}


var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.facebookbot({
    debug: true,
    access_token: process.env.page_token,
    verify_token: process.env.verify_token,
});

var bot = controller.spawn({
});

controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('ONLINE!');
    });
});

controller.hears(['hello'], 'message_received', function(bot, message) {


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello, friend!');
        }
    });
});

controller.hears(['I love you', 'i love you'], 'message_received', function(bot, message) {


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'I love you, too, ' + user.name + ' <3');
        } else {
            bot.reply(message, 'I don\'t know you well enough to love you.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'message_received', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['i ship (.*) and (.*)'], 'message_received', function(bot, message) {
    var first = message.match[1]
    var second = message.match[2]
    var shipName = first.substring(0, Math.ceil(first.length / 2)) + second.substring(second.length / 2, second.length)

    controller.storage.users.get(message.user, function(err, user) {
        bot.reply(message, '#' + shipName);
    });
});


