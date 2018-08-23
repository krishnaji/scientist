global.restify = require('restify');
global.builder = require('botbuilder');
global.lodash = require('lodash');
global.promise = require('bluebird');
global.request = require('request-promise');
var os = require('os');
require('dotenv').config()

// Cognitive Service Clients.

const AzureSearchClient = require('./lib/azuresearchclient');
global.attachments = require('./lib/attachments');

// Environment variables
const BOTBUILDER_APP_ID = process.env.BOTBUILDER_APP_ID;
const BOTBUILDER_APP_PASSWORD = process.env.BOTBUILDER_APP_PASSWORD;
const LUIS_MODEL = process.env.LUIS_MODEL;
const AZURE_SEARCH_KEY = process.env.AZURE_SEARCH_KEY

// Check to see if the environment has been set.
if (!(BOTBUILDER_APP_ID &&
    BOTBUILDER_APP_PASSWORD 
)) {
    console.log(`Missing one of BOTBUILDER_APP_ID, BOTBUILDER_APP_PASSWORD` );
    process.exit(1);
}

// Search the web for results.
global.azureSearchClient = new AzureSearchClient({
   azureSearchKey: AZURE_SEARCH_KEY
});

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: BOTBUILDER_APP_ID,
    appPassword: BOTBUILDER_APP_PASSWORD
});


// Listen for messages from users
server.post('/api/messages', connector.listen());

// Create a LUIS recognizer for our bot, to identify intents from
// user text.
const recognizer = new builder.LuisRecognizer(LUIS_MODEL);

// Create our bot to listen in on the chat connector.
global.bot = new builder.UniversalBot(connector, (session) => {
    session.beginDialog('scibot:search')
});

bot.recognizer(recognizer);

bot.use(builder.Middleware.sendTyping());

// Sends a nice greeting on a new message.
bot.on('conversationUpdate', (message) => {
    if (!message.membersAdded) {
        return;
    }

    message.membersAdded.forEach((identity) => {
        if (identity.id !== message.address.bot.id) {
            return;
        }
        bot.send(new builder.Message()
            .address(message.address)
            .text(`👋 Hello! I'm Clinical Trails Scientist Bot 🤖 \
                Ask me about current clinical trials.`
            ));
    });
});

global.cleanQueryString = (query, removePunctuation) => {
    let retQuery = query.toLowerCase();
    if (removePunctuation) {
        retQuery = retQuery.replace(/[^\w\s]|_/g, "");
    }
    retQuery = retQuery.replace(/\s+/g, " ");
    return retQuery.trim();
}

global.azureSearchQuery = async (session, args) => {
    session.send("Searching ...");
    session.sendTyping();

    if (!args) {
        return;
    }

    if (!args.query) {
        return;
    }

    // Start and wait for Search results.
    let searchResults = await fetchAzureSearchResults(args.query);

    // Process search results
    if (searchResults && searchResults.length > 0) {
        session.send("I found the following results...");
         
        session.send(attachments.buildResultsMessageWithAttachments(session, searchResults));
        return session.endDialog("Feel free to ask me another question.");
    } else {
        return session.endDialog('Sorry… couldnt find any results for your query! 🤐.');
    }
}




global.fetchAzureSearchResults = async (query) => {
    var searchResults = [];
    await azureSearchClient.get({ searchText: query.split(' ')[1] }, (err, res) => {
        
        if (err) {
                    console.error('Error from callback:', err);
                } else if (res && res.value.length > 0) {
                       for (var index = 0; index < res.value.length; index++) {
                        var val = res.value[index];
                        var result = {
                            title: val.brief_title,
                            body_markdown: val.brief_summary,
                            link: val.source
                        };
                        searchResults.push(result);
                    }

                           }
        });
    return searchResults;
}


// Dialogs
require('./dialogs/search')();