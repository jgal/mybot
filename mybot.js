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

controller.hears(['do you love me?', 'i love you'], 'message_received', function(bot, message) {


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'I love you, ' + user.name + ' <3');
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

controller.hears(['what\'s your name?'], 'message_received', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
        if (!err) {
            controller.storage.users.get(message.user, function(err, user) {
                if (!user) {
                    user = {
                        id: message.user,
                    };
                }
                if (user && user.name) {
                    convo.say("My name is Jankabot, " + user.name + "!");
                } else {
                    convo.say("My name is Jankabot");
                    convo.ask('What\'s your name?', [
                        {
                            pattern: 'janka',
                            callback: function(response, convo) {
                                // since no further messages are queued after this,
                                // the conversation will end naturally with status == 'completed'
                                convo.say("you da best babe");
                                user.name = response.text
                                convo.next();
                            }
    
                        },
                        {
                            pattern: 'christina',
                            callback: function(response, convo) {
                                user.name = response.text
                                convo.ask("omg will you marry me?", [
                                    {
                                        pattern: 'yes',
                                        callback: function(response, convo) {
                                            convo.say("OMG YAY");
                                            convo.next();
                                        }
                                    },
                                    {
                                        pattern: 'no',
                                        callback: function(response, convo) {
                                            convo.say("cries forever");
                                            convo.next();
                                        }
                                    },
                                    {
                                        default: true,
                                        callback: function(response, convo) {
                                            convo.next();
                                        }
                                    }
                                ]);
                                
                                convo.next();
                            }
                        },
                        {
                            default: true,
                            callback: function(response, convo) {
                                convo.say("nice to meet you, " + response.text);
                                user.name = response.text
                                convo.next();
                            }
                        }
                    ]);
                    controller.storage.users.save(user, function(err, id) {});
                } 
            });
        }
    });
});

controller.hears(['thanks', 'thank you', 'thx'], 'message_received', function(bot, message) {
    bot.reply(message, 'you\'re welcome');
});

controller.hears(['what\'s up'], message_received, function(bot, message) {
    var responses = ['not much', 'the sky', 'today\'s been really busy', 'space']

    bot.startConversation(message, function(err, convo) {
        if(!err) {
            convo.say(responses[Math.floor((Math.random() * responses.length) + 1)]);
            convo.ask('what\'s up with you?', [
                
                    pattern: ['not much', 'nm'],
                    callback: function(response, convo) {
                        convo.say("boring");
                        convo.next();
                    },
                    {
                        default: true,
                        callback: function(response, convo) {
                            convo.say("cool cool");
                            convo.next();
                        }
                    }

                
            ]);

        }
    });
});

controller.hears(['how are you', 'how\'s it going'], message_received, function(bot, message) {
    var responses = ['pretty good', 'good', 'bad', 'not good', 'great', 'great!', 'fantastic', 
    'fantastic!', 'amazing', 'amazing!', 'sigh'];

    bot.startConversation(message, function(err, convo) {
        if(!err) {
            convo.say(responses[Math.floor((Math.random() * responses.length) + 1)]);
            convo.ask('how are you?', [
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.say("<3");
                        convo.next();
                    }
                }
            ]);

        }
    });
});

controller.on('message_received', function(bot, message) {
    bot.reply(message, 'lol');
    return false;
});


